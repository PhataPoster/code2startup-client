/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

// Legacy config — Tailwind v4 reads CSS-first via @theme, but keep this for
// HeroUI plugin + older integrations. Safe to keep in v4.
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};
