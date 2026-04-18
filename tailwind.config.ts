import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e4edff",
          200: "#c4d6ff",
          300: "#9bb8ff",
          400: "#6d93ff",
          500: "#4a72f5",
          600: "#2f55db",
          700: "#2443ad",
          800: "#1e3887",
          900: "#17285f",
        },
        ink: {
          900: "#0b1220",
          700: "#1f2a44",
          500: "#4b5675",
          300: "#8892ad",
          100: "#eef1f7",
        },
        status: {
          ok: "#16a34a",
          warn: "#d97706",
          risk: "#dc2626",
          info: "#2563eb",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
