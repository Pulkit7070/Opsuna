'use client';

import { motion } from 'framer-motion';
import { ExecutionStep, ToolCallResult } from '@opsuna/shared';
import { CheckCircle2, Circle, Loader2, XCircle, SkipForward, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStepperProps {
  steps: ExecutionStep[];
  results: ToolCallResult[];
  currentStepIndex: number;
}

export function ProgressStepper({ steps, results, currentStepIndex }: ProgressStepperProps) {
  const getStepStatus = (stepId: string, index: number) => {
    const result = results.find((r) => r.stepId === stepId);
    if (result) {
      return result.status;
    }
    if (index === currentStepIndex) {
      return 'running';
    }
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <h3 className="font-serif font-medium text-lg text-text-primary flex items-center gap-2">
        <Activity className="h-5 w-5 text-accent-orange" />
        Execution <span className="italic text-gradient">Progress</span>
      </h3>
      <div className="space-y-0">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          const isLast = index === steps.length - 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center mr-4">
                <StepIcon status={status} />
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 h-full min-h-[24px] my-1',
                      status === 'success' ? 'bg-emerald-500' :
                      status === 'failed' ? 'bg-red-500' :
                      'bg-border-subtle'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn(
                'pb-4 flex-1',
                status === 'running' && 'animate-pulse'
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-mono font-medium',
                    status === 'success' && 'text-emerald-400',
                    status === 'failed' && 'text-red-400',
                    status === 'running' && 'text-accent-gold',
                    status === 'skipped' && 'text-text-muted',
                    status === 'pending' && 'text-text-secondary'
                  )}>
                    {step.toolName}
                  </span>
                  <StatusLabel status={status} />
                </div>
                <p className="text-sm text-text-muted mt-1">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
    case 'failed':
      return <XCircle className="h-6 w-6 text-red-500" />;
    case 'running':
      return <Loader2 className="h-6 w-6 text-accent-gold animate-spin" />;
    case 'skipped':
      return <SkipForward className="h-6 w-6 text-text-muted" />;
    default:
      return <Circle className="h-6 w-6 text-text-muted" />;
  }
}

function StatusLabel({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'text-text-muted bg-white/5 border-white/10' },
    running: { label: 'Running...', className: 'text-accent-gold bg-accent-gold/10 border-accent-gold/30' },
    success: { label: 'Success', className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    failed: { label: 'Failed', className: 'text-red-400 bg-red-500/10 border-red-500/30' },
    skipped: { label: 'Skipped', className: 'text-text-muted bg-white/5 border-white/10' },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-mono', className)}>
      {label}
    </span>
  );
}
