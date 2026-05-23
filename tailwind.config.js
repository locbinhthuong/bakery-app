/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sweet Bakery Inspired Colors - Rose and Cream
        brand: {
          50: '#fff1f2', // Nền chung siêu nhạt
          100: '#ffe4e6', // Nền khối/card
          200: '#fecdd3', // Border, hover
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // Nút bấm chính, Icon chính (Hồng đậm)
          600: '#e11d48', // Nút hover
          700: '#be123c',
          800: '#9f1239', // Chữ không active hoặc chữ nổi
          900: '#881337', // Tiêu đề chính (Đỏ cherry đậm)
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
