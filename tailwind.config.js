/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#8FA68E',
          50: '#F5F8F5',
          100: '#EAEFE9',
          200: '#D5E1D4',
          300: '#B7C9B6',
          400: '#9DB39C',
          500: '#8FA68E',
          600: '#758C74',
          700: '#5D735C',
          800: '#4A5D4A',
          900: '#344234',
          950: '#232D23',
        },
        'sage-deep': '#4A5D4A',
        cream: {
          DEFAULT: '#F7F5F0',
          50: '#FCFBF9',
          100: '#F7F5F0',
          200: '#EDE9DF',
          300: '#DFD8C9',
          400: '#CFC5B2',
        },
        beige: {
          DEFAULT: '#EDE8DD',
          light: '#F4F1EA',
          dark: '#DDD5C4',
        },
        charcoal: {
          DEFAULT: '#2E332E',
          light: '#4A534A',
          muted: '#687368',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(74, 93, 74, 0.05), 0 2px 6px -1px rgba(74, 93, 74, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(74, 93, 74, 0.08), 0 3px 8px -2px rgba(74, 93, 74, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(74, 93, 74, 0.1), 0 6px 16px -3px rgba(74, 93, 74, 0.05)',
        'glass': '0 8px 32px 0 rgba(74, 93, 74, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
