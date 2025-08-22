/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14B8A6', // Teal-500
        secondary: '#3B82F6', // Blue-500
        danger: '#EF4444', // Red-500
      },
    },
  },
  plugins: [],
}