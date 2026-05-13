/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00BFA5',
        accent: '#FF6B6B',
        background: '#FFFFFF',
        slate: {
          50: '#F1F4F6',
          900: '#2D3436'
        }
      },
    },
  },
  plugins: [],
};
