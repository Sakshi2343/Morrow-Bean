import Product from "../models/productModel.js";
import { evaluateLimitOrdersForProduct } from "./exchangeService.js";
import { broadcastMarketEvent } from "./marketStreamService.js";
import { queueRoastOrderReview } from "./roastOperationsService.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const average = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const buildFeatureWindows = (signals) => {
  const windows = [];

  for (let index = 3; index < signals.length; index += 1) {
    const history = signals.slice(Math.max(0, index - 3), index);
    const current = signals[index];
    windows.push({
      features: [
        average(history.map((entry) => entry.views)),
        average(history.map((entry) => entry.unitsSold)),
        average(history.map((entry) => entry.revenue)),
        current.views,
      ],
      target: current.unitsSold,
    });
  }

  return windows;
};

const trainRegression = (samples, iterations = 800, learningRate = 0.00005) => {
  const weights = [0, 0, 0, 0];
  let bias = 0;

  if (!samples.length) {
    return { weights, bias };
  }

  for (let step = 0; step < iterations; step += 1) {
    const gradients = [0, 0, 0, 0];
    let biasGradient = 0;

    samples.forEach(({ features, target }) => {
      const prediction =
        features.reduce((sum, feature, index) => sum + feature * weights[index], bias);
      const error = prediction - target;

      features.forEach((feature, index) => {
        gradients[index] += error * feature;
      });

      biasGradient += error;
    });

    weights.forEach((weight, index) => {
      weights[index] =
        weight - (learningRate * gradients[index]) / Math.max(samples.length, 1);
    });

    bias -= (learningRate * biasGradient) / Math.max(samples.length, 1);
  }

  return { weights, bias };
};

const predictUnits = (model, features) =>
  Math.max(
    0,
    features.reduce((sum, feature, index) => sum + feature * model.weights[index], model.bias)
  );

const getSignals = (product) => (product.analytics?.dailySignals || []).slice(-14);

const generatePricingRecommendation = (product) => {
  const signals = getSignals(product);
  const samples = buildFeatureWindows(signals);
  const regression = trainRegression(samples);
  const recentWindow = signals.slice(-3);
  const olderWindow = signals.slice(-7, -3);

  const features = [
    average(recentWindow.map((entry) => entry.views)),
    average(recentWindow.map((entry) => entry.unitsSold)),
    average(recentWindow.map((entry) => entry.revenue)),
    recentWindow[recentWindow.length - 1]?.views || 0,
  ];

  const predictedDailyDemand =
    samples.length >= 2
      ? predictUnits(regression, features)
      : average(recentWindow.map((entry) => entry.unitsSold)) || 0.5;
  const forecastDemand = Number((predictedDailyDemand * 7).toFixed(2));
  const basePrice = product.pricing?.basePrice || product.price;
  const floor = product.pricing?.priceFloor || Number((basePrice * 0.8).toFixed(2));
  const ceiling = product.pricing?.priceCeiling || Number((basePrice * 1.3).toFixed(2));
  const demandScore = clamp(
    predictedDailyDemand * 10 +
      average(recentWindow.map((entry) => entry.views)) * 0.2 +
      product.rating * 8,
    0,
    100
  );

  const currentVelocity = average(recentWindow.map((entry) => entry.unitsSold)) || 0.2;
  const stockCoverageDays = Number(
    (product.countInStock / Math.max(currentVelocity, 0.2)).toFixed(2)
  );
  const recentViews = average(recentWindow.map((entry) => entry.views));
  const olderViews = average(olderWindow.map((entry) => entry.views)) || recentViews || 1;
  const trafficMomentum = recentViews / Math.max(olderViews, 1);

  let recommendedPrice = product.price;
  let explanation = "Demand is stable, so the engine is holding price.";

  if (forecastDemand >= product.countInStock * 0.75 && trafficMomentum >= 1) {
    const surgePct = clamp(0.04 + (demandScore / 100) * 0.08, 0.04, 0.12);
    recommendedPrice = Math.min(ceiling, Number((basePrice * (1 + surgePct)).toFixed(2)));
    explanation =
      "Projected demand is compressing available stock, so the engine recommends a premium price.";
  } else if (stockCoverageDays > 28 && trafficMomentum < 0.95) {
    const discountPct = clamp(0.05 + (stockCoverageDays / 90) * 0.12, 0.05, 0.18);
    recommendedPrice = Math.max(floor, Number((basePrice * (1 - discountPct)).toFixed(2)));
    explanation =
      "Inventory is moving slowly relative to stock on hand, so the engine is proposing a flash-sale discount.";
  }

  const priceChangePct = Number(
    (((recommendedPrice - product.price) / Math.max(product.price, 1)) * 100).toFixed(2)
  );

  return {
    recommendedPrice,
    priceChangePct,
    forecastDemand,
    demandScore: Number(demandScore.toFixed(2)),
    stockCoverageDays,
    flashSaleEndsAt:
      recommendedPrice < product.price ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null,
    explanation,
  };
};

const upsertDailySignal = (product, patch) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  const signals = product.analytics?.dailySignals || [];
  const existing = signals.find((entry) => entry.dateKey === dateKey);

  if (existing) {
    existing.views += patch.views || 0;
    existing.unitsSold += patch.unitsSold || 0;
    existing.revenue += patch.revenue || 0;
  } else {
    signals.push({
      dateKey,
      views: patch.views || 0,
      unitsSold: patch.unitsSold || 0,
      revenue: patch.revenue || 0,
    });
  }

  product.analytics.dailySignals = signals.slice(-30);
};

const applyPricingRecommendation = async (product, { persistPrice = false } = {}) => {
  const recommendation = generatePricingRecommendation(product);
  product.pricing.lastRecommendation = {
    ...recommendation,
    generatedAt: new Date(),
  };
  product.pricing.currentPrice = product.price;
  product.pricing.flashSaleEndsAt = recommendation.flashSaleEndsAt;

  if (persistPrice && recommendation.recommendedPrice !== product.price) {
    product.pricing.priceChange24h = recommendation.priceChangePct;
    product.price = recommendation.recommendedPrice;
    product.pricing.currentPrice = recommendation.recommendedPrice;
  }

  await product.save();
  await evaluateLimitOrdersForProduct(product);
  await queueRoastOrderReview(product, recommendation);
  broadcastMarketEvent("price-update", {
    productId: product._id,
    name: product.name,
    currentPrice: product.price,
    recommendedPrice: recommendation.recommendedPrice,
    priceChangePct: recommendation.priceChangePct,
    forecastDemand: recommendation.forecastDemand,
    priceFloor: product.pricing?.priceFloor,
    priceCeiling: product.pricing?.priceCeiling,
    flashSaleEndsAt: recommendation.flashSaleEndsAt,
  });
  return recommendation;
};

const refreshDynamicPricing = async ({ productIds = [], persistPrice = true } = {}) => {
  const query = productIds.length
    ? { _id: { $in: productIds }, isCustomProduct: { $ne: true } }
    : { isCustomProduct: { $ne: true } };
  const products = await Product.find(query);
  const results = [];

  for (const product of products) {
    const recommendation = await applyPricingRecommendation(product, { persistPrice });
    results.push({
      productId: product._id,
      name: product.name,
      currentPrice: product.price,
      ...recommendation,
    });
  }

  return results;
};

export { applyPricingRecommendation, generatePricingRecommendation, refreshDynamicPricing, upsertDailySignal };
