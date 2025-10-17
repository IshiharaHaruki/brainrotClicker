/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,md,mdx}",
    "./pages/**/*.{js,jsx,ts,tsx,md,mdx}",
    "./theme/**/*.{js,jsx,ts,tsx,md,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8f8e8",
          100: "#d1f1d1",
          200: "#a3e3a3",
          300: "#75d575",
          400: "#47c847",
          500: "#81c869",
          600: "#2b7a2b",
          700: "#235c23",
          800: "#1a3d1a",
          900: "#121f12",
        },
        theme: {
          bg: {
            primary: "var(--bg-primary)",
            secondary: "var(--bg-secondary)",
          },
          text: {
            primary: "var(--text-primary)",
            secondary: "var(--text-secondary)",
          },
          border: "var(--border-color)",
        },
        dark: {
          DEFAULT: "#1a1a1a",
          secondary: "#242424",
          tertiary: "#2a2a2a",
        },
        success: {
          light: "#e6f4ea",
          DEFAULT: "#34a853",
          dark: "#1e8e3e",
        },
        warning: {
          light: "#fef7e0",
          DEFAULT: "#fbbc04",
          dark: "#f9ab00",
        },
        error: {
          light: "#fce8e6",
          DEFAULT: "#ea4335",
          dark: "#d93025",
        },
        info: {
          light: "#e8f0fe",
          DEFAULT: "#4285f4",
          dark: "#1967d2",
        },
        background: {
          light: "#ffffff",
          dark: "#111111",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
