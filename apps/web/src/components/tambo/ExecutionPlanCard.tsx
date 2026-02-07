'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  toolName: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface ExecutionPlanCardProps {
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskReason: string;
  steps: Step[];
  onConfirm?: () => void;
  onCancel?: () => void;
  isExecuting?: boolean;
}

const riskConfig = {
  LOW: {
    color: 'text-accent-green',
    bg: 'bg-accent-green/20',
    border: 'border-accent-green/30',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
    icon: CheckCircle2,
  },
  MEDIUM: {
    color: 'text-accent-gold',
    bg: 'bg-accent-gold/20',
    border: 'border-accent-gold/30',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
    icon: AlertTriangle,
  },
  HIGH: {
    color: 'text-accent-red',
    bg: 'bg-accent-red/20',
    border: 'border-accent-red/30',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    icon: Shield,
  },
};

export function ExecutionPlanCard({
  summary,
  riskLevel,
  riskReason,
  steps,
  onConfirm,
  onCancel,
  isExecuting = false,
}: ExecutionPlanCardProps) {
  const config = riskConfig[riskLevel];
  const RiskIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'rounded-xl border bg-surface-elevated p-5',
        config.border,
        config.glow
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
            <Zap className="w-5 h-5 text-accent-orange" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-text-primary">Execution Plan</h3>
            <p className="text-sm text-text-muted">{steps.length} steps</p>
          </div>
        </div>

        {/* Risk Badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full', config.bg)}
        >
          <RiskIcon className={cn('w-4 h-4', config.color)} />
          <span className={cn('text-sm font-medium', config.color)}>
            {riskLevel} Risk
          </span>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-text-primary mb-2"
      >
        {summary}
      </motion.p>
      <p className="text-sm text-text-muted mb-4">{riskReason}</p>

      {/* Steps */}
      <div className="space-y-2 mb-5">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface-base border border-border-subtle"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-medium">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-accent-blue">
                  {step.toolName}
                </span>
                <ChevronRight className="w-3 h-3 text-text-muted" />
                <span className="text-sm text-text-secondary truncate">
                  {step.description}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded',
                riskConfig[step.riskLevel].bg,
                riskConfig[step.riskLevel].color
              )}
            >
              {step.riskLevel}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      {(onConfirm || onCancel) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 pt-4 border-t border-border-subtle"
        >
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isExecuting}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg font-medium transition-all',
                'bg-accent-green/20 hover:bg-accent-green/30 text-accent-green',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isExecuting ? 'Executing...' : 'Confirm & Execute'}
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={isExecuting}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-surface-base hover:bg-surface-elevated text-text-muted transition-colors"
            >
              Cancel
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
