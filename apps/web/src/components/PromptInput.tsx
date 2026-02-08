'use client';

import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const EXAMPLE_PROMPTS = [
  'Deploy staging and run smoke tests',
  'Create a PR from feature-branch to main',
  'Notify the team on Slack about deployment',
  'Rollback staging to previous version',
];

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <label htmlFor="prompt" className="font-semibold text-lg text-text-primary block">
        What would you like to <span className="accent-text">automate</span>?
      </label>

      {/* Input area */}
      <div className="relative">
        <textarea
          id="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Deploy staging and run smoke tests"
          className="w-full min-h-[120px] px-5 py-4 bg-bg-primary border border-border-subtle rounded-xl
                     text-text-primary placeholder:text-text-muted font-normal
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                     resize-none transition-all duration-200"
          style={{ caretColor: '#0FE3C2' }}
          disabled={disabled || isLoading}
        />

        {/* Submit button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSubmit(value)}
          disabled={!value.trim() || isLoading || disabled}
          className="absolute bottom-4 right-4 p-3 bg-accent text-bg-primary rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 hover:bg-accent-hover hover:shadow-glow"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </motion.button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-muted font-mono">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border-subtle rounded text-text-secondary">
            Ctrl
          </kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 bg-bg-elevated border border-border-subtle rounded text-text-secondary">
            Enter
          </kbd>
          {' '}to submit
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-mono text-xs">Generating plan...</span>
          </div>
        )}
      </div>

      {/* Example prompts */}
      <div className="pt-4 border-t border-border-subtle">
        <p className="text-xs text-text-muted mb-3 uppercase tracking-wider font-mono">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <motion.button
              key={prompt}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(prompt)}
              disabled={isLoading || disabled}
              className="text-xs px-3 py-1.5 bg-bg-elevated border border-border-subtle rounded-full
                         text-text-secondary hover:text-text-primary hover:border-accent/30
                         transition-all duration-200 disabled:opacity-50"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
