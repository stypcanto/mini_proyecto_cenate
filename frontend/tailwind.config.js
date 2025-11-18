/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        // Colores CENATE - Azul institucional
        cenate: {
          50:  "#eff6ff",  // Muy claro
          100: "#dbeafe",  // Claro
          200: "#bfdbfe",  // Claro medio
          300: "#93c5fd",  // Medio
          400: "#60a5fa",  // Medio-oscuro
          500: "#3b82f6",  // Base brillante
          600: "#0A5BA9",  // Base principal CENATE
          700: "#084a8a",  // Oscuro
          800: "#063a6b",  // Muy oscuro
          900: "#052a4d",  // Ultra oscuro
        },
      },
    },
  },
  plugins: [],
};
