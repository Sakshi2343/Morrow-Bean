import Job from "../models/jobModel.js";
import Product from "../models/productModel.js";
import RoastOrder from "../models/roastOrderModel.js";
import { broadcastMarketEvent } from "./marketStreamService.js";

const getFreshnessSnapshot = (product) => {
  const roastedAt = product.supplyChain?.roastedAt || product.createdAt || new Date();
  const freshnessWindowDays = Number(product.supplyChain?.freshnessWindowDays || 21);
  const ageMs = Date.now() - new Date(roastedAt).getTime();
  const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
  const freshnessPct = Math.max(0, 100 - (ageDays / Math.max(freshnessWindowDays, 1)) * 100);

  return {
    roastedAt,
    ageDays: Number(ageDays.toFixed(1)),
    freshnessPct: Number(freshnessPct.toFixed(1)),
  };
};

const queueRoastOrderReview = async (product, recommendation = {}) => {
  if (product.productType !== "beans" || product.isCustomProduct) {
    return;
  }

  const shouldQueue =
    Number(recommendation.forecastDemand || 0) >= Number(product.countInStock || 0) * 0.7;

  if (!shouldQueue) {
    return;
  }

  const targetRoastAt = new Date(
    Date.now() + Number(product.supplyChain?.roastLeadDays || 3) * 24 * 60 * 60 * 1000
  );

  const existing = await Job.findOne({
    type: "roast-order-generation",
    status: { $in: ["pending", "processing"] },
    "payload.productId": product._id.toString(),
  });

  if (existing) {
    existing.payload = {
      ...existing.payload,
      recommendation,
      targetRoastAt,
    };
    await existing.save();
    return;
  }

  await Job.create({
    type: "roast-order-generation",
    runAt: new Date(),
    payload: {
      productId: product._id.toString(),
      recommendation,
      targetRoastAt,
    },
  });
};

const createRoastOrderFromPayload = async (payload = {}) => {
  const product = await Product.findById(payload.productId);

  if (!product) {
    return null;
  }

  const recommendation = payload.recommendation || product.pricing?.lastRecommendation || {};
  const targetRoastAt = new Date(
    payload.targetRoastAt ||
      Date.now() + Number(product.supplyChain?.roastLeadDays || 3) * 24 * 60 * 60 * 1000
  );

  const existing = await RoastOrder.findOne({
    product: product._id,
    status: { $in: ["queued", "in-progress"] },
  });

  const shortfallKg = Math.max(
    0,
    ((Number(recommendation.forecastDemand || 0) - Number(product.countInStock || 0)) *
      Number(product.beanProfile?.gramsPerBag || 250)) /
      1000
  );
  const batchSizeKg = Number(Math.max(shortfallKg, 5).toFixed(1));

  const payloadToPersist = {
    forecastDemand: Number(recommendation.forecastDemand || 0),
    currentStock: Number(product.countInStock || 0),
    batchSizeKg,
    warehouseBin: product.supplyChain?.warehouseBin || "Roastery Rack A1",
    targetRoastAt,
    freshnessDeadline: new Date(
      targetRoastAt.getTime() +
        Number(product.supplyChain?.freshnessWindowDays || 21) * 24 * 60 * 60 * 1000
    ),
    priority:
      Number(recommendation.forecastDemand || 0) > Number(product.countInStock || 0)
        ? "critical"
        : "high",
    explanation:
      recommendation.explanation ||
      "Forecast demand is compressing available fresh stock, so the roastery should schedule a new batch.",
    suggestedRoastProfile: {
      roastLevel: product.beanProfile?.roastLevel || "medium",
      temperatureC: Number(product.supplyChain?.defaultRoastTemperatureC || 204),
      durationSeconds: Number(product.supplyChain?.defaultRoastDurationSeconds || 630),
    },
  };

  const roastOrder = existing
    ? await RoastOrder.findByIdAndUpdate(existing._id, payloadToPersist, { new: true })
    : await RoastOrder.create({
        product: product._id,
        ...payloadToPersist,
      });

  broadcastMarketEvent("roast-order-created", {
    roastOrderId: roastOrder._id,
    productId: product._id,
    productName: product.name,
    batchSizeKg: roastOrder.batchSizeKg,
    targetRoastAt: roastOrder.targetRoastAt,
    warehouseBin: roastOrder.warehouseBin,
    priority: roastOrder.priority,
  });

  return roastOrder;
};

const getRoastOperationsSnapshot = async () => {
  const roastOrders = await RoastOrder.find({ status: { $in: ["queued", "in-progress"] } })
    .populate("product")
    .sort({ targetRoastAt: 1 })
    .limit(8);

  const products = await Product.find({
    productType: "beans",
    isCustomProduct: { $ne: true },
  }).limit(20);

  const freshnessAlerts = products
    .map((product) => ({
      product,
      freshness: getFreshnessSnapshot(product),
    }))
    .filter((entry) => entry.freshness.freshnessPct <= 45)
    .sort((left, right) => left.freshness.freshnessPct - right.freshness.freshnessPct)
    .slice(0, 6)
    .map((entry) => ({
      _id: entry.product._id,
      name: entry.product.name,
      freshnessPct: entry.freshness.freshnessPct,
      ageDays: entry.freshness.ageDays,
      warehouseBin: entry.product.supplyChain?.warehouseBin || "Roastery Rack A1",
    }));

  return {
    roastOrders: roastOrders.map((entry) => ({
      _id: entry._id,
      productId: entry.product?._id,
      name: entry.product?.name,
      batchSizeKg: entry.batchSizeKg,
      forecastDemand: entry.forecastDemand,
      currentStock: entry.currentStock,
      targetRoastAt: entry.targetRoastAt,
      warehouseBin: entry.warehouseBin,
      priority: entry.priority,
      status: entry.status,
    })),
    freshnessAlerts,
  };
};

export {
  createRoastOrderFromPayload,
  getFreshnessSnapshot,
  getRoastOperationsSnapshot,
  queueRoastOrderReview,
};
