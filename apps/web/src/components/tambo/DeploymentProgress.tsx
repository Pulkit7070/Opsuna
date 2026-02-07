'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Server, TestTube, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'running_tests' | 'completed' | 'failed';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface DeploymentProgressProps {
  environment: string;
  branch: string;
  status: DeploymentStatus;
  currentStage: number;
  totalStages: number;
  logs?: LogEntry[];
}

const stages = [
  { key: 'building', label: 'Building', icon: GitBranch },
  { key: 'deploying', label: 'Deploying', icon: Server },
  { key: 'running_tests', label: 'Testing', icon: TestTube },
  { key: 'completed', label: 'Complete', icon: CheckCircle2 },
];

const statusColors: Record<DeploymentStatus, string> = {
  pending: 'text-text-muted',
  building: 'text-accent-blue',
  deploying: 'text-accent-orange',
  running_tests: 'text-accent-gold',
  completed: 'text-accent-green',
  failed: 'text-accent-red',
};

const logLevelColors = {
  info: 'text-text-muted',
  warn: 'text-accent-gold',
  error: 'text-accent-red',
};

export function DeploymentProgress({
  environment,
  branch,
  status,
  currentStage,
  totalStages,
  logs = [],
}: DeploymentProgressProps) {
  const progress = status === 'completed' ? 100 : (currentStage / totalStages) * 100;
  const isFailed = status === 'failed';
  const isComplete = status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle bg-surface-elevated p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={!isComplete && !isFailed ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className={cn(
              'p-2 rounded-lg',
              isComplete ? 'bg-accent-green/20' : isFailed ? 'bg-accent-red/20' : 'bg-accent-blue/20'
            )}
          >
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-accent-green" />
            ) : isFailed ? (
              <XCircle className="w-5 h-5 text-accent-red" />
            ) : (
              <Loader2 className="w-5 h-5 text-accent-blue" />
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold text-text-primary">Deployment Progress</h3>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="font-mono">{branch}</span>
              <span>→</span>
              <span className="text-accent-orange">{environment}</span>
            </div>
          </div>
        </div>
        <span className={cn('text-sm font-medium capitalize', statusColors[status])}>
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-surface-base rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isFailed ? 'bg-accent-red' : isComplete ? 'bg-accent-green' : 'bg-accent-blue'
          )}
        />
        {!isComplete && !isFailed && (
          <motion.div
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </div>

      {/* Stages */}
      <div className="flex justify-between mb-4">
        {stages.map((stage, index) => {
          const StageIcon = stage.icon;
          const isActive = stage.key === status;
          const isPast = stages.findIndex((s) => s.key === status) > index || isComplete;

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'flex flex-col items-center gap-1',
                isPast ? 'text-accent-green' : isActive ? 'text-accent-blue' : 'text-text-muted'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isPast ? 'bg-accent-green/20' : isActive ? 'bg-accent-blue/20' : 'bg-surface-base'
                )}
              >
                <StageIcon className="w-4 h-4" />
              </div>
              <span className="text-xs">{stage.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="mt-4 p-3 bg-surface-base rounded-lg max-h-32 overflow-y-auto font-mono text-xs">
          <AnimatePresence mode="popLayout">
            {logs.slice(-5).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                <span className="text-text-muted">{log.timestamp}</span>
                <span className={logLevelColors[log.level]}>[{log.level.toUpperCase()}]</span>
                <span className="text-text-secondary">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
