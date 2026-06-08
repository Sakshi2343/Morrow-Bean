import mongoose from "mongoose";

const smartSubscriptionCartItemSchema = mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    qty: Number,
    reason: String,
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    consumptionForecast: {
      estimatedDailyGrams: { type: Number, default: 0 },
      estimatedDaysRemaining: { type: Number, default: 0 },
      estimatedRunOutDate: Date,
      reminderScheduledFor: Date,
    },

    smartSubscription: {
      status: {
        type: String,
        default: "inactive",
        enum: ["inactive", "scheduled", "notified"],
      },
      prefilledCart: {
        type: [smartSubscriptionCartItemSchema],
        default: [],
      },
    },
    source: {
      type: String,
      default: "checkout",
      enum: ["checkout", "limit-order"],
    },
    exchangeExecution: {
      limitOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LimitOrder",
      },
      targetPrice: Number,
      executedPrice: Number,
      reservedInventory: { type: Boolean, default: false },
      status: {
        type: String,
        default: "none",
        enum: ["none", "reserved", "settled"],
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
