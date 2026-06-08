import mongoose from "mongoose";

const jobSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "smart-subscription-reminder",
        "dynamic-pricing-refresh",
        "roast-order-generation",
      ],
    },
    status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "processing", "completed", "failed"],
    },
    runAt: {
      type: Date,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    lastError: String,
    processedAt: Date,
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, runAt: 1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
