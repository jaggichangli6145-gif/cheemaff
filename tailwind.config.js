/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        dark: {
          900: '#050505',
          800: '#0a0a0a',
          700: '#111111',
          600: '#1a1a1a',
          500: '#262626',
        },
        primary: {
          DEFAULT: '#ff2d2d',
          hover: '#e02424',
          glow: 'rgba(255, 45, 45, 0.5)',
        },
        secondary: {
          DEFAULT: '#ff6a00',
          hover: '#e05d00',
          glow: 'rgba(255, 106, 0, 0.5)',
        },
        accent: {
          DEFAULT: '#ffd700',
          hover: '#e6c200',
          glow: 'rgba(255, 215, 0, 0.5)',
        },
        neon: {
          red: '#ff2d2d',
          orange: '#ff6a00',
          gold: '#ffd700',
          blue: '#00d2ff',
          purple: '#9d00ff',
          green: '#00ff66'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon-red': '0 0 15px rgba(255, 45, 45, 0.5), 0 0 30px rgba(255, 45, 45, 0.2)',
        'neon-red-sm': '0 0 8px rgba(255, 45, 45, 0.4)',
        'neon-red-lg': '0 0 25px rgba(255, 45, 45, 0.7), 0 0 50px rgba(255, 45, 45, 0.3)',
        'neon-orange': '0 0 15px rgba(255, 106, 0, 0.5), 0 0 30px rgba(255, 106, 0, 0.2)',
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'esports-gradient': 'linear-gradient(135deg, #ff2d2d 0%, #ff6a00 100%)',
        'card-gradient': 'linear-gradient(180deg, #161616 0%, #0d0d0d 100%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 15px rgba(255, 45, 45, 0.6), 0 0 30px rgba(255, 45, 45, 0.3)',
          },
          '50%': {
            opacity: '0.7',
            boxShadow: '0 0 5px rgba(255, 45, 45, 0.2), 0 0 10px rgba(255, 45, 45, 0.1)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
