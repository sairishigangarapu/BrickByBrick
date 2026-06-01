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
        background: "#FFFFFF",
        foreground: "#0A0A0A",
        brand: {
          primary: "#CC5500", // Burnt Orange
          surface: "#F5F5F5",
        }
      },
      fontFamily: {
        sans: ["var(--font-jost)", "sans-serif"],
        mono: ["monospace"],
      },
      borderWidth: {
        '1': '1px',
      }
    },
  },
  plugins: [],
};
export default config;
