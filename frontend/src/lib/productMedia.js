const fallbackPalette = {
  frame: "#2d1a12",
  surface: "#f3e7d3",
  accent: "#c47a3f",
  accentSoft: "#8f5d35",
  detail: "#5b3824",
  text: "#20120d",
};

const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

const truncate = (value = "", max = 26) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value;

const toTitleCase = (value = "") =>
  String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const detectArtworkKind = (product = {}) => {
  const productType = String(product.productType || "").toLowerCase();
  const equipmentType = String(product.equipmentProfile?.equipmentType || "").toLowerCase();
  const species = String(product.beanProfile?.species || "").toLowerCase();
  const name = String(product.name || "").toLowerCase();

  if (productType === "equipment") {
    if (equipmentType.includes("espresso") || name.includes("espresso machine")) {
      return "espresso-machine";
    }

    if (equipmentType.includes("aeropress") || name.includes("aeropress")) {
      return "aeropress";
    }

    if (equipmentType.includes("grinder") || name.includes("grinder")) {
      return "grinder";
    }

    if (
      equipmentType.includes("dripper") ||
      equipmentType.includes("pour") ||
      name.includes("dripper")
    ) {
      return "dripper";
    }

    if (equipmentType.includes("kettle") || name.includes("kettle")) {
      return "kettle";
    }
  }

  if (productType === "subscription" || productType === "bundle") {
    return "subscription";
  }

  if (species.includes("robusta") || name.includes("robusta")) {
    return "robusta-beans";
  }

  return "arabica-beans";
};

const palettes = {
  "arabica-beans": {
    frame: "#2f1a11",
    surface: "#f2e4d1",
    accent: "#be7a48",
    accentSoft: "#e9c49c",
    detail: "#6a4128",
    text: "#2a1a12",
  },
  "robusta-beans": {
    frame: "#241611",
    surface: "#efe0ce",
    accent: "#6f4a31",
    accentSoft: "#a97852",
    detail: "#3b2418",
    text: "#1c120d",
  },
  "espresso-machine": {
    frame: "#211611",
    surface: "#f2e8d8",
    accent: "#b75f2d",
    accentSoft: "#d6b08d",
    detail: "#4a2d20",
    text: "#20120d",
  },
  aeropress: {
    frame: "#1f1713",
    surface: "#f0e5d6",
    accent: "#8c5a34",
    accentSoft: "#d5b089",
    detail: "#3b281d",
    text: "#1f140f",
  },
  dripper: {
    frame: "#231510",
    surface: "#f6eadc",
    accent: "#cb7f41",
    accentSoft: "#ecc69a",
    detail: "#553220",
    text: "#25160f",
  },
  grinder: {
    frame: "#261712",
    surface: "#efe1cf",
    accent: "#9a633a",
    accentSoft: "#d7b089",
    detail: "#44291c",
    text: "#21140f",
  },
  kettle: {
    frame: "#231611",
    surface: "#f4e5d5",
    accent: "#bc6b36",
    accentSoft: "#e4bc92",
    detail: "#513122",
    text: "#20130f",
  },
  subscription: {
    frame: "#241611",
    surface: "#f4e8db",
    accent: "#ad6f3c",
    accentSoft: "#dcb48b",
    detail: "#4b2d20",
    text: "#20120d",
  },
};

