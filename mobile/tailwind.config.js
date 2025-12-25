/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: "#FFFEF5",
        primary: "#FF6B35",
        secondary: "#1E1E1E",
        accent: "#4ECDC4",
        danger: "#FF6B6B",
        muted: "#6B7280",
        border: "#1E1E1E",
      },
      fontFamily: {
        sans: ["SpaceGrotesk-Regular", "system-ui", "sans-serif"],
        bold: ["SpaceGrotesk-Bold", "system-ui", "sans-serif"],
        medium: ["SpaceGrotesk-Medium", "system-ui", "sans-serif"],
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #1E1E1E",
        "brutal-sm": "2px 2px 0px 0px #1E1E1E",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};

