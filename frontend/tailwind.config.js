/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'system-blue': '#1560D0',
        'system-text': '#121212',
      },
    },
  },
  plugins: [],
};
