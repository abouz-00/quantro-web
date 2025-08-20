/** @type {import('tailwindcss').Config} */
import tailwindForms from '@tailwindcss/forms';

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#6E44FF',
        success: '#7EE081',
        danger: '#E55640',
        warning: '#F0E15B',
        accent: '#F3439B',
      },
      keyframes: {
        modalIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95) translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)'
          },
        }
      },
      animation: {
        modalIn: 'modalIn 0.2s ease-out',
      },
    },
  },
  plugins: [
    tailwindForms
  ],
};

export default config;