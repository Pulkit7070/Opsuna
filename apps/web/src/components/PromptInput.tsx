'use client';

import { motion } from 'framer-motion';
import { Wand2, Loader2, ArrowRight, Terminal } from 'lucide-react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
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
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card glow-border p-6"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-accent-orange" />
          <label htmlFor="prompt" className="text-lg font-serif font-medium text-text-primary">
            What would you like to <span className="italic text-gradient">automate</span>?
          </label>
        </div>

        {/* Input area */}
        <div className="relative">
          <textarea
            id="prompt"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Deploy staging and run smoke tests"
            className="w-full min-h-[120px] px-4 py-3 bg-surface-base/50 border border-accent-orange/15 rounded-lg
                       text-text-primary placeholder:text-text-muted font-sans
                       focus:outline-none focus:border-accent-orange focus:ring-1 focus:ring-accent-orange/50
                       resize-none transition-all duration-200 backdrop-blur-sm"
            disabled={disabled || isLoading}
            style={{ caretColor: '#9f5f35' }}
          />

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmit}
            disabled={!value.trim() || isLoading || disabled}
            className="absolute bottom-3 right-3 p-2.5 bg-gradient-to-r from-accent-orange to-accent-orange-bright text-text-primary rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-glow-orange transition-all duration-200"
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
          <div className="text-xs font-mono text-text-muted">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-secondary">
              Ctrl
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-text-secondary">
              Enter
            </kbd>
            {' '}to submit
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-accent-orange">
              <Wand2 className="h-4 w-4 animate-pulse" />
              <span className="font-mono">Generating plan...</span>
            </div>
          )}
        </div>

        {/* Example prompts */}
        <div className="pt-2 border-t border-white/5">
          <p className="text-xs font-mono text-text-muted mb-3 uppercase tracking-wider">
            Try an example
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <motion.button
                key={prompt}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(prompt)}
                disabled={isLoading || disabled}
                className="text-xs px-3 py-1.5 bg-accent-orange/5 border border-accent-orange/15 rounded-full
                           text-text-secondary hover:text-text-primary hover:border-accent-orange/40
                           hover:bg-accent-orange/10 transition-all duration-200 disabled:opacity-50"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
