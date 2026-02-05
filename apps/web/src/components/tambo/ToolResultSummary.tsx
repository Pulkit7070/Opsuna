'use client';

import { motion } from 'framer-motion';
import { ToolCallResult } from '@opsuna/shared';
import { CheckCircle2, XCircle, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolResultSummaryProps {
  results: ToolCallResult[];
}

export function ToolResultSummary({ results }: ToolResultSummaryProps) {
  const succeeded = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-5 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-medium text-text-primary flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent-orange" />
            Execution <span className="italic text-gradient">Results</span>
          </h3>
          <div className="flex gap-2">
            {succeeded > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {succeeded} Succeeded
              </span>
            )}
            {failed > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-red-500/10 text-red-400 border border-red-500/30">
                {failed} Failed
              </span>
            )}
            {skipped > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-white/5 text-text-muted border border-white/10">
                {skipped} Skipped
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {results.map((result, index) => (
          <ResultCard key={result.stepId} result={result} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

function ResultCard({ result, index }: { result: ToolCallResult; index: number }) {
  const duration = result.startedAt && result.completedAt
    ? new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-lg border',
        result.status === 'success' && 'bg-emerald-500/5 border-emerald-500/20',
        result.status === 'failed' && 'bg-red-500/5 border-red-500/20',
        result.status === 'skipped' && 'bg-white/5 border-white/10'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {result.status === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : result.status === 'failed' ? (
            <XCircle className="h-5 w-5 text-red-400" />
          ) : (
            <Clock className="h-5 w-5 text-text-muted" />
          )}
          <span className="font-mono font-medium text-text-primary">{result.toolName}</span>
        </div>
        {duration !== null && (
          <span className="text-xs font-mono text-text-muted">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {result.error && (
        <p className="text-sm text-red-400 mt-2 ml-7">{result.error}</p>
      )}

      {result.result != null && typeof result.result === 'object' && (
        <div className="mt-2 ml-7">
          <details className="text-sm">
            <summary className="cursor-pointer text-text-muted hover:text-text-secondary transition-colors">
              View details
            </summary>
            <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-text-secondary overflow-auto font-mono">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </motion.div>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
