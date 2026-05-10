/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'poke-yellow': '#FFDE00',
        'poke-blue': '#3B4CCA',
        'poke-red': '#FF0000',
        'poke-dark': '#0a0a0a',
      },
    },
  },
  plugins: [],
};
