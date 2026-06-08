import Product from "../models/productModel.js";
import { fallbackRecommendationScore } from "./recommendationService.js";
import { chatWithOllama } from "./ollamaService.js";

const brewMethods = [
  "espresso",
  "aeropress",
  "pour-over",
  "french press",
  "cold brew",
  "moka pot",
];

const flavorNotes = [
  "chocolate",
  "caramel",
  "citrus",
  "berry",
  "floral",
  "nutty",
  "stone fruit",
  "jasmine",
  "orange",
];

const origins = ["ethiopia", "colombia", "brazil", "kenya", "sumatra", "guatemala"];
const equipmentTerms = ["espresso machine", "aeropress", "grinder", "dripper", "kettle"];
const roastLevels = ["light", "medium-light", "medium", "medium-dark", "dark"];

const normalizeList = (value) =>
  Array.isArray(value)
    ? value.map((entry) => String(entry).trim()).filter(Boolean)
    : [];

const includesAny = (haystack, candidates) =>
  candidates.filter((candidate) => haystack.includes(candidate));

const buildPreferenceHints = (message = "") => {
  const normalized = String(message).toLowerCase();
  const brewingMatches = includesAny(normalized, brewMethods);
  const noteMatches = includesAny(normalized, flavorNotes);
  const originMatches = includesAny(normalized, origins);
  const roastMatch = roastLevels.find((entry) => normalized.includes(entry)) || "";
  const equipmentMatches = includesAny(normalized, equipmentTerms);
  const beanPreference = normalized.includes("robusta")
    ? "robusta"
    : normalized.includes("arabica")
      ? "arabica"
      : "";

  return {
    brewingMethods: brewingMatches,
    flavorNotes: noteMatches,
    preferredOrigins: originMatches,
    preferredEquipment: equipmentMatches,
    roastPreference: roastMatch,
    beanPreference,
  };
};

const mergeProfile = (preferences = {}, hints = {}) => ({
  brewingMethods: normalizeList(preferences.brewingMethods).length
    ? normalizeList(preferences.brewingMethods)
    : hints.brewingMethods || [],
  acidityTolerance: Number(preferences.acidityTolerance || 3),
  roastPreference: preferences.roastPreference || hints.roastPreference || "medium",
  beanPreference: preferences.beanPreference || hints.beanPreference || "single-origin arabica",
  flavorNotes: normalizeList(preferences.flavorNotes).length
    ? normalizeList(preferences.flavorNotes)
    : hints.flavorNotes || [],
  preferredOrigins: normalizeList(preferences.preferredOrigins).length
    ? normalizeList(preferences.preferredOrigins)
    : hints.preferredOrigins || [],
  preferredEquipment: normalizeList(preferences.preferredEquipment).length
    ? normalizeList(preferences.preferredEquipment)
    : hints.preferredEquipment || [],
  dailyCups: Number(preferences.dailyCups || 2),
});

const keywordBoost = (product, message) => {
  const normalized = String(message).toLowerCase();
  let boost = 0;

  const searchable = [
    product.name,
    product.brand,
    product.productType,
    product.beanProfile?.origin,
    product.beanProfile?.species,
    product.beanProfile?.roastLevel,
    ...(product.beanProfile?.tastingNotes || []),
    ...(product.beanProfile?.recommendedBrewingMethods || []),
    product.equipmentProfile?.equipmentType,
    ...(product.equipmentProfile?.supportedBrewingMethods || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (normalized.includes("under $") || normalized.includes("budget")) {
    if (product.price <= 30) {
      boost += 12;
    }
  }

  if (normalized.includes("premium") || normalized.includes("best")) {
    boost += product.rating * 1.5;
  }

  if (normalized.includes("machine") && product.productType === "equipment") {
    boost += 15;
  }

  const tokens = normalized.split(/[^a-z0-9]+/).filter((entry) => entry.length > 2);
  tokens.forEach((token) => {
    if (searchable.includes(token)) {
      boost += 2;
    }
  });

  return boost;
};

const buildFallbackReply = ({ message, recommendations, profile }) => {
  const lead = recommendations[0];
  const methods = profile.brewingMethods.length ? profile.brewingMethods.join(", ") : "your brew style";
  const notes = profile.flavorNotes.length ? profile.flavorNotes.join(", ") : "balanced flavor notes";

  if (!lead) {
    return "I couldn't find a strong match yet, but try broadening the roast level or brew method and I’ll refine the shortlist.";
  }

  return `For ${methods}, I’d start with ${lead.name}. It lines up well with ${notes}, and I added a few nearby matches so you can compare beans and gear without guessing.`;
};

const requestConciergeCopy = async ({ message, history, recommendations, profile }) => {
  try {
    const inventorySummary = recommendations.map((product) => ({
      name: product.name,
      price: product.price,
      type: product.productType,
      reasons: product.recommendationReasons || [],
    }));

    const content = await chatWithOllama({
      messages: [
        {
          role: "system",
          content:
            "You are a warm coffee roastery shopping concierge. Only recommend products from the provided shortlist. Be concise, practical, and specific. Keep the answer under 120 words.",
        },
        ...history.slice(-4),
        {
          role: "user",
          content: JSON.stringify({
            shopper_request: message,
            shopper_profile: profile,
            shortlist: inventorySummary,
            instruction:
              "Write a short recommendation message that references 2 or 3 products from the shortlist and explains why they fit.",
          }),
        },
      ],
    });

    return content || "";
  } catch (error) {
    return "";
  }
};

const getConciergeResponse = async ({
  message,
  preferences = {},
  history = [],
  limit = 4,
}) => {
  const hints = buildPreferenceHints(message);
  const profile = mergeProfile(preferences, hints);
  const user = { coffeeProfile: profile };
  const inventory = await Product.find({}).sort({ rating: -1, createdAt: -1 }).limit(40);

  const ranked = inventory
    .map((product) => {
      const base = fallbackRecommendationScore(user, product);
      const score = Number((base.score + keywordBoost(product, message)).toFixed(2));

      return {
        product,
        score,
        reasons: base.reasons.length
          ? base.reasons
          : [
              product.productType === "equipment"
                ? "Fits your brewing setup"
                : "Aligned with the profile described in chat",
            ],
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);

  const recommendations = ranked.map((entry) => ({
    ...entry.product.toObject(),
    recommendationScore: entry.score,
    recommendationReasons: entry.reasons,
  }));

  const reply =
    (await requestConciergeCopy({
      message,
      history,
      recommendations,
      profile,
    })) || buildFallbackReply({ message, recommendations, profile });

  return {
    reply,
    recommendations,
    source: reply ? "ollama-or-fallback" : "fallback",
    inferredPreferences: hints,
    profile,
  };
};

export { getConciergeResponse };
