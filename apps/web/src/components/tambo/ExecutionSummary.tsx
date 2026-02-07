'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type ExecutionStatus = 'completed' | 'failed' | 'cancelled';

interface StepResult {
  toolName: string;
  status: 'success' | 'failed';
  summary?: string;
}

interface ExecutionSummaryProps {
  executionId: string;
  status: ExecutionStatus;
  duration: number;
  stepsCompleted: number;
  totalSteps: number;
  results: StepResult[];
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-accent-green',
    bg: 'bg-accent-green/20',
    border: 'border-accent-green/30',
    label: 'Completed Successfully',
  },
  failed: {
    icon: XCircle,
    color: 'text-accent-red',
    bg: 'bg-accent-red/20',
    border: 'border-accent-red/30',
    label: 'Execution Failed',
  },
  cancelled: {
    icon: Clock,
    color: 'text-text-muted',
    bg: 'bg-surface-base',
    border: 'border-border-subtle',
    label: 'Execution Cancelled',
  },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function ExecutionSummary({
  executionId,
  status,
  duration,
  stepsCompleted,
  totalSteps,
  results,
}: ExecutionSummaryProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const successCount = results.filter((r) => r.status === 'success').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border bg-surface-elevated p-5',
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={cn('p-2 rounded-lg', config.bg)}
          >
            <StatusIcon className={cn('w-5 h-5', config.color)} />
          </motion.div>
          <div>
            <h3 className="font-semibold text-text-primary">{config.label}</h3>
            <p className="text-sm text-text-muted font-mono">
              {executionId.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 rounded-lg bg-surface-base text-center"
        >
          <div className="text-lg font-bold text-text-primary">
            {stepsCompleted}/{totalSteps}
          </div>
          <div className="text-xs text-text-muted">Steps</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-3 rounded-lg bg-accent-green/10 text-center"
        >
          <div className="text-lg font-bold text-accent-green">{successCount}</div>
          <div className="text-xs text-text-muted">Passed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 rounded-lg bg-accent-red/10 text-center"
        >
          <div className="text-lg font-bold text-accent-red">{failedCount}</div>
          <div className="text-xs text-text-muted">Failed</div>
        </motion.div>
      </div>

      {/* Results List */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
          Execution Flow
        </div>
        {results.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-lg bg-surface-base"
          >
            {result.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-accent-green flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-accent-red flex-shrink-0" />
            )}
            <span className="font-mono text-sm text-accent-blue">
              {result.toolName}
            </span>
            {result.summary && (
              <>
                <ArrowRight className="w-3 h-3 text-text-muted" />
                <span className="text-sm text-text-muted truncate">
                  {result.summary}
                </span>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* View Details Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 pt-3 border-t border-border-subtle"
      >
        <a
          href={`/executions/${executionId}`}
          className="flex items-center gap-2 text-sm text-accent-blue hover:underline"
        >
          <Zap className="w-4 h-4" />
          <span>View Full Execution Details</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </motion.div>
    </motion.div>
  );
}
