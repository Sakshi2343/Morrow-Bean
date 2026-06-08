import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const dailySignalSchema = mongoose.Schema(
  {
    dateKey: { type: String, required: true },
    views: { type: Number, default: 0 },
    unitsSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { _id: false }
);

const interactiveHotspotSchema = mongoose.Schema(
  {
    id: String,
    label: String,
    description: String,
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const customRoastSchema = mongoose.Schema(
  {
    isCustom: { type: Boolean, default: false },
    parentProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    temperatureC: { type: Number, default: 205 },
    durationSeconds: { type: Number, default: 630 },
    roastLevel: { type: String, default: "medium" },
    createdForUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    isCustomProduct: { type: Boolean, default: false },
    productType: {
      type: String,
      default: "beans",
      enum: ["beans", "equipment", "bundle", "subscription"],
    },
    beanProfile: {
      origin: { type: String, default: "" },
      region: { type: String, default: "" },
      species: { type: String, default: "arabica" },
      roastLevel: { type: String, default: "medium" },
      acidity: { type: Number, min: 1, max: 5, default: 3 },
      body: { type: Number, min: 1, max: 5, default: 3 },
      processingMethod: { type: String, default: "washed" },
      tastingNotes: { type: [String], default: [] },
      recommendedBrewingMethods: { type: [String], default: [] },
      gramsPerBag: { type: Number, default: 250 },
      brewStyleBias: { type: [String], default: [] },
    },
    equipmentProfile: {
      equipmentType: { type: String, default: "" },
      material: { type: String, default: "" },
      supportedBrewingMethods: { type: [String], default: [] },
    },
    interactiveModel: {
      enabled: { type: Boolean, default: false },
      modelType: {
        type: String,
        default: "coffee-bag",
        enum: [
          "coffee-bag",
          "espresso-machine",
          "manual-grinder",
          "dripper",
          "kettle",
        ],
      },
      accentColor: { type: String, default: "#d97706" },
      hotspots: { type: [interactiveHotspotSchema], default: [] },
    },
    pricing: {
      basePrice: { type: Number, default: 0 },
      priceFloor: { type: Number, default: 0 },
      priceCeiling: { type: Number, default: 0 },
      currentPrice: { type: Number, default: 0 },
      elasticity: { type: Number, default: 0.35 },
      priceChange24h: { type: Number, default: 0 },
      flashSaleEndsAt: Date,
      lastRecommendation: {
        recommendedPrice: Number,
        priceChangePct: Number,
        forecastDemand: Number,
        demandScore: Number,
        stockCoverageDays: Number,
        explanation: String,
        generatedAt: Date,
      },
    },
    analytics: {
      totalViews: { type: Number, default: 0 },
      totalUnitsSold: { type: Number, default: 0 },
      lastViewedAt: Date,
      lastPurchasedAt: Date,
      dailySignals: { type: [dailySignalSchema], default: [] },
    },
    marketing: {
      subscriptionEligible: { type: Boolean, default: true },
      featuredHeadline: { type: String, default: "" },
    },
    supplyChain: {
      warehouseBin: { type: String, default: "Roastery Rack A1" },
      roastLeadDays: { type: Number, default: 3 },
      freshnessWindowDays: { type: Number, default: 21 },
      decayRatePerDay: { type: Number, default: 4.5 },
      roastedAt: { type: Date, default: Date.now },
      nextRoastAt: Date,
      defaultRoastTemperatureC: { type: Number, default: 204 },
      defaultRoastDurationSeconds: { type: Number, default: 630 },
    },
    customization: {
      customRoastEligible: { type: Boolean, default: true },
      customRoastBasePrice: { type: Number, default: 0 },
    },
    customRoast: {
      type: customRoastSchema,
      default: () => ({}),
    },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre("save", function syncPricingFields(next) {
  if (!this.pricing.basePrice) {
    this.pricing.basePrice = this.price;
  }

  if (!this.pricing.currentPrice) {
    this.pricing.currentPrice = this.price;
  }

  if (!this.pricing.priceFloor) {
    this.pricing.priceFloor = Number((this.pricing.basePrice * 0.8).toFixed(2));
  }

  if (!this.pricing.priceCeiling) {
    this.pricing.priceCeiling = Number((this.pricing.basePrice * 1.3).toFixed(2));
  }

  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
