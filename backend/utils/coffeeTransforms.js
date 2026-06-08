const parseJsonIfPossible = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const normalizeStringArray = (value) => {
  if (!value) {
    return [];
  }

  const parsed = parseJsonIfPossible(value);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(parsed)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return fallback;
};

const normalizeUserCoffeeProfile = (source = {}) => ({
  brewingMethods: normalizeStringArray(source.brewingMethods),
  acidityTolerance: normalizeNumber(source.acidityTolerance, 3),
  roastPreference: source.roastPreference || "medium",
  beanPreference: source.beanPreference || "single-origin arabica",
  flavorNotes: normalizeStringArray(source.flavorNotes),
  preferredOrigins: normalizeStringArray(source.preferredOrigins),
  preferredEquipment: normalizeStringArray(source.preferredEquipment),
  dailyCups: normalizeNumber(source.dailyCups, 2),
});

const normalizeUserSubscription = (source = {}) => ({
  enabled: normalizeBoolean(source.enabled, false),
  reminderLeadDays: normalizeNumber(source.reminderLeadDays, 2),
});

const normalizeProductPayload = (source = {}) => {
  const price = normalizeNumber(source.price, 0);
  const basePrice = normalizeNumber(source.basePrice, price);

  return {
    name: source.name,
    image: source.image,
    brand: source.brand,
    quantity: normalizeNumber(source.quantity, 0),
    category: source.category,
    description: source.description,
    price,
    countInStock: normalizeNumber(source.countInStock, 0),
    productType: source.productType || "beans",
    beanProfile: {
      origin: source.origin || "",
      region: source.region || "",
      species: source.species || "arabica",
      roastLevel: source.roastLevel || "medium",
      acidity: normalizeNumber(source.acidity, 3),
      body: normalizeNumber(source.body, 3),
      processingMethod: source.processingMethod || "washed",
      tastingNotes: normalizeStringArray(source.tastingNotes),
      recommendedBrewingMethods: normalizeStringArray(source.recommendedBrewingMethods),
      gramsPerBag: normalizeNumber(source.gramsPerBag, 250),
      brewStyleBias: normalizeStringArray(source.brewStyleBias),
    },
    equipmentProfile: {
      equipmentType: source.equipmentType || "",
      material: source.material || "",
      supportedBrewingMethods: normalizeStringArray(source.supportedBrewingMethods),
    },
    interactiveModel: {
      enabled: normalizeBoolean(source.modelEnabled, false),
      modelType: source.modelType || "coffee-bag",
      accentColor: source.accentColor || "#d97706",
      hotspots: normalizeStringArray(source.hotspots).map((entry, index) => ({
        id: `hotspot-${index + 1}`,
        label: entry,
        description: `${entry} hotspot`,
        position: { x: index - 1, y: 0.5, z: 0.4 - index * 0.2 },
      })),
    },
    pricing: {
      basePrice,
      priceFloor: normalizeNumber(source.priceFloor, Number((basePrice * 0.8).toFixed(2))),
      priceCeiling: normalizeNumber(
        source.priceCeiling,
        Number((basePrice * 1.3).toFixed(2))
      ),
      currentPrice: price,
      elasticity: normalizeNumber(source.elasticity, 0.35),
    },
    marketing: {
      subscriptionEligible: normalizeBoolean(source.subscriptionEligible, true),
      featuredHeadline: source.featuredHeadline || "",
    },
  };
};

export {
  normalizeBoolean,
  normalizeNumber,
  normalizeProductPayload,
  normalizeStringArray,
  normalizeUserCoffeeProfile,
  normalizeUserSubscription,
};
