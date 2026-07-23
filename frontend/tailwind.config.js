/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#f1f5f9',
          50: '#e2e8f0',
          100: '#cbd5e1',
        },
        accent: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0891b2',
        },
        warning: {
          DEFAULT: '#fbbf24',
          light: '#fcd34d',
        },
        danger: {
          DEFAULT: '#f87171',
          light: '#fca5a5',
        },
        primary: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
        },
        energy: '#10b981',
      },
    },
  },
  plugins: [],
};