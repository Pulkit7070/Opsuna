'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemory, MemoryRecord, ToolPattern } from '@/hooks/useMemory';
import { Spinner } from '@/components/ui/spinner';

interface MemoryPanelProps {
  query?: string;
  isVisible?: boolean;
  onClose?: () => void;
}

export function MemoryPanel({ query, isVisible = true, onClose }: MemoryPanelProps) {
  const { searchMemory, getPatterns, loading } = useMemory();
  const [relevantMemories, setRelevantMemories] = useState<MemoryRecord[]>([]);
  const [patterns, setPatterns] = useState<ToolPattern[]>([]);

  useEffect(() => {
    if (query && isVisible) {
      // Fetch relevant memories based on query
      searchMemory(query, { limit: 3 }).then(setRelevantMemories);
      // Fetch tool patterns
      getPatterns().then((p) => setPatterns(p.slice(0, 5)));
    }
  }, [query, isVisible, searchMemory, getPatterns]);

  const hasContent = relevantMemories.length > 0 || patterns.length > 0;

  if (!isVisible || !hasContent) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-bg-surface/80 backdrop-blur-sm border border-accent/20 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="text-sm font-medium text-accent">AI Memory Context</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <Spinner size="xs" variant="primary" />
            <span>Loading memories...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {/* Relevant Past Executions */}
            {relevantMemories.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                  Relevant Past Executions
                </h4>
                <div className="space-y-2">
                  {relevantMemories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} />
                  ))}
                </div>
              </div>
            )}

            {/* Tool Patterns */}
            {patterns.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                  Tool Usage Patterns
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patterns.map((pattern) => (
                    <PatternBadge key={pattern.toolName} pattern={pattern} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function MemoryCard({ memory }: { memory: MemoryRecord }) {
  const similarityPercent = memory.similarity
    ? Math.round(memory.similarity * 100)
    : null;

  return (
    <div className="bg-bg-elevated rounded p-2 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-text-secondary line-clamp-2">{memory.content}</p>
        {similarityPercent && (
          <span className="text-xs text-accent whitespace-nowrap">
            {similarityPercent}% match
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
        <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
        <span className="capitalize">{memory.type}</span>
      </div>
    </div>
  );
}

function PatternBadge({ pattern }: { pattern: ToolPattern }) {
  const successRate = Math.round(pattern.successRate * 100);
  const total = pattern.successCount + pattern.failureCount;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-bg-elevated rounded text-xs">
      <span className="text-text-secondary">{pattern.toolName}</span>
      <span
        className={`font-medium ${
          successRate >= 80
            ? 'text-success'
            : successRate >= 50
            ? 'text-warning'
            : 'text-destructive'
        }`}
      >
        {successRate}%
      </span>
      <span className="text-text-muted">({total})</span>
    </div>
  );
}
