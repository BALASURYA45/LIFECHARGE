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
          DEFAULT: '#f8fafc',
          50: '#f1f5f9',
          100: '#e2e8f0',
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
          DEFAULT: '#ef4444',
          light: '#fca5a5',
        },
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
        },
        energy: '#10b981',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(6, 182, 212, 0.3)',
        'glow-sm': '0 0 20px -5px rgba(6, 182, 212, 0.2)',
        'inner-glow': 'inset 0 0 20px -5px rgba(6, 182, 212, 0.15)',
        'card': '0 20px 60px -15px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 25px 70px -12px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
