'use client';

import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

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
      className="card p-6"
    >
      <div className="space-y-5">
        {/* Header */}
        <label htmlFor="prompt" className="text-lg font-semibold text-white">
          What would you like to automate?
        </label>

        {/* Input area */}
        <div className="relative">
          <textarea
            id="prompt"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Deploy staging and run smoke tests"
            className="w-full min-h-[120px] px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg
                       text-white placeholder:text-[#71717A]
                       focus:outline-none focus:border-white focus:ring-1 focus:ring-white/10
                       resize-none transition-all duration-200"
            disabled={disabled || isLoading}
          />

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmit}
            disabled={!value.trim() || isLoading || disabled}
            className="absolute bottom-3 right-3 p-2.5 bg-white text-black rounded-md
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:bg-[#E5E5E5] transition-all duration-200"
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
          <div className="text-xs text-[#71717A]">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-[#111111] border border-[#333333] rounded text-[#A1A1AA]">
              Ctrl
            </kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-[#111111] border border-[#333333] rounded text-[#A1A1AA]">
              Enter
            </kbd>
            {' '}to submit
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating plan...</span>
            </div>
          )}
        </div>

        {/* Example prompts */}
        <div className="pt-4 border-t border-[#333333]">
          <p className="text-xs text-[#71717A] mb-3 uppercase tracking-wider">
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
                className="text-xs px-3 py-1.5 bg-[#111111] border border-[#333333] rounded-full
                           text-[#A1A1AA] hover:text-white hover:border-[#444444]
                           transition-all duration-200 disabled:opacity-50"
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
