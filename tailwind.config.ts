import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        violet: {
          DEFAULT: "#8b5cf6",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        brand: {
          bg: "#ffffff",
          "bg-2": "#f8f9ff",
          "bg-3": "#f1f2fc",
          border: "#e6e8f4",
          "text-1": "#0d0f1a",
          "text-2": "#2d3152",
          "text-3": "#64748b",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366f1, #8b5cf6)",
        "gradient-brand-hover": "linear-gradient(135deg, #4f46e5, #7c3aed)",
      },
      boxShadow: {
        brand: "0 4px 24px rgba(99,102,241,0.18)",
        "brand-lg": "0 8px 40px rgba(99,102,241,0.22)",
        card: "0 1px 4px rgba(13,15,26,0.06), 0 4px 16px rgba(13,15,26,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
