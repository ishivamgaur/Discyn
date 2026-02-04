/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  darkMode: "class",
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5", // indigo-600
          light: "#6366f1", // indigo-500
          dark: "#4338ca", // indigo-700
        },
        secondary: "#f97316", // orange-500
        danger: "#ef4444", // red-500
        success: "#22c55e", // green-500
        background: {
          light: "#f9fafb", // gray-50
          dark: "#111827", // gray-900
        },
        card: {
          light: "#ffffff",
          dark: "#1f2937", // gray-800
        },
        text: {
          light: "#111827", // gray-900
          dark: "#f9fafb", // gray-50
          muted: "#9ca3af", // gray-400
        },
      },
    },
  },
  plugins: [],
};
