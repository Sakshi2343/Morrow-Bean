import Product from "../models/productModel.js";

const roastPalette = {
  light: "#d8a86c",
  medium: "#9a633a",
  "medium-dark": "#6f4328",
  dark: "#47291c",
};

const inferRoastLevel = (temperatureC, durationSeconds) => {
  const intensity = Number(temperatureC) + Number(durationSeconds) / 10;

  if (intensity < 260) {
    return "light";
  }

  if (intensity < 285) {
    return "medium";
  }

  if (intensity < 305) {
    return "medium-dark";
  }

  return "dark";
};

const tastingBiasForRoast = (roastLevel) => {
  if (roastLevel === "light") {
    return ["citrus", "floral", "tea-like"];
  }

  if (roastLevel === "medium-dark") {
    return ["cocoa", "caramel", "syrupy"];
  }

  if (roastLevel === "dark") {
    return ["molasses", "dark chocolate", "smoke"];
  }

  return ["caramel", "balanced", "stone fruit"];
};

const createCustomRoastSku = async ({
  productId,
  temperatureC,
  durationSeconds,
  userId,
}) => {
  const baseProduct = await Product.findById(productId);

  if (!baseProduct) {
    throw new Error("Base product not found");
  }

  const roastLevel = inferRoastLevel(temperatureC, durationSeconds);
  const customPrice = Number(
    (
      Number(baseProduct.price || 0) +
      6 +
      Math.max(0, Number(durationSeconds || 0) - 600) * 0.01
    ).toFixed(2)
  );

  const customProduct = await Product.create({
    name: `${baseProduct.name} Custom Roast Lab`,
    image: baseProduct.image,
    brand: baseProduct.brand,
    quantity: 0,
    category: baseProduct.category,
    description: `A made-to-order roast configured at ${temperatureC}C for ${durationSeconds}s in the virtual roastery lab.`,
    isCustomProduct: true,
    productType: "beans",
    beanProfile: {
      ...(baseProduct.beanProfile?.toObject?.() || baseProduct.beanProfile || {}),
      roastLevel,
      tastingNotes: tastingBiasForRoast(roastLevel),
    },
    interactiveModel: {
      ...(baseProduct.interactiveModel?.toObject?.() || baseProduct.interactiveModel || {}),
      accentColor: roastPalette[roastLevel] || roastPalette.medium,
    },
    marketing: {
      subscriptionEligible: false,
      featuredHeadline: `Custom roast generated in the WebGL lab at ${temperatureC}C / ${durationSeconds}s.`,
    },
    supplyChain: {
      ...(baseProduct.supplyChain?.toObject?.() || baseProduct.supplyChain || {}),
      roastedAt: new Date(),
    },
    customization: {
      customRoastEligible: false,
      customRoastBasePrice: customPrice,
    },
    customRoast: {
      isCustom: true,
      parentProduct: baseProduct._id,
      temperatureC: Number(temperatureC),
      durationSeconds: Number(durationSeconds),
      roastLevel,
      createdForUser: userId,
    },
    pricing: {
      ...(baseProduct.pricing?.toObject?.() || baseProduct.pricing || {}),
      basePrice: customPrice,
      currentPrice: customPrice,
      priceFloor: Number((customPrice * 0.9).toFixed(2)),
      priceCeiling: Number((customPrice * 1.1).toFixed(2)),
    },
    reviews: [],
    rating: baseProduct.rating,
    numReviews: 0,
    price: customPrice,
    countInStock: 1,
  });

  return customProduct;
};

export { createCustomRoastSku, inferRoastLevel };
