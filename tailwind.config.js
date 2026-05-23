/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Phê La Inspired Colors - Warm beige, brown and orange
        brand: {
          50: '#fcf8f0', // Nền chung
          100: '#f5ead5', // Nền khối/card
          200: '#edd8b2',
          300: '#e3c28a',
          400: '#d9a764',
          500: '#c58341', // Nút bấm cam đất
          600: '#b06b37', // Cam đậm
          700: '#925230', // Nâu nhạt
          800: '#756961', // Chữ không active
          900: '#533a29', // Chữ active / Tiêu đề chính
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
