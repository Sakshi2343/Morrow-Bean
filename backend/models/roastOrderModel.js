import mongoose from "mongoose";

const roastOrderSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "in-progress", "completed"],
      default: "queued",
    },
    forecastDemand: {
      type: Number,
      default: 0,
    },
    currentStock: {
      type: Number,
      default: 0,
    },
    batchSizeKg: {
      type: Number,
      default: 0,
    },
    warehouseBin: {
      type: String,
      default: "",
    },
    targetRoastAt: Date,
    freshnessDeadline: Date,
    priority: {
      type: String,
      enum: ["normal", "high", "critical"],
      default: "normal",
    },
    explanation: {
      type: String,
      default: "",
    },
    suggestedRoastProfile: {
      roastLevel: { type: String, default: "medium" },
      temperatureC: { type: Number, default: 204 },
      durationSeconds: { type: Number, default: 630 },
    },
  },
  { timestamps: true }
);

roastOrderSchema.index({ status: 1, targetRoastAt: 1 });

const RoastOrder = mongoose.model("RoastOrder", roastOrderSchema);

export default RoastOrder;
