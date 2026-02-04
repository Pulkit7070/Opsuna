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
        // Surface colors - Dark Academia
        surface: {
          base: '#09090b',
          card: '#121212',
          'card-hover': '#18181b',
          input: '#0E0E10',
        },
        // Border colors
        border: {
          subtle: '#27272a',
          highlight: '#3f3f46',
          DEFAULT: '#27272a',
        },
        // Gold accent colors
        accent: {
          gold: '#D4AF37',
          'gold-dim': 'rgba(212, 175, 55, 0.1)',
          'gold-glow': 'rgba(212, 175, 55, 0.03)',
        },
        // Text colors
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
        // Tag colors
        tag: {
          bg: 'rgba(255, 255, 255, 0.05)',
        },
        // Semantic colors
        background: '#000000',
        foreground: '#FAFAFA',
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#121212',
          foreground: '#FAFAFA',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#121212',
          foreground: '#A1A1AA',
        },
        card: {
          DEFAULT: '#0E0E10',
          foreground: '#FAFAFA',
        },
        input: '#0E0E10',
        ring: '#D4AF37',
      },
      fontFamily: {
        serif: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
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
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
        'vignette': 'inset 0 0 150px rgba(0,0,0,0.9)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37, #B8860B)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'blob-slow': 'blob 10s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gold-pulse': 'gold-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gold-pulse': {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
