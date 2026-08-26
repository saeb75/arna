/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind 4 → tailwindcss 3.4 (peer >3.3). Tailwind v4'e GEÇİLMEZ — CLAUDE.md.
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Arna paleti — ana ekran tasarımının menekşesi MARKA rengidir; login ve
        // ders ekranı da aynı moru kullanır (iki mor yan yana yaşamasın).
        primary: "#8b5cf6",
        background: "#0b0b10",
        card: "#16161d",
        muted: "#9ca3af",
        // Ders yolu yüzeyleri: pil/kart/sekme barı, başlanmamış düğüm, tamamlandı rozeti
        surface: "#1c1c1e",
        nodeIdle: "#2c2c2e",
        success: "#22c55e",
      },
    },
  },
  plugins: [],
};
