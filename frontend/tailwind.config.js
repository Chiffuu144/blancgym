/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: {
      ink: '#352e31', muted: '#71666a', soft: '#8a7d80',
      rose: '#df718d', roseDark: '#98415d', blush: '#f2cbd5',
      cream: '#fcf6f0', paper: '#fffdfb', line: '#ead6d2', sage: '#596653'
    },
    fontFamily: { sans: ['Inter', 'sans-serif'], display: ['Poppins', 'sans-serif'], serif: ['Playfair Display', 'Georgia', 'serif'] },
    boxShadow: { soft: '0 4px 18px rgba(71, 51, 53, .045)' }
  } },
  plugins: []
};
