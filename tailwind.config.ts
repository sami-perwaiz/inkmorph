import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gray-100": "#F5F5F5",
        "gray-200": "#E9EAEB",
        "gray-300": "#D5D7DA",
        "gray-500": "#717680",
        "gray-600": "#535862",
        "gray-900": "#202020",
        "gray-loading": "#88888C",
        "filter-all-active-bg": "#E2FFD7",
        "filter-all-active-border": "#C8FFB2",
        "filter-all-active-text": "#227A00",
        "filter-avatar-active-bg": "#E7D7FF",
        "filter-avatar-active-border": "#D0B2FF",
        "filter-avatar-active-text": "#2F007A",
        "filter-bw-active-bg": "#FFE9D7",
        "filter-bw-active-border": "#FFD4B2",
        "filter-bw-active-text": "#7A3500",
        "filter-inactive-border": "#F2F2F2",
        "action-border-default": "hsl(0 0% 95%)",
      },
      boxShadow: {
        "action-hover": "0px 0px 12px hsla(0, 0%, 0%, 0.10)",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        lora: ["var(--font-lora)", "serif"],
      },
      screens: {
        tablet: "834px",
        /** Desktop chrome (filters / profile) — fits ~1280+ laptops */
        laptop: "1280px",
        /** 5-column gallery — Figma Abstract Desktop 1440 */
        desktop: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
