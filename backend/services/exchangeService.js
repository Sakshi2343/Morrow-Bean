import LimitOrder from "../models/limitOrderModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { broadcastMarketEvent } from "./marketStreamService.js";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const calcPrices = (orderItems) => {
  const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

const placeLimitOrder = async ({ userId, productId, targetPrice, qty = 1 }) => {
  const product = await Product.findById(productId);
  const normalizedTargetPrice = toNumber(targetPrice, -1);

  if (!product) {
    throw new Error("Product not found");
  }

  if (normalizedTargetPrice <= 0) {
    throw new Error("A valid target price is required");
  }

  const order = await LimitOrder.create({
    user: userId,
    product: product._id,
    targetPrice: normalizedTargetPrice,
    qty: Math.max(1, toNumber(qty, 1)),
    lastObservedPrice: product.price,
    notes: `Watching ${product.name} for a drop to $${normalizedTargetPrice.toFixed(2)}.`,
  });

  broadcastMarketEvent("limit-order-placed", {
    limitOrderId: order._id,
    productId: product._id,
    productName: product.name,
    targetPrice: order.targetPrice,
    qty: order.qty,
  });

  return order.populate("product");
};

const getUserLimitOrders = async (userId) =>
  LimitOrder.find({ user: userId }).populate("product").sort({ createdAt: -1 });

const buildFallbackShippingAddress = () => ({
  address: "Exchange Hold Vault",
  city: "Pending",
  postalCode: "000000",
  country: "To be confirmed",
});

const executeLimitOrder = async (limitOrder, product) => {
  const userId = limitOrder.user;
  const latestOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });

  const orderItems = [
    {
      name: product.name,
      qty: limitOrder.qty,
      image: product.image,
      price: product.price,
      product: product._id,
    },
  ];

  const totals = calcPrices(orderItems);
  const createdOrder = await Order.create({
    user: userId,
    orderItems,
    shippingAddress: latestOrder?.shippingAddress || buildFallbackShippingAddress(),
    paymentMethod: latestOrder?.paymentMethod || "Limit Order Auto-Reservation",
    ...totals,
    source: "limit-order",
    exchangeExecution: {
      limitOrder: limitOrder._id,
      targetPrice: limitOrder.targetPrice,
      executedPrice: product.price,
      reservedInventory: true,
      status: "reserved",
    },
  });

  product.countInStock = Math.max(0, Number(product.countInStock || 0) - limitOrder.qty);
  await product.save();

  limitOrder.status = "executed";
  limitOrder.executedAt = new Date();
  limitOrder.executedPrice = product.price;
  limitOrder.lastObservedPrice = product.price;
  limitOrder.executedOrder = createdOrder._id;
  limitOrder.notes = `Executed when ${product.name} reached $${Number(product.price).toFixed(2)}.`;
  await limitOrder.save();

  broadcastMarketEvent("limit-order-executed", {
    limitOrderId: limitOrder._id,
    orderId: createdOrder._id,
    productId: product._id,
    productName: product.name,
    executedPrice: product.price,
    targetPrice: limitOrder.targetPrice,
    qty: limitOrder.qty,
  });

  return createdOrder;
};

const evaluateLimitOrdersForProduct = async (product) => {
  const openOrders = await LimitOrder.find({
    product: product._id,
    status: "open",
    targetPrice: { $gte: Number(product.price || 0) },
  }).sort({ createdAt: 1 });

  for (const limitOrder of openOrders) {
    if (Number(product.countInStock || 0) < limitOrder.qty) {
      limitOrder.status = "failed";
      limitOrder.notes = "The price target was met, but the item ran out of reservable inventory.";
      await limitOrder.save();
      continue;
    }

    await executeLimitOrder(limitOrder, product);
  }
};

export { evaluateLimitOrdersForProduct, getUserLimitOrders, placeLimitOrder };
