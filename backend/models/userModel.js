import mongoose from "mongoose";

const coffeeProfileSchema = mongoose.Schema(
  {
    brewingMethods: {
      type: [String],
      default: [],
    },
    acidityTolerance: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    roastPreference: {
      type: String,
      default: "medium",
    },
    beanPreference: {
      type: String,
      default: "single-origin arabica",
    },
    flavorNotes: {
      type: [String],
      default: [],
    },
    preferredOrigins: {
      type: [String],
      default: [],
    },
    preferredEquipment: {
      type: [String],
      default: [],
    },
    dailyCups: {
      type: Number,
      min: 0,
      default: 2,
    },
  },
  { _id: false }
);

const smartSubscriptionSchema = mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    reminderLeadDays: {
      type: Number,
      min: 1,
      default: 2,
    },
    nextEstimatedRunOut: Date,
    nextReminderAt: Date,
    pendingCart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        qty: Number,
        reason: String,
      },
    ],
    lastNotificationAt: Date,
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },

    coffeeProfile: {
      type: coffeeProfileSchema,
      default: () => ({}),
    },

    smartSubscription: {
      type: smartSubscriptionSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
