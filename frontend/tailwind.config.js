/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beef-primary': '#FF4500',
        'beef-secondary': '#1A1A1B',
        'beef-gray': '#343536',
        'beef-light': '#D7DADC',
      },
    },
  },
  plugins: [],
}
