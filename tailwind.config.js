/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F5132',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#0F5132',
          700: '#0A3D25',
          800: '#062818',
          900: '#03140B',
          dark: '#0A3D25',
        },
        accent: {
          DEFAULT: '#0D6EFD',
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#0D6EFD',
          700: '#1565C0',
          800: '#0D47A1',
          900: '#0A3D62',
        },
        surface: {
          DEFAULT: '#0f172a',
          light: '#1e293b',
          lighter: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'subheading': ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'elevated': '0 10px 25px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.3)',
        'modal': '0 25px 50px rgba(0,0,0,0.5)',
        'surface-1': '0 1px 2px rgba(2,6,23,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        'surface-2': '0 4px 12px rgba(2,6,23,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        'surface-3': '0 12px 32px rgba(2,6,23,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-green': '0 0 24px rgba(34,197,94,0.25)',
        'glow-blue': '0 0 24px rgba(59,130,246,0.25)',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
};
