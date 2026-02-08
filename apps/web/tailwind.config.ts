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
        // Background colors - Modern Dark SaaS
        bg: {
          primary: '#0B0F12',
          surface: '#12181D',
          elevated: '#182028',
          overlay: 'rgba(11, 15, 18, 0.8)',
        },
        // Accent colors - Teal/Cyan
        accent: {
          DEFAULT: '#0FE3C2',
          hover: '#0CC7AC',
          muted: '#0FE3C2',
          glow: 'rgba(15, 227, 194, 0.25)',
          dim: 'rgba(15, 227, 194, 0.1)',
        },
        // Text colors
        text: {
          primary: '#F5F7FA',
          secondary: '#9FB0C0',
          muted: '#6B7C8F',
        },
        // Border colors
        border: {
          subtle: '#1F2A33',
          DEFAULT: '#1F2A33',
          highlight: '#2A3744',
        },
        // Surface colors (legacy support)
        surface: {
          base: '#0B0F12',
          card: '#12181D',
          'card-hover': '#182028',
          input: '#0B0F12',
        },
        // Tag colors
        tag: {
          bg: 'rgba(15, 227, 194, 0.1)',
        },
        // Semantic colors
        background: '#0B0F12',
        foreground: '#F5F7FA',
        primary: {
          DEFAULT: '#0FE3C2',
          foreground: '#0B0F12',
        },
        secondary: {
          DEFAULT: '#12181D',
          foreground: '#F5F7FA',
        },
        destructive: {
          DEFAULT: '#F87171',
          foreground: '#0B0F12',
        },
        success: {
          DEFAULT: '#34D399',
          foreground: '#0B0F12',
        },
        warning: {
          DEFAULT: '#FBBF24',
          foreground: '#0B0F12',
        },
        info: {
          DEFAULT: '#60A5FA',
          foreground: '#0B0F12',
        },
        muted: {
          DEFAULT: '#12181D',
          foreground: '#9FB0C0',
        },
        card: {
          DEFAULT: '#12181D',
          foreground: '#F5F7FA',
        },
        input: '#0B0F12',
        ring: '#0FE3C2',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 2px 6px rgba(0, 0, 0, 0.25)',
        'soft': '0 8px 24px rgba(0, 0, 0, 0.35)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 32px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(15, 227, 194, 0.25)',
        'glow-lg': '0 0 40px rgba(15, 227, 194, 0.35)',
        'inner-glow': 'inset 0 0 20px rgba(15, 227, 194, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'accent-gradient': 'linear-gradient(135deg, #0FE3C2, #0CC7AC)',
        'surface-gradient': 'linear-gradient(180deg, #182028 0%, #12181D 100%)',
        'glow-gradient': 'radial-gradient(ellipse at center, rgba(15, 227, 194, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(15, 227, 194, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(15, 227, 194, 0.4)' },
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
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
};
export default config;
