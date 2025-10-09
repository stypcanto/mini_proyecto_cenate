/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'cenate-primary': '#2e63a6',
        'cenate-secondary': '#1d4f8a',
        'cenate-light': '#3b7bc4',
        'cenate-dark': '#1a3d6b',
        'essalud': '#0a5ba9',
      }
    },
  },
  plugins: [],
}
