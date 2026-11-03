/**
 * GlotMate paleti — TEK renk kaynağı, AÇIK + KOYU tema (GlotCast token sistemi).
 *
 * Bileşenler Tailwind adlarını kullanır (`bg-card`, `text-brand`, `bg-brand/15`);
 * sınıf alamayan prop'lar (ikon `color=`, SVG, gölge, durum çubuğu) ham değeri
 * `useThemeColors()` ile okur. Bileşende hex ya da literal Tailwind rengi
 * (`text-white`, `bg-red-500`) YAZILMAZ; `dark:` öneki de yok — tema geçişi
 * CSS değişkenleriyle tek noktadan yapılır (ThemeRoot → NativeWind `vars()`).
 *
 * Yüzeyler nötr bir taban + biraz MARKA (GlotCast ember'i) karışımıdır: her kutu
 * markayı taşır ama rengi bağırmaz. Durum/kategori renkleri tema başına sabittir.
 * Marka + yüzey değerleri GlotCast'in `src/ui/colors.js`'iyle birebir aynıdır
 * (3 Kas 2026'da mordan geçildi).
 */

/** @typedef {"light" | "dark"} Scheme */

/** Tema başına sabit renkler (markayla karışmaz). */
const palette = {
  light: {
    destructive: "#e7000b",
    positive: "#047857",
    negative: "#b91c1c",
    warning: "#92400e",
    info: "#1d4ed8",
    overlay: "#000000", // sheet/diyalog arkası (opaklıkla)
    scrim: "#000000", // gölge rengi
    "on-image": "#ffffff", // gradient/kapak üstü metin
    "on-image-muted": "#e5e5e5",
    streak: "#ea580c",
    "apple-button": "#000000",
    "apple-button-foreground": "#ffffff",
    // Rol yapma kategorileri — kart gradyanının iki ucu (beyaz metin ≥ 4.5:1)
    "cat-eat": "#ea580c",
    "cat-eat-deep": "#c2410c",
    "cat-travel": "#0284c7",
    "cat-travel-deep": "#075985",
    "cat-shop": "#db2777",
    "cat-shop-deep": "#9d174d",
    "cat-work": "#4f46e5",
    "cat-work-deep": "#3730a3",
    "cat-health": "#059669",
    "cat-health-deep": "#065f46",
    "cat-social": "#d97706",
    "cat-social-deep": "#92400e",
    "cat-home": "#0d9488",
    "cat-home-deep": "#115e59",
    "cat-service": "#7c3aed",
    "cat-service-deep": "#5b21b6",
    // Ders yolu düğümleri (Duolingo yapısı, kendi rengimiz): düz yüz + altta
    // koyu "dudak" (kalınlık). on: kaldığın/bitmiş ders (ember), off: başlanmamış.
    "node-on": "#f07a34",
    "node-on-lip": "#c4561c",
    "node-off": "#e8e1da",
    "node-off-lip": "#cdc3b9",
    "node-off-icon": "#ada197",
  },
  dark: {
    destructive: "#ff6467",
    positive: "#67ce67",
    negative: "#df6560",
    warning: "#fbbf24",
    info: "#60a5fa",
    overlay: "#000000",
    scrim: "#000000",
    "on-image": "#ffffff",
    "on-image-muted": "#e5e5e5",
    streak: "#fb923c",
    "apple-button": "#ffffff",
    "apple-button-foreground": "#000000",
    "cat-eat": "#ea580c",
    "cat-eat-deep": "#9a3412",
    "cat-travel": "#0284c7",
    "cat-travel-deep": "#0c4a6e",
    "cat-shop": "#db2777",
    "cat-shop-deep": "#831843",
    "cat-work": "#4f46e5",
    "cat-work-deep": "#312e81",
    "cat-health": "#059669",
    "cat-health-deep": "#064e3b",
    "cat-social": "#d97706",
    "cat-social-deep": "#78350f",
    "cat-home": "#0d9488",
    "cat-home-deep": "#134e4a",
    "cat-service": "#7c3aed",
    "cat-service-deep": "#4c1d95",
    "node-on": "#ee7631",
    "node-on-lip": "#a8461a",
    "node-off": "#3b302a",
    "node-off-lip": "#261e19",
    "node-off-icon": "#7a6c62",
  },
};

/**
 * Yüzeyler: nötr taban + karışan marka oranı (0–1). `canvas` kartların arkasındaki
 * ekran, `background` bar/başlık/giriş, `card` kutular ve satırlar, `muted`
 * çipler ve raylar.
 */
