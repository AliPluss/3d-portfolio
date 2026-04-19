import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        gold:         '#C9A84C',
        'gold-bright':'#D4B85A',
        blue:         '#5B8AD4',
        bg:           '#050505',
        surface:      'rgba(255,255,255,0.038)',
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '10px',
        lg: '24px',
        xl: '32px',
      },
      animation: {
        'fade-in':    'fadeIn 0.6s ease forwards',
        'slide-up':   'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-left': 'slideLeft 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.10)' },
          '50%':      { boxShadow: '0 0 40px rgba(201,168,76,0.28)' },
        },
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #C9A84C 0%, #F0D080 50%, #C9A84C 100%)',
        'gold-horizontal': 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
        'surface-gradient':'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
    },
  },
  plugins: [],
}

export default config
