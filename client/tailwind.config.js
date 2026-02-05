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
          DEFAULT: "#2563eb", // blue-600 (More vivid than indigo)
          light: "#3b82f6", // blue-500
          dark: "#1d4ed8", // blue-700
        },
        background: {
          light: "#ffffff", // Pure white for cleaner look
          dark: "#09090b", // zinc-950 (Deep, premium dark)
          subtle: "#f4f4f5", // zinc-100 (for secondary backgrounds)
          "subtle-dark": "#18181b", // zinc-900
        },
        card: {
          light: "#ffffff",
          dark: "#18181b", // zinc-900
          "highlight-dark": "#27272a", // zinc-800
        },
        text: {
          light: "#09090b", // zinc-950
          dark: "#fafafa", // zinc-50
          muted: "#71717a", // zinc-500
          "muted-dark": "#a1a1aa", // zinc-400
        },
        border: {
          light: "#e4e4e7", // zinc-200
          dark: "#27272a", // zinc-800
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
