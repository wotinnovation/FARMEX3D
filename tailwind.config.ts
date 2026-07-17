import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        char: "#140d09",
        ember: "#ff4d1c",
        chili: "#d92b04",
        cream: "#f6e8d2",
        field: "#5c8a3a",
        honey: "#f2a33c",
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
