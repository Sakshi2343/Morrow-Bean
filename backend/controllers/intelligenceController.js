import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import LimitOrder from "../models/limitOrderModel.js";
import { refreshDynamicPricing, upsertDailySignal } from "../services/pricingEngineService.js";
import { getPersonalizedRecommendations } from "../services/recommendationService.js";
import { getConciergeResponse } from "../services/conciergeService.js";
import { createCustomRoastSku } from "../services/customRoastService.js";
import { getUserLimitOrders, placeLimitOrder } from "../services/exchangeService.js";
import { attachMarketStream } from "../services/marketStreamService.js";
import {
  getBlindTastingChallenge,
  submitBlindTastingFeedback,
} from "../services/blindTastingService.js";
import { getRoastOperationsSnapshot } from "../services/roastOperationsService.js";
import {
  getSmartSubscriptionPlan,
  getSubscriptionQueueSnapshot,
} from "../services/subscriptionService.js";

const getPersonalizedMatches = asyncHandler(async (req, res) => {
  const recommendations = await getPersonalizedRecommendations(req.user, 6);

  res.json({
    source: recommendations[0]?.source || "node-fallback",
    recommendations: recommendations.map((entry) => ({
      ...entry.product.toObject(),
      recommendationScore: entry.score,
      recommendationReasons: entry.reasons,
      recommendationSource: entry.source,
    })),
  });
});

const trackProductView = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.analytics.totalViews += 1;
  product.analytics.lastViewedAt = new Date();
  upsertDailySignal(product, { views: 1 });
  await product.save();

  res.status(200).json({ message: "View tracked" });
});

const getPricingInsight = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const openLimitOrders = await LimitOrder.countDocuments({
    product: product._id,
    status: "open",
  });

  res.json({
    ...(product.pricing?.lastRecommendation || {}),
    currentPrice: product.price,
    basePrice: product.pricing?.basePrice || product.price,
    priceFloor: product.pricing?.priceFloor || product.price,
    priceCeiling: product.pricing?.priceCeiling || product.price,
    flashSaleEndsAt: product.pricing?.flashSaleEndsAt || null,
    openLimitOrders,
  });
});

const streamMarketEvents = asyncHandler(async (req, res) => {
  attachMarketStream(req, res);
});

const submitLimitOrder = asyncHandler(async (req, res) => {
  const order = await placeLimitOrder({
    userId: req.user._id,
    productId: req.params.id,
    targetPrice: req.body?.targetPrice,
    qty: req.body?.qty || 1,
  });

  res.status(201).json(order);
});

const getMyLimitOrders = asyncHandler(async (req, res) => {
  const orders = await getUserLimitOrders(req.user._id);
  res.json(orders);
});

const chatWithConcierge = asyncHandler(async (req, res) => {
  const { message, preferences = {}, history = [] } = req.body || {};

  if (!message || !String(message).trim()) {
    res.status(400);
    throw new Error("A message is required for concierge chat.");
  }

  const response = await getConciergeResponse({
    message: String(message).trim(),
    preferences,
    history: Array.isArray(history) ? history : [],
  });

  res.json(response);
});

const createCustomRoast = asyncHandler(async (req, res) => {
  const { temperatureC, durationSeconds } = req.body || {};
  const product = await createCustomRoastSku({
    productId: req.params.id,
    temperatureC: Number(temperatureC || 205),
    durationSeconds: Number(durationSeconds || 630),
    userId: req.user?._id,
  });

  res.status(201).json(product);
});

const getBlindTastingFlight = asyncHandler(async (req, res) => {
  const challenge = await getBlindTastingChallenge();
  res.json(challenge);
});

const submitBlindTastingFlight = asyncHandler(async (req, res) => {
  const result = await submitBlindTastingFeedback({
    user: req.user,
    entries: Array.isArray(req.body?.entries) ? req.body.entries : [],
  });

  res.status(201).json(result);
});

const getSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await getSmartSubscriptionPlan(req.user._id);
  res.json(plan);
});

const runPricingEngine = asyncHandler(async (req, res) => {
  const persistPrice = Boolean(req.body?.persistPrice ?? true);
  const results = await refreshDynamicPricing({ persistPrice });

  res.json({
    updated: results.length,
    results,
  });
});

const getAdminIntelligenceDashboard = asyncHandler(async (req, res) => {
  const pricingCandidates = await Product.find({
    "pricing.lastRecommendation.generatedAt": { $exists: true },
  })
    .sort({ "pricing.lastRecommendation.generatedAt": -1 })
    .limit(8);
  const queueSnapshot = await getSubscriptionQueueSnapshot();
  const roastOps = await getRoastOperationsSnapshot();
  const openLimitOrders = await LimitOrder.countDocuments({ status: "open" });

  res.json({
    pricingCandidates: pricingCandidates.map((product) => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      countInStock: product.countInStock,
      recommendation: product.pricing.lastRecommendation,
      flashSaleEndsAt: product.pricing.flashSaleEndsAt,
    })),
    subscriptionQueue: queueSnapshot,
    roastOrders: roastOps.roastOrders,
    freshnessAlerts: roastOps.freshnessAlerts,
    summary: {
      activeFlashSales: pricingCandidates.filter((product) => product.pricing.flashSaleEndsAt)
        .length,
      pendingSubscriptionReminders: queueSnapshot.length,
      openLimitOrders,
      pendingRoastOrders: roastOps.roastOrders.length,
    },
  });
});

export {
  getAdminIntelligenceDashboard,
  getBlindTastingFlight,
  getMyLimitOrders,
  getPersonalizedMatches,
  getPricingInsight,
  chatWithConcierge,
  createCustomRoast,
  getSubscriptionPlan,
  streamMarketEvents,
  submitBlindTastingFlight,
  submitLimitOrder,
  runPricingEngine,
  trackProductView,
};
