/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind 4 → tailwindcss 3.4 (peer >3.3). Tailwind v4'e GEÇİLMEZ — CLAUDE.md.
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Arna paleti — web'deki koyu zemin/birincil renklerle hizalı başlangıç
        primary: "#6366f1",
        background: "#0b0b10",
        card: "#16161d",
        muted: "#9ca3af",
      },
    },
  },
  plugins: [],
};
