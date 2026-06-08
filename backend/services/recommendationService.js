import Product from "../models/productModel.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const overlapScore = (left = [], right = []) => {
  if (!left.length || !right.length) {
    return 0;
  }

  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  const matches = left.filter((item) => rightSet.has(String(item).toLowerCase())).length;
  return matches / Math.max(left.length, right.length);
};

const fallbackRecommendationScore = (user, product) => {
  const userProfile = user.coffeeProfile || {};
  const beanProfile = product.beanProfile || {};
  const equipmentProfile = product.equipmentProfile || {};

  let score = product.rating * 10;
  const reasons = [];

  const brewOverlap = overlapScore(
    userProfile.brewingMethods || [],
    [
      ...(beanProfile.recommendedBrewingMethods || []),
      ...(equipmentProfile.supportedBrewingMethods || []),
    ]
  );

  if (brewOverlap > 0) {
    score += brewOverlap * 30;
    reasons.push("Matches your brewing methods");
  }

  const acidityDelta = Math.abs(
    Number(userProfile.acidityTolerance || 3) - Number(beanProfile.acidity || 3)
  );
  score += (5 - clamp(acidityDelta, 0, 5)) * 6;

  if (beanProfile.roastLevel && userProfile.roastPreference === beanProfile.roastLevel) {
    score += 20;
    reasons.push(`Aligned with your ${beanProfile.roastLevel} roast preference`);
  }

  if (
    userProfile.beanPreference &&
    beanProfile.species &&
    userProfile.beanPreference.toLowerCase().includes(beanProfile.species.toLowerCase())
  ) {
    score += 12;
    reasons.push(`Built around your ${beanProfile.species} preference`);
  }

  const noteOverlap = overlapScore(
    userProfile.flavorNotes || [],
    beanProfile.tastingNotes || []
  );

  if (noteOverlap > 0) {
    score += noteOverlap * 30;
    reasons.push("Shares tasting notes you tend to enjoy");
  }

  const originOverlap = overlapScore(
    userProfile.preferredOrigins || [],
    [beanProfile.origin, beanProfile.region].filter(Boolean)
  );

  if (originOverlap > 0) {
    score += originOverlap * 18;
    reasons.push("Comes from your preferred coffee origins");
  }

  if (product.productType === "equipment") {
    const equipmentMatch = overlapScore(
      userProfile.preferredEquipment || [],
      [equipmentProfile.equipmentType].filter(Boolean)
    );

    score += equipmentMatch * 20;
  }

  return {
    score: Number(score.toFixed(2)),
    reasons: reasons.slice(0, 3),
  };
};

const requestRemoteRecommendations = async (user, inventory) => {
  if (!process.env.RECOMMENDER_SERVICE_URL) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.RECOMMENDER_SERVICE_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_profile: user.coffeeProfile || {},
        inventory: inventory.map((product) => ({
          id: product._id.toString(),
          name: product.name,
          product_type: product.productType,
          price: product.price,
          rating: product.rating,
          bean_profile: product.beanProfile || {},
          equipment_profile: product.equipmentProfile || {},
          brewing_methods: [
            ...(product.beanProfile?.recommendedBrewingMethods || []),
            ...(product.equipmentProfile?.supportedBrewingMethods || []),
          ],
        })),
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};

const getPersonalizedRecommendations = async (user, limit = 6) => {
  const inventory = await Product.find({ isCustomProduct: { $ne: true } })
    .sort({ rating: -1, createdAt: -1 })
    .limit(30);
  const remote = await requestRemoteRecommendations(user, inventory);

  if (remote?.recommendations?.length) {
    const mapped = remote.recommendations
      .map((candidate) => {
        const product = inventory.find(
          (entry) => entry._id.toString() === String(candidate.product_id || candidate.id)
        );

        if (!product) {
          return null;
        }

        return {
          product,
          score: Number(candidate.score || 0),
          reasons: candidate.reasons || [],
          source: "xgboost-service",
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    if (mapped.length) {
      return mapped;
    }
  }

  return inventory
    .map((product) => {
      const result = fallbackRecommendationScore(user, product);
      return {
        product,
        ...result,
        source: "node-fallback",
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
};

export { fallbackRecommendationScore, getPersonalizedRecommendations };
