/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette: mauve, brown, white
        'beef-mauve': {
          100: '#E8D5E0',
          200: '#D1ABC1',
          300: '#BA81A2',
          400: '#A35783',
          500: '#8C2D64', // Main mauve
          600: '#702450',
          700: '#541B3C',
          800: '#381228',
          900: '#1C0914',
        },
        'beef-brown': {
          100: '#E8DDD5',
          200: '#D1BBAB',
          300: '#BA9981',
          400: '#A37757',
          500: '#8C552D', // Main brown
          600: '#704424',
          700: '#54331B',
          800: '#382212',
          900: '#1C1109',
        },
        'beef-white': '#FEFEFE',
        'beef-black': '#0A0A0A',
        // Secondary accents
        'beef-yellow': {
          DEFAULT: '#F4C430', // Gold yellow
          dark: '#E0B020',
        },
      },
    },
  },
  plugins: [],
}
