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
        "cs-orange": "#f4922a",
        "cs-dark": "#1a1a2e",
        "cs-darker": "#0f0f1a",
        "cs-card": "#16213e",
        "cs-border": "#2a2a4a",
        "cs-text": "#e0e0e0",
        "cs-muted": "#8888aa",
      },
    },
  },
  plugins: [],
};

export default config;
