/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sky1: "#B8C6D6",
        sky2: "#8FA3B8",
        sky3: "#6B7F94",
        dune: "#D6C2A8",
        cream: "#F0E6D2",
        terracotta: "#8B4A3E",
        navy: "#2A3444",
        ink: "#1E2430",
      },
      borderRadius: {
        xl: "22px",
        "2xl": "28px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
