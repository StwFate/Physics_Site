/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        physics: {
          blue: '#38bdf8',
          green: '#4ade80',
          yellow: '#facc15',
          red: '#f87171',
          purple: '#c084fc',
        }
      }
    },
  },
  plugins: [],
}
