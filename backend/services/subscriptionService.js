import Job from "../models/jobModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { getPersonalizedRecommendations } from "./recommendationService.js";

const BEAN_GRAMS_PER_CUP = 18;

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const estimateDailyGrams = (user, paidOrders) => {
  const profileCups = Number(user.coffeeProfile?.dailyCups || 2);
  const fallback = profileCups * BEAN_GRAMS_PER_CUP;

  if (paidOrders.length < 2) {
    return fallback;
  }

  const sorted = [...paidOrders].sort(
    (left, right) => new Date(left.paidAt) - new Date(right.paidAt)
  );

  let totalGrams = 0;
  let totalDays = 0;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    const daysBetween = Math.max(
      1,
      Math.round((new Date(current.paidAt) - new Date(previous.paidAt)) / (1000 * 60 * 60 * 24))
    );
    const gramsPurchased = previous.orderItems.reduce((sum, item) => {
      const gramsPerBag = item.product?.beanProfile?.gramsPerBag || 250;
      const isBeans = item.product?.productType === "beans";
      return sum + (isBeans ? gramsPerBag * item.qty : 0);
    }, 0);

    if (gramsPurchased > 0) {
      totalGrams += gramsPurchased;
      totalDays += daysBetween;
    }
  }

  return totalDays > 0 ? Number((totalGrams / totalDays).toFixed(2)) : fallback;
};

const buildPrefilledCart = async (user, latestBeanOrder) => {
  const recommendations = await getPersonalizedRecommendations(user, 3);
  const fallbackItems = latestBeanOrder.orderItems
    .filter((item) => item.product?.productType === "beans")
    .slice(0, 2)
    .map((item) => ({
      product: item.product._id,
      name: item.name,
      qty: item.qty,
      reason: "Restock your last bean order before you run out.",
    }));

  if (!recommendations.length) {
    return fallbackItems;
  }

  return recommendations.slice(0, 2).map(({ product, reasons }) => ({
    product: product._id,
    name: product.name,
    qty: 1,
    reason: reasons[0] || "Recommended by your flavor profile.",
  }));
};

const getSmartSubscriptionPlan = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const paidOrders = await Order.find({
    user: userId,
    isPaid: true,
  }).populate("orderItems.product");

  const beanOrders = paidOrders.filter((order) =>
    order.orderItems.some((item) => item.product?.productType === "beans")
  );

  if (!beanOrders.length) {
    return {
      enabled: user.smartSubscription?.enabled || false,
      estimatedDailyGrams: user.coffeeProfile?.dailyCups * BEAN_GRAMS_PER_CUP || 36,
      estimatedDaysRemaining: 0,
      estimatedRunOutDate: null,
      nextReminderAt: null,
      prefilledCart: [],
      message: "No paid coffee orders yet. Place an order to activate smart replenishment.",
    };
  }

  const latestBeanOrder = beanOrders.sort(
    (left, right) => new Date(right.paidAt) - new Date(left.paidAt)
  )[0];
  const dailyGrams = estimateDailyGrams(user, beanOrders);
  const latestBeans = latestBeanOrder.orderItems.filter(
    (item) => item.product?.productType === "beans"
  );
  const gramsPurchased = latestBeans.reduce(
    (sum, item) => sum + (item.product?.beanProfile?.gramsPerBag || 250) * item.qty,
    0
  );
  const daysRemaining = Math.max(1, Math.round(gramsPurchased / Math.max(dailyGrams, 1)));
  const runOutDate = addDays(latestBeanOrder.paidAt || latestBeanOrder.createdAt, daysRemaining);
  const leadDays = Number(user.smartSubscription?.reminderLeadDays || 2);
  const reminderAt = addDays(runOutDate, -leadDays);
  const prefilledCart = await buildPrefilledCart(user, latestBeanOrder);

  return {
    enabled: user.smartSubscription?.enabled || false,
    estimatedDailyGrams: dailyGrams,
    estimatedDaysRemaining: daysRemaining,
    estimatedRunOutDate: runOutDate,
    nextReminderAt: reminderAt,
    prefilledCart,
    message:
      "The smart subscription engine is forecasting your next replenishment window from past bean purchases.",
  };
};

const scheduleSmartSubscriptionForOrder = async (userId, orderId) => {
  const plan = await getSmartSubscriptionPlan(userId);
  const user = await User.findById(userId);

  if (!user || !user.smartSubscription?.enabled || !plan.nextReminderAt) {
    return plan;
  }

  user.smartSubscription.nextEstimatedRunOut = plan.estimatedRunOutDate;
  user.smartSubscription.nextReminderAt = plan.nextReminderAt;
  user.smartSubscription.pendingCart = plan.prefilledCart;
  await user.save();

  await Job.findOneAndUpdate(
    {
      type: "smart-subscription-reminder",
      "payload.userId": String(userId),
    },
    {
      type: "smart-subscription-reminder",
      status: "pending",
      runAt: plan.nextReminderAt,
      payload: {
        userId: String(userId),
        orderId: String(orderId),
        estimatedRunOutDate: plan.estimatedRunOutDate,
        prefilledCart: plan.prefilledCart,
      },
      attempts: 0,
      lastError: "",
      processedAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Order.findByIdAndUpdate(orderId, {
    consumptionForecast: {
      estimatedDailyGrams: plan.estimatedDailyGrams,
      estimatedDaysRemaining: plan.estimatedDaysRemaining,
      estimatedRunOutDate: plan.estimatedRunOutDate,
      reminderScheduledFor: plan.nextReminderAt,
    },
    smartSubscription: {
      status: "scheduled",
      prefilledCart: plan.prefilledCart,
    },
  });

  return plan;
};

const markSubscriptionJobDelivered = async (job) => {
  const user = await User.findById(job.payload.userId);

  if (!user) {
    return;
  }

  user.smartSubscription.lastNotificationAt = new Date();
  user.smartSubscription.pendingCart = job.payload.prefilledCart || [];
  await user.save();

  if (job.payload.orderId) {
    await Order.findByIdAndUpdate(job.payload.orderId, {
      "smartSubscription.status": "notified",
    });
  }
};

const getSubscriptionQueueSnapshot = async () => {
  const jobs = await Job.find({
    type: "smart-subscription-reminder",
    status: "pending",
  }).sort({ runAt: 1 });

  const userIds = jobs.map((job) => job.payload.userId);
  const users = await User.find({ _id: { $in: userIds } });
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return jobs.map((job) => {
    const user = userMap.get(String(job.payload.userId));
    return {
      jobId: job._id,
      userId: job.payload.userId,
      username: user?.username || "Unknown user",
      runAt: job.runAt,
      estimatedRunOutDate: job.payload.estimatedRunOutDate,
      cartSize: job.payload.prefilledCart?.length || 0,
      status: job.status,
    };
  });
};

export {
  getSmartSubscriptionPlan,
  getSubscriptionQueueSnapshot,
  markSubscriptionJobDelivered,
  scheduleSmartSubscriptionForOrder,
};
