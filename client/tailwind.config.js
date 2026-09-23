/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        somaiya: {
          50: '#FDF2F2',
          100: '#FCE7E7',
          200: '#F9D1D3',
          300: '#F3A9AD',
          400: '#E7737A',
          500: '#D5434D',
          600: '#BA222D',
          700: '#A01C24', // Official KJ Somaiya Red
          800: '#831A21',
          900: '#6E1B21',
          950: '#3D0A0E',
        },
        dark: {
          DEFAULT: '#111111',
          muted: '#333333',
          subtle: '#666666',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F9FA',
          subtle: '#F3F4F6',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(160, 28, 36, 0.08), 0 2px 8px 0 rgba(0, 0, 0, 0.04)',
        'glass-hover': '0 12px 40px 0 rgba(160, 28, 36, 0.15), 0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'podium': '0 20px 50px -10px rgba(160, 28, 36, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.04)',
        'glow-red': '0 0 25px rgba(160, 28, 36, 0.35)',
        'glow-gold': '0 0 30px rgba(234, 179, 8, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
