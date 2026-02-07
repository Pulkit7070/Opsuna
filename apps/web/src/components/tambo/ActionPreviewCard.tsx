'use client';

import { motion } from 'framer-motion';
import { ExecutionPlan, RiskLevel } from '@opsuna/shared';
import { AlertTriangle, CheckCircle2, Shield, Zap, RotateCcw, Loader2, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionPreviewCardProps {
  plan: ExecutionPlan;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ActionPreviewCard({ plan, onConfirm, onCancel, isLoading }: ActionPreviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-border-subtle">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-serif font-medium text-text-primary flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-orange" />
              Execution <span className="italic text-gradient">Plan</span>
            </h3>
            <p className="text-text-secondary mt-1">{plan.summary}</p>
          </div>
          <RiskBadge level={plan.riskLevel} />
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Risk Assessment */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'p-4 rounded-lg border-l-2',
            plan.riskLevel === 'HIGH' ? 'bg-red-500/5 border-red-500 text-red-200' :
            plan.riskLevel === 'MEDIUM' ? 'bg-yellow-500/5 border-yellow-500 text-yellow-200' :
            'bg-green-500/5 border-green-500 text-green-200'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-serif font-medium">Risk Assessment</span>
          </div>
          <p className="text-sm opacity-80">{plan.riskReason}</p>
        </motion.div>

        {/* Steps */}
        <div>
          <h4 className="font-serif font-medium text-text-primary mb-4 flex items-center gap-2">
            Steps to <span className="italic text-gradient">Execute</span>
          </h4>
          <div className="space-y-3">
            {plan.steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-start gap-3 p-4 bg-surface-base/50 rounded-lg border border-border-subtle
                           hover:border-border-highlight transition-colors group"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent-orange/10 border border-accent-orange/30
                                flex items-center justify-center text-sm font-mono text-accent-orange">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-text-primary group-hover:text-accent-orange transition-colors">
                      {step.toolName}
                    </span>
                    <RiskBadge level={step.riskLevel} size="sm" />
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {step.description}
                  </p>
                  {Object.keys(step.parameters).length > 0 && (
                    <div className="mt-3 p-2.5 bg-black/30 rounded-md font-mono text-xs">
                      {Object.entries(step.parameters).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-text-muted">{key}:</span>
                          <span className="text-accent-gold">{JSON.stringify(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rollback steps */}
        {plan.rollbackSteps && plan.rollbackSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-4 border-t border-border-subtle"
          >
            <h4 className="font-serif font-medium text-orange-400 mb-3 flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Rollback <span className="italic">Available</span>
            </h4>
            <div className="space-y-2">
              {plan.rollbackSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-start gap-2 p-3 bg-orange-500/5 rounded-lg border border-orange-500/20 text-sm"
                >
                  <span className="text-orange-400 font-mono">R{index + 1}.</span>
                  <span className="text-orange-200">{step.description}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Confirmation buttons */}
        {(onConfirm || onCancel) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-6 border-t border-border-subtle flex items-center justify-end gap-3"
          >
            {onCancel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                disabled={isLoading}
                className="px-5 py-2.5 bg-surface-base border border-border-subtle rounded-lg
                           text-text-secondary hover:text-text-primary hover:border-border-highlight
                           transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </motion.button>
            )}
            {onConfirm && (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2',
                  plan.riskLevel === 'HIGH'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-accent-orange to-accent-orange-bright text-black hover:shadow-glow-orange',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {plan.riskLevel === 'HIGH' ? 'Execute (High Risk)' : 'Execute Plan'}
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function RiskBadge({ level, size = 'default' }: { level: RiskLevel; size?: 'default' | 'sm' }) {
  const config = {
    LOW: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle2,
      label: 'Low Risk',
    },
    MEDIUM: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: AlertTriangle,
      label: 'Medium Risk',
    },
    HIGH: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: AlertTriangle,
      label: 'High Risk',
    },
  };

  const { bg, border, text, icon: Icon, label } = config[level];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-mono',
      bg, border, text,
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
    )}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {label}
    </span>
  );
}
