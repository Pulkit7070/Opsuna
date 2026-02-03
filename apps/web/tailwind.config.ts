import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface colors - Analog Noise theme
        surface: {
          base: '#140a25',
          card: 'rgba(20, 10, 37, 0.85)',
          'card-hover': 'rgba(46, 16, 32, 0.85)',
        },
        // Border colors
        border: {
          subtle: 'rgba(159, 95, 53, 0.15)',
          highlight: 'rgba(159, 95, 53, 0.3)',
          DEFAULT: 'rgba(159, 95, 53, 0.15)',
        },
        // Accent colors - Analog Noise palette
        accent: {
          orange: '#9f5f35',
          'orange-bright': '#c97b4a',
          brown: '#4a2c2a',
          violet: '#2e1020',
          purple: '#8b5a8b',
          pink: '#c97b9d',
          cyan: '#6b9f9f',
          indigo: '#6b5a8b',
          gold: '#c9a035',
          'gold-dim': 'rgba(159, 95, 53, 0.15)',
        },
        // Gradient colors
        gradient: {
          orange: '#9f5f35',
          brown: '#4a2c2a',
          violet: '#2e1020',
          deep: '#140a25',
          shadow: '#050308',
        },
        // Text colors
        text: {
          primary: '#f5e6d3',
          secondary: '#b8a090',
          muted: '#7a6a5a',
        },
        // Tag colors
        tag: {
          bg: 'rgba(255, 255, 255, 0.05)',
        },
        // Semantic colors
        background: '#140a25',
        foreground: '#f5e6d3',
        primary: {
          DEFAULT: '#9f5f35',
          foreground: '#f5e6d3',
        },
        secondary: {
          DEFAULT: 'rgba(46, 16, 32, 0.8)',
          foreground: '#f5e6d3',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: 'rgba(74, 44, 42, 0.5)',
          foreground: '#b8a090',
        },
        card: {
          DEFAULT: 'rgba(20, 10, 37, 0.85)',
          foreground: '#f5e6d3',
        },
        input: 'rgba(74, 44, 42, 0.5)',
        ring: '#9f5f35',
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Geist', 'Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.02em',
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      boxShadow: {
        'glow-orange': '0 0 30px rgba(159, 95, 53, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 90, 139, 0.4)',
        'glow-warm': '0 0 25px rgba(201, 123, 74, 0.3)',
        'card-hover': '0 20px 40px -10px rgba(5, 3, 8, 0.5)',
        'analog': '0 8px 32px rgba(5, 3, 8, 0.4)',
      },
      backgroundImage: {
        'analog-gradient': 'radial-gradient(circle at 90% 90%, #9f5f35 0%, #4a2c2a 30%, #140a25 70%, #050308 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise-overlay': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'blob': 'blob 7s infinite',
        'blob-slow': 'blob 10s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
