/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        skyBlue: '#E0F2FE', // Early morning light sky background
        sunriseGold: '#FEF08A', // Focus points, alerts, and highlighting
        aartiSaffron: '#FDBA74', // Primary buttons and main call-to-actions
        gangesTeal: '#0D9488', // Success notifications and completed screens
        clayBeige: '#F5F5F4', // Structural container backgrounds
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