const surfaces = {
  light: {
    canvas: ["#fafafa", 0.025],
    background: ["#ffffff", 0],
    card: ["#ffffff", 0.015],
    popover: ["#ffffff", 0.015],
    muted: ["#f5f5f5", 0.05],
    secondary: ["#f5f5f5", 0.05],
    accent: ["#f5f5f5", 0.05],
    border: ["#e5e5e5", 0.08],
    input: ["#e5e5e5", 0.08],
    ring: ["#a1a1a1", 0.1],
    foreground: ["#0a0a0a", 0.02],
    "muted-foreground": ["#737373", 0.06],
  },
  // Koyu: sıcak kahve tonlar (sayfa #140e0b, kart #271d17, çip #32251d, çizgi #3a2c22)
  dark: {
    canvas: ["#0c0a09", 0.035],
    background: ["#0f0d0b", 0.05],
    card: ["#171513", 0.075],
    popover: ["#171513", 0.075],
    muted: ["#1f1c19", 0.09],
    secondary: ["#1f1c19", 0.09],
    accent: ["#1f1c19", 0.09],
    border: ["#26221e", 0.1],
    input: ["#2b2723", 0.1],
    ring: ["#57524c", 0.15],
    foreground: ["#f5f3f0", 0.03],
    "muted-foreground": ["#938f89", 0.1],
  },
};

/** "#rrggbb" a ile b arasında (t = 0 → a, 1 → b). */
function mix(a, b, t) {
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const ch = (c, shift) => (c >> shift) & 255;
  return (
    "#" +
    [16, 8, 0]
      .map((shift) => Math.round(ch(ca, shift) + (ch(cb, shift) - ch(ca, shift)) * t))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Marka (GlotCast ember'i). brand: vurgu metni, çizgi, seçili pil · brand-strong:
 * ikon ve dolu buton · brand-from/to: gradyan (CTA, mikrofon, banner, hero) ·
 * glow: sayfa üstündeki sıcak ışık · on-brand: marka GRADYANI üstünde metin/ikon.
 * Açıkta brand koyu: beyaz üstünde vurgu metni ≥ 4.5:1 kalsın. Gradyanın açık
 * ucu beyaz metinle ~2.8:1 — yalnız kalın büyük metin taşır; gövde metni taşıyan
 * dolu yüzey (kullanıcı balonu) `bg-primary` + `text-primary-foreground` giyer.
 */
const brand = {
  light: {
    brand: "#b94d17",
    "brand-strong": "#a8440f",
    "brand-from": "#f07a34",
    "brand-to": "#e5484a",
    glow: "#fde7d8",
    "on-brand": "#ffffff",
  },
  dark: {
    brand: "#ee8146",
    "brand-strong": "#ed672b",
    "brand-from": "#ed7631",
    "brand-to": "#eb4746",
    glow: "#3b1e0c",
    "on-brand": "#ffffff",
  },
};

/**
 * Bir temanın bütün token'ları: sabitler + markayla karışmış yüzeyler + marka.
 * @param {Scheme} scheme
 */
function themeColors(scheme) {
  const b = brand[scheme];
  const tinted = /** @type {Record<keyof typeof surfaces.dark, string>} */ (
    Object.fromEntries(Object.entries(surfaces[scheme]).map(([name, [base, t]]) => [name, mix(base, b.brand, t)]))
  );
  const fg = tinted.foreground;
  return {
    ...palette[scheme],
    ...tinted,
    "card-foreground": fg,
    "popover-foreground": fg,
    "secondary-foreground": fg,
    "accent-foreground": fg,
    // Dolu butonlar markayı giyer; koyuda turuncu üstünde beyaz soluk kalır → zemin rengi metin
    primary: b.brand,
    "primary-foreground": scheme === "dark" ? tinted.canvas : b["on-brand"],
    ...b,
  };
}

/** "#171717" → "23 23 23" (Tailwind'in `rgb(var(--x) / <alpha-value>)` biçimi — `bg-brand/10` çalışsın). */
function channels(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * Bir temanın CSS değişkenleri — kökte NativeWind `vars()` ile uygulanır.
 * @param {Scheme} scheme
 */
function cssVariables(scheme) {
  return Object.fromEntries(
    Object.entries(themeColors(scheme)).map(([name, hex]) => [`--color-${name}`, channels(hex)]),
  );
}

/** Tailwind renkleri: her token adıyla, CSS değişkenini okuyarak. */
const tailwindColors = Object.fromEntries(
  Object.keys(themeColors("light")).map((name) => [name, `rgb(var(--color-${name}) / <alpha-value>)`]),
);

/** Alfalı hex ("#rrggbb", 0.2 → "#rrggbb33") — SVG durakları ve gölgeler için. */
function withAlpha(hex, alpha) {
  return hex + Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
}

module.exports = { palette, surfaces, brand, mix, themeColors, cssVariables, tailwindColors, withAlpha };