const svgShapes = {
  "arabica-beans": (palette) => `
    <ellipse cx="158" cy="165" rx="48" ry="76" fill="${palette.accent}" />
    <ellipse cx="250" cy="150" rx="50" ry="80" fill="${palette.detail}" />
    <ellipse cx="220" cy="218" rx="38" ry="60" fill="${palette.accentSoft}" />
    <path d="M156 102 C146 145, 144 190, 160 228" stroke="${palette.surface}" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M248 76 C232 116, 232 184, 248 228" stroke="${palette.surface}" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M110 102 C135 72, 156 61, 182 57" stroke="${palette.accent}" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M180 55 C177 79, 164 96, 146 109" fill="none" stroke="${palette.detail}" stroke-width="6" stroke-linecap="round" />
  `,
  "robusta-beans": (palette) => `
    <ellipse cx="154" cy="170" rx="52" ry="84" fill="${palette.accent}" />
    <ellipse cx="252" cy="158" rx="54" ry="86" fill="${palette.detail}" />
    <ellipse cx="218" cy="232" rx="34" ry="52" fill="${palette.accentSoft}" />
    <path d="M152 99 C138 152, 139 202, 156 246" stroke="${palette.surface}" stroke-width="8" stroke-linecap="round" fill="none" />
    <path d="M251 78 C234 126, 235 197, 252 242" stroke="${palette.surface}" stroke-width="8" stroke-linecap="round" fill="none" />
    <circle cx="111" cy="111" r="16" fill="${palette.accentSoft}" opacity="0.85" />
    <circle cx="298" cy="121" r="12" fill="${palette.accentSoft}" opacity="0.85" />
  `,
  "espresso-machine": (palette) => `
    <rect x="103" y="92" width="178" height="114" rx="28" fill="${palette.detail}" />
    <rect x="128" y="119" width="56" height="48" rx="12" fill="${palette.accentSoft}" />
    <rect x="196" y="112" width="55" height="16" rx="8" fill="${palette.accent}" />
    <rect x="214" y="132" width="18" height="54" rx="9" fill="${palette.accentSoft}" />
    <rect x="143" y="209" width="108" height="15" rx="8" fill="${palette.accent}" />
    <path d="M133 209 L120 250" stroke="${palette.detail}" stroke-width="10" stroke-linecap="round" />
    <path d="M248 209 L262 250" stroke="${palette.detail}" stroke-width="10" stroke-linecap="round" />
    <path d="M242 134 C262 133, 280 143, 290 164" stroke="${palette.surface}" stroke-width="7" stroke-linecap="round" fill="none" />
    <path d="M175 210 L175 236" stroke="${palette.surface}" stroke-width="6" stroke-linecap="round" />
    <path d="M220 210 L220 236" stroke="${palette.surface}" stroke-width="6" stroke-linecap="round" />
  `,
  aeropress: (palette) => `
    <rect x="155" y="82" width="74" height="122" rx="28" fill="${palette.detail}" />
    <rect x="166" y="94" width="52" height="78" rx="18" fill="${palette.accentSoft}" />
    <rect x="144" y="70" width="96" height="24" rx="12" fill="${palette.accent}" />
    <rect x="170" y="202" width="45" height="24" rx="10" fill="${palette.accent}" />
    <path d="M126 228 H258" stroke="${palette.detail}" stroke-width="14" stroke-linecap="round" />
    <path d="M191 61 V84" stroke="${palette.surface}" stroke-width="10" stroke-linecap="round" />
    <rect x="138" y="231" width="110" height="26" rx="14" fill="${palette.detail}" opacity="0.92" />
  `,
  dripper: (palette) => `
    <path d="M122 98 H260 L227 226 H155 Z" fill="${palette.detail}" />
    <path d="M144 111 H238 L216 208 H166 Z" fill="${palette.accentSoft}" />
    <path d="M152 141 H228" stroke="${palette.accent}" stroke-width="10" stroke-linecap="round" />
    <path d="M165 175 H215" stroke="${palette.accent}" stroke-width="10" stroke-linecap="round" />
    <rect x="154" y="228" width="74" height="18" rx="9" fill="${palette.accent}" />
    <rect x="134" y="248" width="116" height="16" rx="8" fill="${palette.detail}" />
  `,
  grinder: (palette) => `
    <rect x="157" y="86" width="72" height="120" rx="24" fill="${palette.detail}" />
    <rect x="143" y="188" width="100" height="22" rx="11" fill="${palette.accent}" />
    <rect x="167" y="210" width="52" height="33" rx="14" fill="${palette.accentSoft}" />
    <path d="M225 104 L284 74" stroke="${palette.detail}" stroke-width="10" stroke-linecap="round" />
    <circle cx="292" cy="71" r="18" fill="${palette.accent}" />
    <circle cx="194" cy="142" r="18" fill="${palette.accentSoft}" />
    <circle cx="194" cy="142" r="6" fill="${palette.detail}" />
  `,
  kettle: (palette) => `
    <path d="M133 176 C133 113, 172 84, 222 84 C264 84, 295 118, 295 166 C295 217, 257 253, 198 253 C161 253, 133 223, 133 176 Z" fill="${palette.detail}" />
    <path d="M122 165 C145 147, 168 140, 190 143" stroke="${palette.accent}" stroke-width="10" stroke-linecap="round" fill="none" />
    <path d="M289 140 C321 123, 346 126, 353 146 C360 164, 344 182, 310 186" stroke="${palette.accentSoft}" stroke-width="9" stroke-linecap="round" fill="none" />
    <path d="M201 75 C217 40, 266 37, 288 60" stroke="${palette.accent}" stroke-width="10" stroke-linecap="round" fill="none" />
    <circle cx="242" cy="101" r="12" fill="${palette.accentSoft}" />
  `,
  subscription: (palette) => `
    <path d="M111 116 L191 72 L273 116 L191 160 Z" fill="${palette.accent}" />
    <path d="M111 116 V215 L191 262 V160 Z" fill="${palette.detail}" />
    <path d="M273 116 V215 L191 262 V160 Z" fill="${palette.accentSoft}" />
    <rect x="150" y="112" width="82" height="18" rx="9" fill="${palette.surface}" opacity="0.8" />
    <circle cx="191" cy="170" r="22" fill="${palette.surface}" opacity="0.9" />
    <path d="M183 157 C176 168, 176 183, 185 193" stroke="${palette.detail}" stroke-width="6" stroke-linecap="round" fill="none" />
    <path d="M199 154 C214 166, 214 188, 199 198" stroke="${palette.detail}" stroke-width="6" stroke-linecap="round" fill="none" />
  `,
};

