import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc7fb",
          400: "#36aaf5",
          500: "#085DAE",
          600: "#026fc2",
          700: "#03599e",
          800: "#074c82",
          900: "#0c3f6c",
          950: "#082847",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-siliguri)", "system-ui", "sans-serif"],
        bengali: ["var(--font-siliguri)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
