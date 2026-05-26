/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant Pink (MABAE Donut Theme)
        brand: {
          50: '#fdf2f8',  // Nền nhạt
          100: '#fce7f3', // Card background
          200: '#fbcfe8', // Border
          300: '#f9a8d4', 
          400: '#f472b6',
          500: '#ec4899', // Main Pink
          600: '#db2777', // Hover
          700: '#be185d',
          800: '#9d174d',
          900: '#831843', // Text chính
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
