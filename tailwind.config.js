/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft Bakery (Dusty Pink / Nude Pink) - Elegant and not garish
        brand: {
          50: '#fdf8f9', // Rất nhạt
          100: '#f9eced', // Nền khối/card
          200: '#f1d6d9', // Border
          300: '#e5b6bc', 
          400: '#d58d97',
          500: '#c56b77', // Nút bấm chính (Hồng đất nhẹ)
          600: '#ab4f5d', // Nút hover
          700: '#8e3e49',
          800: '#76353f',
          900: '#643038', // Tiêu đề chính
        },
        surface: {
          light: '#ffffff',
          dark: '#1c1917',
          elevated: '#292524',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'deep': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
