import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'muted';
}

export function Spinner({ className, size = 'md', variant = 'default' }: SpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3 border',
    sm: 'h-4 w-4 border-[1.5px]',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
    xl: 'h-12 w-12 border-[3px]',
  };

  const variantClasses = {
    default: 'border-current border-t-transparent',
    primary: 'border-accent border-t-transparent',
    muted: 'border-text-muted border-t-transparent',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

// Dots variant for alternative loading state
export function SpinnerDots({ className, size = 'md' }: Omit<SpinnerProps, 'variant'>) {
  const sizeClasses = {
    xs: 'gap-0.5 [&>div]:h-1 [&>div]:w-1',
    sm: 'gap-1 [&>div]:h-1.5 [&>div]:w-1.5',
    md: 'gap-1.5 [&>div]:h-2 [&>div]:w-2',
    lg: 'gap-2 [&>div]:h-2.5 [&>div]:w-2.5',
    xl: 'gap-2.5 [&>div]:h-3 [&>div]:w-3',
  };

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      <div className="rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
      <div className="rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
      <div className="rounded-full bg-accent animate-bounce" />
    </div>
  );
}

// Pulse variant
export function SpinnerPulse({ className, size = 'md' }: Omit<SpinnerProps, 'variant'>) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-accent/30 animate-pulse',
        sizeClasses[size],
        className
      )}
    />
  );
}
