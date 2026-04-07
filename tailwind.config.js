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
        page: '#F5F0E7',
        success: '#7EE081',
        danger: '#E55640',
        warning: '#F0E15B',
        accent: {
          DEFAULT: '#F3439B',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // Custom color variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
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
        },
        menuSlideDown: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(-8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        menuSlideUp: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.95) translateY(-8px)' },
        },
      },
      animation: {
        modalIn: 'modalIn 0.2s ease-out',
        'menu-in': 'menuSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'menu-out': 'menuSlideUp 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    tailwindForms
  ],
};

export default config;