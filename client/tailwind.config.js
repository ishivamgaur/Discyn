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
          DEFAULT: "#c799ff", // neon purple
          container: "#bc87fe", 
          dark: "#a68cff", 
        },
        secondary: {
          DEFAULT: "#00e3fd", // neon blue
          container: "#006875",
        },
        background: {
          light: "#ffffff", 
          dark: "#0b0e14", // Aether base
          subtle: "#f4f4f5", 
          "subtle-dark": "#161a21", // surface container low
        },
        card: {
          light: "#ffffff",
          dark: "#1c2028", // surface container high
          "highlight-dark": "#22262f", // surface container highest
        },
        text: {
          light: "#09090b", 
          dark: "#ecedf6", // on_surface
          muted: "#71717a", 
          "muted-dark": "#a9abb3", // on_surface_variant
        },
        border: {
          light: "#e4e4e7", 
          dark: "#22262f", // surface_variant for ghost borders
        },
      },
      fontFamily: {
        display: ["Outfit_700Bold", "sans-serif"],
        heading: ["Outfit_600SemiBold", "sans-serif"],
        body: ["Inter_400Regular", "sans-serif"],
        label: ["Inter_600SemiBold", "sans-serif"],
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
