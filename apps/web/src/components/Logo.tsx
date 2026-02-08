'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizes = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56,
};

const textSizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  const pixelSize = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer ring with gradient */}
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="url(#opsuna-gradient)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Inner dynamic flow mark - solid arc */}
        <path
          d="M14 20C14 16.5 16.5 14 20 14C23.5 14 26 16.5 26 20"
          stroke="url(#opsuna-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Inner dynamic flow mark - dashed arc */}
        <path
          d="M26 20C26 23.5 23.5 26 20 26C16.5 26 14 23.5 14 20"
          stroke="url(#opsuna-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />

        {/* Central action dot */}
        <circle cx="20" cy="20" r="3" fill="url(#opsuna-gradient)" />

        {/* Action arrow - top right */}
        <path
          d="M28 12L31 9M31 9L28 9M31 9L31 12"
          stroke="url(#opsuna-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient
            id="opsuna-gradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span className={cn('font-semibold tracking-tight', textSizes[size])}>
          <span className="text-text-primary">Opsuna</span>
          <span className="text-accent">.</span>
        </span>
      )}
    </div>
  );
}

// Standalone icon version (no text)
export function LogoIcon({ size = 'md', className }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} className={className} showText={false} />;
}
