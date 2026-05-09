/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gem: {
          50:  '#f0eeff',
          100: '#e4e0ff',
          200: '#cdc5ff',
          300: '#ab9eff',
          400: '#8b74fd',
          500: '#7155f5',
          600: '#6235eb',
          700: '#5425d1',
          800: '#4520aa',
          900: '#3a1d87',
          950: '#220f52',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
