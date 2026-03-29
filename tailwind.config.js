/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          yellow: '#facc15',
          green: '#4ade80',
          pink: '#f472b6',
        },
        dark: {
          bg: '#0f0f0f',
          card: '#1a1a1a',
          border: '#2a2a2a',
        }
      },
      fontFamily: {
        bangers: ['Bangers', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'yellow-glow': '0 0 20px rgba(250, 204, 21, 0.3)',
        'card-hover': '0 0 30px rgba(250, 204, 21, 0.2)',
      }
    },
  },
  plugins: [],
}
