/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['11px', '14px'],
        'sm': ['12px', '16px'],
        'base': ['12px', '18px'],
        'md': ['13px', '18px'],
        'lg': ['14px', '20px'],
        'xl': ['16px', '22px'],
        '2xl': ['18px', '24px'],
      },
    },
  },
  plugins: [],
}

