import Job from "../models/jobModel.js";
import { refreshDynamicPricing } from "./pricingEngineService.js";
import { createRoastOrderFromPayload } from "./roastOperationsService.js";
import { markSubscriptionJobDelivered } from "./subscriptionService.js";

let workerHandle;
let workerRunning = false;
let lastMarketSweepAt = 0;

const processJob = async (job) => {
  if (job.type === "smart-subscription-reminder") {
    await markSubscriptionJobDelivered(job);
  }

  if (job.type === "dynamic-pricing-refresh") {
    await refreshDynamicPricing({
      productIds: job.payload.productIds || [],
      persistPrice: true,
    });
  }

  if (job.type === "roast-order-generation") {
    await createRoastOrderFromPayload(job.payload);
  }
};

const tick = async () => {
  if (workerRunning) {
    return;
  }

  workerRunning = true;

  try {
    const pendingJobs = await Job.find({
      status: "pending",
      runAt: { $lte: new Date() },
    })
      .sort({ runAt: 1 })
      .limit(10);

    for (const job of pendingJobs) {
      try {
        job.status = "processing";
        job.attempts += 1;
        await job.save();

        await processJob(job);

        job.status = "completed";
        job.processedAt = new Date();
        job.lastError = "";
        await job.save();
      } catch (error) {
        job.status = job.attempts >= job.maxAttempts ? "failed" : "pending";
        job.lastError = error.message;
        await job.save();
      }
    }

    const sweepIntervalMs = Number(process.env.MARKET_SWEEP_INTERVAL_MS || 5 * 60 * 1000);
    if (Date.now() - lastMarketSweepAt >= sweepIntervalMs) {
      await refreshDynamicPricing({ persistPrice: true });
      lastMarketSweepAt = Date.now();
    }
  } finally {
    workerRunning = false;
  }
};

const startIntelligenceWorker = () => {
  if (workerHandle) {
    return;
  }

  workerHandle = setInterval(() => {
    tick().catch((error) => {
      console.error(`Intelligence worker tick failed: ${error.message}`);
    });
  }, Number(process.env.INTELLIGENCE_WORKER_INTERVAL_MS || 60000));
};

export { startIntelligenceWorker, tick as runIntelligenceWorkerTick };
