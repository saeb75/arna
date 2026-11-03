const { tailwindColors } = require("./colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind 4 → tailwindcss 3.4 (peer >3.3). Tailwind v4'e GEÇİLMEZ — CLAUDE.md.
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  // Tema CSS değişkenleriyle değişir (ThemeRoot); `dark:` öneki kullanılmaz.
  darkMode: "class",
  theme: {
    extend: {
      // Palet TEK dosyada (colors.js): her token `rgb(var(--color-x) / <alpha-value>)`
      colors: tailwindColors,
      fontSize: { "2xs": ["10px", "14px"] },
      borderRadius: { sm: "6px", md: "8px", lg: "10px", xl: "14px", "2xl": "18px" },
    },
  },
  plugins: [],
};
