import mongoose from "mongoose";

const blindTastingEntrySchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sampleCode: String,
    guessedNotes: {
      type: [String],
      default: [],
    },
    guessedOrigin: {
      type: String,
      default: "",
    },
    guessedAcidity: {
      type: Number,
      default: 3,
    },
    guessedRoastLevel: {
      type: String,
      default: "medium",
    },
    actualNotes: {
      type: [String],
      default: [],
    },
    actualOrigin: {
      type: String,
      default: "",
    },
    actualAcidity: {
      type: Number,
      default: 3,
    },
    actualRoastLevel: {
      type: String,
      default: "medium",
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const blindTastingFeedbackSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challengeName: {
      type: String,
      default: "Blind Tasting Flight",
    },
    rewardScore: {
      type: Number,
      default: 0,
    },
    trainedAt: Date,
    modelType: {
      type: String,
      default: "not-run",
    },
    entries: {
      type: [blindTastingEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const BlindTastingFeedback = mongoose.model(
  "BlindTastingFeedback",
  blindTastingFeedbackSchema
);

export default BlindTastingFeedback;
