import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        "vert-kangan": "#0F3D2E",
        ocre: "#D98E2B",
        "terre-cuite": "#B5502F",
        creme: "#F6EFE3",
        encre: "#1B1B18",
        feuille: "#2F8F5B",
        piment: "#C0392B",
        dark: {
          "vert-kangan": "#123B2C",
          ocre: "#E4A748",
          "terre-cuite": "#C6653F",
          creme: "#15201A",
          encre: "#F3EFE6",
          feuille: "#3FAE72",
          piment: "#E0564A",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        field: "12px",
        card: "20px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(27, 27, 24, 0.08)",
      },
      keyframes: {
        "fill-canari": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(120px) rotate(360deg)", opacity: "0" },
        },
      },
      animation: {
        "fill-canari": "fill-canari 1.2s ease-out forwards",
        "confetti-fall": "confetti-fall 1.4s ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
