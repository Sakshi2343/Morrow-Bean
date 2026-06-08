const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const roundCurrency = (value) => Number(value.toFixed(2));

const toTitle = (value = "") =>
  String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const shopCollections = [
  {
    id: "all",
    label: "All Products",
    description: "Beans, machines, brew tools, and gifting staples.",
  },
  {
    id: "coffee-beans",
    label: "Coffee Beans",
    description: "Single-origin and espresso-ready coffees for daily brewing.",
  },
  {
    id: "machines",
    label: "Machines",
    description: "Espresso machines for the home barista corner.",
  },
  {
    id: "brew-tools",
    label: "Brew Tools",
    description: "Grinders and manual gear for slower rituals.",
  },
  {
    id: "subscriptions",
    label: "Subscriptions & Gifts",
    description: "Recurring coffee deliveries and ready-made gift sets.",
  },
];

const beanColorOptions = [
  { value: "oat", label: "Oat", hex: "#d9c0a1" },
  { value: "clay", label: "Clay", hex: "#bf8555" },
  { value: "sage", label: "Sage", hex: "#8c9a7a" },
];

const robustaColorOptions = [
  { value: "walnut", label: "Walnut", hex: "#684735" },
  { value: "smoke", label: "Smoke", hex: "#85776d" },
  { value: "cacao", label: "Cacao", hex: "#4e3528" },
];

const machineColorOptions = [
  { value: "copper", label: "Copper", hex: "#b87147", priceOffset: 40 },
  { value: "cream", label: "Cream", hex: "#efe3d1" },
  { value: "black", label: "Matte Black", hex: "#2f2825", priceOffset: 20 },
];

const brewToolColorOptions = [
  { value: "sand", label: "Sand", hex: "#d2bda1" },
  { value: "charcoal", label: "Charcoal", hex: "#4f463f" },
  { value: "fern", label: "Fern", hex: "#6a7f63", priceOffset: 10 },
];

const subscriptionColorOptions = [
  { value: "linen", label: "Linen", hex: "#ece3d5" },
  { value: "cinnamon", label: "Cinnamon", hex: "#b97750" },
  { value: "moss", label: "Moss", hex: "#7d8461" },
];

const buildBeanSizes = (product) => {
  const baseGrams = Number(product.beanProfile?.gramsPerBag || 250);
  const grams = [...new Set([250, baseGrams, 500, 1000])]
    .filter((value) => value >= 250 && value <= 1000)
    .sort((left, right) => left - right);

  return grams.map((value) => {
    const ratio = value / baseGrams;
    const multiplier = value > baseGrams ? 0.92 : value < baseGrams ? 1.08 : 1;
    const price = roundCurrency(product.price * ratio * multiplier);
    return {
      value: `${value}g`,
      label: value >= 1000 ? "1 kg" : `${value} g`,
      price,
    };
  });
};

const buildEquipmentSizes = (product) => {
  const equipmentType = String(product.equipmentProfile?.equipmentType || "").toLowerCase();

  if (equipmentType.includes("espresso")) {
    return [
      { value: "compact", label: "Compact", price: roundCurrency(product.price * 0.9) },
      { value: "standard", label: "Standard", price: product.price },
      { value: "barista", label: "Barista", price: roundCurrency(product.price * 1.16) },
    ];
  }

  if (equipmentType.includes("grinder")) {
    return [
      { value: "travel", label: "Travel", price: roundCurrency(product.price * 0.88) },
      { value: "studio", label: "Studio", price: product.price },
      { value: "pro", label: "Pro", price: roundCurrency(product.price * 1.12) },
    ];
  }

  return [
    { value: "mini", label: "Mini", price: roundCurrency(product.price * 0.9) },
    { value: "standard", label: "Standard", price: product.price },
    { value: "countertop", label: "Countertop", price: roundCurrency(product.price * 1.08) },
  ];
};

const buildSubscriptionSizes = (product) => [
  { value: "monthly", label: "Monthly", price: product.price },
  { value: "fortnightly", label: "Fortnightly", price: roundCurrency(product.price * 1.3) },
  { value: "gift-box", label: "Gift Box", price: roundCurrency(product.price * 1.45) },
];

