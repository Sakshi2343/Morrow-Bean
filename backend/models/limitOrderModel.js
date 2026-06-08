import mongoose from "mongoose";

const limitOrderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    qty: {
      type: Number,
      default: 1,
      min: 1,
    },
    targetPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["open", "executed", "cancelled", "failed"],
      default: "open",
    },
    lastObservedPrice: {
      type: Number,
      default: 0,
    },
    executedPrice: Number,
    executedAt: Date,
    notes: {
      type: String,
      default: "",
    },
    executedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

limitOrderSchema.index({ status: 1, product: 1, targetPrice: 1 });

const LimitOrder = mongoose.model("LimitOrder", limitOrderSchema);

export default LimitOrder;