const buildProductSvg = (product = {}) => {
  const kind = detectArtworkKind(product);
  const palette = palettes[kind] || fallbackPalette;
  const title = truncate(product.name || "Roastery Select", 28);
  const subtitle =
    truncate(
      product.productType === "equipment"
        ? product.equipmentProfile?.equipmentType || "Coffee equipment"
        : `${product.beanProfile?.species || "arabica"} ${product.beanProfile?.roastLevel || "medium"} roast`,
      30
    ) || "Coffee essentials";
  const origin = truncate(
    product.beanProfile?.origin || product.brand || toTitleCase(kind),
    24
  );
  const rating = Number(product.rating || 0).toFixed(1);
  const shape = (svgShapes[kind] || svgShapes["arabica-beans"])(palette);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 300" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette.surface}" />
          <stop offset="100%" stop-color="#ead4b9" />
        </linearGradient>
      </defs>
      <rect width="380" height="300" rx="32" fill="${palette.frame}" />
      <rect x="14" y="14" width="352" height="272" rx="24" fill="url(#bg)" />
      <circle cx="311" cy="68" r="44" fill="${palette.accentSoft}" opacity="0.4" />
      <circle cx="71" cy="232" r="52" fill="${palette.accent}" opacity="0.14" />
      ${shape}
      <rect x="28" y="24" width="126" height="28" rx="14" fill="${palette.frame}" opacity="0.9" />
      <text x="91" y="43" text-anchor="middle" font-size="12" font-weight="700" fill="${palette.surface}" font-family="Segoe UI, Arial, sans-serif" letter-spacing="1.4">
        ROASTERY PICK
      </text>
      <text x="28" y="272" font-size="24" font-weight="700" fill="${palette.text}" font-family="Georgia, serif">
        ${title}
      </text>
      <text x="28" y="244" font-size="13" fill="${palette.detail}" font-family="Segoe UI, Arial, sans-serif" opacity="0.88">
        ${subtitle}
      </text>
      <text x="291" y="245" font-size="13" fill="${palette.detail}" font-family="Segoe UI, Arial, sans-serif" text-anchor="end">
        ${origin}
      </text>
      <rect x="281" y="24" width="71" height="30" rx="15" fill="${palette.frame}" opacity="0.95" />
      <text x="316" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="${palette.surface}" font-family="Segoe UI, Arial, sans-serif">
        ${rating} ★
      </text>
    </svg>
  `;

  return {
    kind,
    palette,
    src: encodeSvg(svg),
  };
};

const isRenderableImage = (value = "") =>
  /^https?:\/\//.test(value) ||
  value.startsWith("/") ||
  value.startsWith("data:") ||
  value.startsWith("blob:");

const getProductImageSource = (product = {}, options = {}) => {
  const { preferUploaded = false } = options;

  if (preferUploaded && product.image && isRenderableImage(product.image)) {
    return product.image;
  }

  return buildProductSvg(product).src;
};

export { buildProductSvg, detectArtworkKind, getProductImageSource };
