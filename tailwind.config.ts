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
        navy: {
          950: '#050810',
          900: '#0A0F1E',
          800: '#0D1526',
          700: '#111827',
          600: '#162036',
          500: '#1E2D45',
          400: '#2A3F5F',
          300: '#3B5278',
          200: '#4F6A94',
          100: '#6B82AD',
        },
        gold: {
          DEFAULT: '#C9A84C',
          50: '#FBF6E8',
          100: '#F5EAC8',
          200: '#EDDA9E',
          300: '#E2C76E',
          400: '#D4B458',
          500: '#C9A84C',
          600: '#B5923A',
          700: '#96782F',
          800: '#735C24',
          900: '#504019',
        },
        surface: {
          DEFAULT: '#111827',
          light: '#162036',
          dark: '#0D1526',
        },
        border: {
          DEFAULT: '#1E2D45',
          light: '#2A3F5F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
