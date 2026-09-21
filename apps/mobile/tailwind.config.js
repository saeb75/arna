/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind 4 → tailwindcss 3.4 (peer >3.3). Tailwind v4'e GEÇİLMEZ — CLAUDE.md.
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Palet TEK dosyada (colors.js): sınıflar buradan, `color=` prop'ları da
      // aynı dosyadan okur — hex bir daha bileşene kopyalanmaz.
      colors: require("./colors"),
    },
  },
  plugins: [],
};
