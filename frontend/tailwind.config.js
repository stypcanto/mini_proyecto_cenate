/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
    theme: {
      extend: {
        colors: {
          "cenate-blue": "#1E3A8A", // azul institucional
          "cenate-dark": "#0F172A", // fondo oscuro elegante
          "cenate-teal": "#14B8A6", // acento teal
          "cenate-light": "#E2E8F0", // texto claro
          "cenate-danger": "#DC2626", // alertas / logout
        },
        boxShadow: {
          strong: "0 2px 10px rgba(20, 184, 166, 0.4)",
          soft: "0 1px 6px rgba(20, 184, 166, 0.25)",
        },
      },
    },
  theme: {
    extend: {
      colors: {
        // 🎨 Paleta institucional CENATE
        "cenate-blue": "#0B3C5D",     // Azul profundo institucional
        "cenate-teal": "#00A8A8",     // Teal (resaltante / botones)
        "cenate-light": "#E6F4F1",    // Fondo claro
        "cenate-gray": "#F8FAFC",     // Fondo neutro (paneles)
        "cenate-dark": "#06283D",     // Fondo oscuro (sidebar)
        "cenate-accent": "#0099CC",   // Acento brillante para hover/links
        "cenate-danger": "#D9534F",   // Botones de eliminación / alerta
        "cenate-success": "#5CB85C",  // Confirmaciones / ok
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "sans-serif"],
      },
      boxShadow: {
        "soft": "0 2px 10px rgba(0, 0, 0, 0.08)",
        "strong": "0 4px 25px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        "xl": "1rem",
      },
      transitionTimingFunction: {
        "in-out-smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};