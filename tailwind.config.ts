import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        char:  "#060e08",   // near-black with deep forest tint
        ember: "#22c55e",   // vivid green — primary brand accent
        chili: "#dc2626",   // bold red — heat / spice accent
        cream: "#f0fdf4",   // light green-white — main text
        field: "#16a34a",   // forest green — secondary accent
        honey: "#86efac",   // soft lime — stats / highlights
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
export default config;
