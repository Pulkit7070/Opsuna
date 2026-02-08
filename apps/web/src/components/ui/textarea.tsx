import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-md border bg-bg-primary px-4 py-3 text-sm text-text-primary transition-all duration-150',
          'placeholder:text-text-muted resize-none',
          'hover:border-border-highlight',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent',
          'focus-visible:shadow-[0_0_0_3px_rgba(15,227,194,0.1)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent',
          error
            ? 'border-destructive focus-visible:ring-destructive focus-visible:border-destructive'
            : 'border-border-subtle',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
