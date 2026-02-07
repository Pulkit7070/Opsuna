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
      <label htmlFor="prompt" className="font-serif text-lg text-[#F2F2F2] block">
        What would you like to <em className="gold-text">automate</em>?
      </label>

      {/* Input area */}
      <div className="relative">
        <textarea
          id="prompt"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Deploy staging and run smoke tests"
          className="w-full min-h-[120px] px-5 py-4 bg-transparent border border-[#333] rounded-xl
                     text-[#F2F2F2] placeholder:text-[#71717A] font-light
                     focus:outline-none focus:border-[#D4AF37]
                     resize-none transition-all duration-200"
          style={{ caretColor: '#D4AF37' }}
          disabled={disabled || isLoading}
        />

        {/* Submit button - Gold */}
        <motion.button
          whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSubmit(value)}
          disabled={!value.trim() || isLoading || disabled}
          className="absolute bottom-4 right-4 p-3 bg-[#D4AF37] text-black rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
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
        <div className="text-xs text-[#71717A] font-mono">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[#A1A1AA]">
            Ctrl
          </kbd>
          {' + '}
          <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[#A1A1AA]">
            Enter
          </kbd>
          {' '}to submit
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-[#D4AF37]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-mono text-xs">Generating plan...</span>
          </div>
        )}
      </div>

      {/* Example prompts */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-[#71717A] mb-3 uppercase tracking-wider font-mono">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <motion.button
              key={prompt}
              whileHover={{ scale: 1.02, borderColor: 'rgba(212, 175, 55, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(prompt)}
              disabled={isLoading || disabled}
              className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full
                         text-[#A1A1AA] hover:text-[#F2F2F2]
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