export const getCollectionId = (product = {}) => {
  const productType = String(product.productType || "").toLowerCase();
  const equipmentType = String(product.equipmentProfile?.equipmentType || "").toLowerCase();

  if (productType === "beans") {
    return "coffee-beans";
  }

  if (productType === "equipment" && equipmentType.includes("espresso")) {
    return "machines";
  }

  if (productType === "equipment") {
    return "brew-tools";
  }

  return "subscriptions";
};

export const getCollectionMeta = (product = {}) =>
  shopCollections.find((collection) => collection.id === getCollectionId(product)) || shopCollections[0];

export const getVariantOptions = (product = {}) => {
  const productType = String(product.productType || "").toLowerCase();
  const species = String(product.beanProfile?.species || "").toLowerCase();
  const collectionId = getCollectionId(product);

  let sizes = [{ value: "standard", label: "Standard", price: product.price }];
  let colors = subscriptionColorOptions;

  if (productType === "beans") {
    sizes = buildBeanSizes(product);
    colors = species.includes("robusta") ? robustaColorOptions : beanColorOptions;
  } else if (collectionId === "machines" || productType === "equipment") {
    sizes = buildEquipmentSizes(product);
    colors = collectionId === "machines" ? machineColorOptions : brewToolColorOptions;
  } else {
    sizes = buildSubscriptionSizes(product);
    colors = subscriptionColorOptions;
  }

  return { sizes, colors };
};

export const resolveVariantSelection = (product = {}, selection = {}) => {
  const options = getVariantOptions(product);
  const selectedSize =
    options.sizes.find((size) => size.value === selection.size) || options.sizes[1] || options.sizes[0];
  const selectedColor =
    options.colors.find((color) => color.value === selection.color) || options.colors[0];

  return {
    selectedSize,
    selectedColor,
    price: roundCurrency((selectedSize?.price || product.price || 0) + (selectedColor?.priceOffset || 0)),
    variantLabel: `${selectedSize?.label || "Standard"} / ${selectedColor?.label || "Default"}`,
    variantKey: `${product._id}:${selectedSize?.value || "standard"}:${selectedColor?.value || "default"}`,
  };
};

export const buildCartItem = (product = {}, selection = {}, qty = 1) => {
  const variant = resolveVariantSelection(product, selection);

  return {
    ...product,
    qty,
    price: variant.price,
    product: product._id,
    cartItemId: variant.variantKey,
    selectedSize: variant.selectedSize,
    selectedColor: variant.selectedColor,
    variantLabel: variant.variantLabel,
  };
};

export const getProductPricePreview = (product = {}) => {
  const { sizes, colors } = getVariantOptions(product);
  const prices = [];

  sizes.forEach((size) => {
    colors.forEach((color) => {
      prices.push(roundCurrency((size.price || product.price || 0) + (color.priceOffset || 0)));
    });
  });

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    min,
    max,
    label:
      min === max
        ? currencyFormatter.format(min)
        : `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`,
  };
};

export const getFormattedCurrency = (value) => currencyFormatter.format(Number(value || 0));

export const getProductSearchText = (product = {}) =>
  [
    product.name,
    product.brand,
    product.description,
    product.beanProfile?.origin,
    product.beanProfile?.region,
    product.beanProfile?.species,
    product.beanProfile?.roastLevel,
    ...(product.beanProfile?.tastingNotes || []),
    product.equipmentProfile?.equipmentType,
    product.category?.name,
    getCollectionMeta(product).label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const getProductFacts = (product = {}) => {
  if (String(product.productType || "").toLowerCase() === "beans") {
    return [
      product.beanProfile?.origin,
      product.beanProfile?.roastLevel ? `${toTitle(product.beanProfile.roastLevel)} roast` : "",
      product.beanProfile?.processingMethod,
    ].filter(Boolean);
  }

  return [
    product.equipmentProfile?.equipmentType,
    product.equipmentProfile?.material,
    getCollectionMeta(product).label,
  ].filter(Boolean);
};
