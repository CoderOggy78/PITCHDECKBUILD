import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#07090D",
        surface: {
          50: "#1A2234",
          100: "#141A29",
          200: "#0F1420",
          300: "#0A0E17",
          400: "#07090D",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.05)",
          bright: "rgba(255, 255, 255, 0.15)",
        },
        brand: {
          violet: "#8B5CF6",
          purple: "#7C3AED",
          cyan: "#06B6D4",
          indigo: "#4F46E5",
          accent: "#A855F7",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        "glow-violet": "0 0 40px -10px rgba(139, 92, 246, 0.3)",
        "glow-cyan": "0 0 40px -10px rgba(6, 182, 212, 0.3)",
      }
    },
  },
  plugins: [],
};

export default config;
