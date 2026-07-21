import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem'
    },
    extend: {
      colors: {
        background: '#0a0a0b',
        surface: '#131316',
        'surface-hover': '#1a1a1f',
        border: '#242429',
        muted: '#8b8b93',
        foreground: '#f2f2f3',
        accent: {
          DEFAULT: '#f2c94c',
          hover: '#ffd966',
          foreground: '#0a0a0b'
        },
        success: '#3ecf8e',
        danger: '#f0645c',
        warning: '#f2c94c'
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem'
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out'
      }
    }
  },
  plugins: []
} satisfies Config
