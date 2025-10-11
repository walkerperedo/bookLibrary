import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './modules/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e7faf1',
          100: '#ccf4e1',
          200: '#99e9c3',
          300: '#66dda5',
          400: '#33d287',
          500: '#00c769',
          600: '#00a256',
          700: '#007c43',
          800: '#005630',
          900: '#00301c',
        },
      },
      backgroundImage: {
        'splash-gradient': 'linear-gradient(135deg,#66dda5 0%,#00c769 45%,#00a256 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
