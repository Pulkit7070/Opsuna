'use client';

import { motion } from 'framer-motion';
import { ExecutionPlan } from '@opsuna/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ConfirmActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  plan: ExecutionPlan;
  isLoading?: boolean;
}

export function ConfirmActionModal({
  open,
  onClose,
  onConfirm,
  onCancel,
  plan,
  isLoading,
}: ConfirmActionModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-surface-card border-accent-orange/30">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent-orange/10 border border-accent-orange/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-accent-orange" />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif text-text-primary">
                Confirm <span className="italic text-gradient">Execution</span>
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                You are about to execute the following plan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-surface-base rounded-lg border border-border-subtle">
            <p className="font-medium text-text-primary">{plan.summary}</p>
            <p className="text-sm text-text-muted mt-2 font-mono">
              {plan.steps.length} step{plan.steps.length !== 1 ? 's' : ''} will be executed
            </p>
          </div>

          <div className="space-y-2">
            {plan.steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-accent-orange/10 border border-accent-orange/30
                                text-accent-orange flex items-center justify-center text-xs font-mono">
                  {i + 1}
                </div>
                <span className="font-mono text-text-secondary">{step.toolName}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-surface-base border border-border-subtle rounded-lg
                       text-text-secondary hover:text-text-primary hover:border-border-highlight
                       transition-all disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-accent-orange to-accent-orange-bright text-white rounded-lg font-medium
                       hover:shadow-glow-orange transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Execute
              </>
            )}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
