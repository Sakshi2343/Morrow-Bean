import Product from "../models/productModel.js";
import BlindTastingFeedback from "../models/blindTastingFeedbackModel.js";

const originPool = ["ethiopia", "colombia", "india", "brazil", "kenya", "guatemala"];
const notePool = [
  "citrus",
  "berry",
  "chocolate",
  "caramel",
  "floral",
  "nutty",
  "stone fruit",
  "jasmine",
];

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const overlapScore = (left = [], right = []) => {
  if (!left.length || !right.length) {
    return 0;
  }

  const rightSet = new Set(right.map((entry) => String(entry).toLowerCase()));
  const matches = left.filter((entry) => rightSet.has(String(entry).toLowerCase())).length;
  return matches / Math.max(left.length, right.length);
};

const getBlindTastingChallenge = async () => {
  const beans = await Product.find({
    productType: "beans",
    isCustomProduct: { $ne: true },
  })
    .sort({ rating: -1, createdAt: -1 })
    .limit(12);

  const selected = shuffle(beans).slice(0, 4);

  return {
    challengeName: "Blind Tasting Flight",
    noteOptions: notePool,
    originOptions: originPool,
    samples: selected.map((product, index) => ({
      productId: product._id,
      sampleCode: `Cup ${String.fromCharCode(65 + index)}`,
      brewMethod:
        product.beanProfile?.recommendedBrewingMethods?.[0] || "pour-over",
      roastHint: product.beanProfile?.roastLevel || "medium",
      bagSize: product.beanProfile?.gramsPerBag || 250,
    })),
  };
};

const buildTrainingRows = (user, records) =>
  records.map((entry) => ({
    user_profile: user.coffeeProfile || {},
    item: {
      id: entry.product._id.toString(),
      name: entry.product.name,
      product_type: entry.product.productType,
      price: entry.product.price,
      rating: entry.product.rating,
      bean_profile: entry.product.beanProfile || {},
      equipment_profile: entry.product.equipmentProfile || {},
      brewing_methods: entry.product.beanProfile?.recommendedBrewingMethods || [],
    },
    purchased: Number((entry.score / 100).toFixed(2)),
    rating_signal: Number((entry.score / 100).toFixed(2)),
  }));

const trainFlavorMatcherFromBlindTasting = async (user, records) => {
  if (!process.env.RECOMMENDER_SERVICE_URL) {
    return { trained: false, modelType: "offline-fallback" };
  }

  try {
    const response = await fetch(`${process.env.RECOMMENDER_SERVICE_URL}/train`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rows: buildTrainingRows(user, records),
      }),
    });

    if (!response.ok) {
      return { trained: false, modelType: "remote-error" };
    }

    const payload = await response.json();
    return {
      trained: Boolean(payload.trained),
      modelType: payload.model_type || "remote",
    };
  } catch (error) {
    return { trained: false, modelType: "remote-error" };
  }
};

const submitBlindTastingFeedback = async ({ user, entries = [] }) => {
  const products = await Product.find({
    _id: { $in: entries.map((entry) => entry.productId) },
  });

  const records = entries
    .map((entry) => {
      const product = products.find(
        (candidate) => candidate._id.toString() === String(entry.productId)
      );

      if (!product) {
        return null;
      }

      const noteScore = overlapScore(entry.guessedNotes || [], product.beanProfile?.tastingNotes || []);
      const originScore =
        String(entry.guessedOrigin || "").toLowerCase() ===
        String(product.beanProfile?.origin || "").toLowerCase()
          ? 1
          : 0;
      const roastScore =
        String(entry.guessedRoastLevel || "").toLowerCase() ===
        String(product.beanProfile?.roastLevel || "").toLowerCase()
          ? 1
          : 0;
      const acidityDistance = Math.abs(
        Number(entry.guessedAcidity || 3) - Number(product.beanProfile?.acidity || 3)
      );
      const acidityScore = Math.max(0, 1 - acidityDistance / 5);
      const score = Number(
        ((noteScore * 0.45 + originScore * 0.2 + roastScore * 0.15 + acidityScore * 0.2) * 100).toFixed(1)
      );

      return {
        product,
        sampleCode: entry.sampleCode,
        guessedNotes: entry.guessedNotes || [],
        guessedOrigin: entry.guessedOrigin || "",
        guessedAcidity: Number(entry.guessedAcidity || 3),
        guessedRoastLevel: entry.guessedRoastLevel || "medium",
        actualNotes: product.beanProfile?.tastingNotes || [],
        actualOrigin: product.beanProfile?.origin || "",
        actualAcidity: Number(product.beanProfile?.acidity || 3),
        actualRoastLevel: product.beanProfile?.roastLevel || "medium",
        score,
      };
    })
    .filter(Boolean);

  const training = await trainFlavorMatcherFromBlindTasting(user, records);
  const rewardScore = Number(
    (
      records.reduce((sum, entry) => sum + Number(entry.score || 0), 0) /
      Math.max(records.length, 1)
    ).toFixed(1)
  );

  const feedback = await BlindTastingFeedback.create({
    user: user._id,
    challengeName: "Blind Tasting Flight",
    rewardScore,
    trainedAt: training.trained ? new Date() : undefined,
    modelType: training.modelType,
    entries: records.map((entry) => ({
      product: entry.product._id,
      sampleCode: entry.sampleCode,
      guessedNotes: entry.guessedNotes,
      guessedOrigin: entry.guessedOrigin,
      guessedAcidity: entry.guessedAcidity,
      guessedRoastLevel: entry.guessedRoastLevel,
      actualNotes: entry.actualNotes,
      actualOrigin: entry.actualOrigin,
      actualAcidity: entry.actualAcidity,
      actualRoastLevel: entry.actualRoastLevel,
      score: entry.score,
    })),
  });

  return {
    submissionId: feedback._id,
    rewardScore,
    trained: training.trained,
    modelType: training.modelType,
    results: records.map((entry) => ({
      productId: entry.product._id,
      name: entry.product.name,
      sampleCode: entry.sampleCode,
      score: entry.score,
      actualOrigin: entry.actualOrigin,
      actualNotes: entry.actualNotes,
      actualRoastLevel: entry.actualRoastLevel,
    })),
  };
};

export { getBlindTastingChallenge, submitBlindTastingFeedback };
