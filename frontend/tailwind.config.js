/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Beef color palette - raw beef inspired
        'beef': {
          DEFAULT: '#B85450', // Main beef color - reddish brown
          light: '#D47A76',
          dark: '#8B3F3C',
        },
        'beef-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
