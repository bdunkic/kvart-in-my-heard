/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zgblue: '#0055A4',
        heartred: '#E63946'
      }
    },
  },
  plugins: [],
}