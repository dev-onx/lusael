/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1628',
          50: '#1a2d4a',
          100: '#0f1e35',
          900: '#060e1a',
        },
        sand: {
          DEFAULT: '#D4A574',
          light: '#e8c9a0',
          dark: '#b8865a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-dot': 'pulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
