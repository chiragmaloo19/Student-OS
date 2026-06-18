/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
        sans: ['Lato', 'sans-serif'],
      },
      colors: {
        // Primary green palette
        green: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Brand-specific shades
        brand: {
          50:  '#edfff5',
          100: '#d5ffe9',
          200: '#aeffd4',
          300: '#70ffb0',
          400: '#2bef83',
          500: '#00d462',  // primary CTA
          600: '#00a94d',
          700: '#008040',
          800: '#066434',
          900: '#06522d',
          950: '#012e18',
        },
        // Dark surface shades for backgrounds
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        'brand-sm':  '0 1px 2px 0 rgba(0, 212, 98, 0.05)',
        'brand':     '0 4px 6px -1px rgba(0, 212, 98, 0.1), 0 2px 4px -2px rgba(0, 212, 98, 0.1)',
        'brand-lg':  '0 10px 15px -3px rgba(0, 212, 98, 0.1), 0 4px 6px -4px rgba(0, 212, 98, 0.1)',
        'brand-xl':  '0 20px 25px -5px rgba(0, 212, 98, 0.1), 0 8px 10px -6px rgba(0, 212, 98, 0.1)',
        'glow':      '0 0 20px rgba(0, 212, 98, 0.35)',
        'glow-lg':   '0 0 40px rgba(0, 212, 98, 0.25)',
      },
      backgroundImage: {
        'brand-gradient':       'linear-gradient(135deg, #00d462 0%, #008040 100%)',
        'dark-gradient':        'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'card-gradient':        'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'hero-gradient':        'linear-gradient(135deg, #052e16 0%, #0f172a 50%, #052e16 100%)',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-in-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'pulse-brand':  'pulseBrand 2s ease-in-out infinite',
        'spin-slow':    'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' },                         '100%': { opacity: '1' } },
        slideUp:    { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown:  { '0%': { opacity: '0', transform: 'translateY(-16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        pulseBrand: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,212,98,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(0,212,98,0)' } },
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
