/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "vert-kangan": "#0F3D2E",
        ocre: "#D98E2B",
        "terre-cuite": "#B5502F",
        creme: "#F6EFE3",
        encre: "#1B1B18",
        feuille: "#2F8F5B",
        piment: "#C0392B",
      },
      borderRadius: {
        field: "12px",
        card: "20px",
      },
    },
  },
  plugins: [],
};
