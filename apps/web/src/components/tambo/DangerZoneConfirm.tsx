'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionPlan } from '@opsuna/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';

interface DangerZoneConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (phrase: string) => void;
  onCancel: () => void;
  plan: ExecutionPlan;
  isLoading?: boolean;
}

const CONFIRM_PHRASE = 'I understand the risks';

export function DangerZoneConfirm({
  open,
  onClose,
  onConfirm,
  onCancel,
  plan,
  isLoading,
}: DangerZoneConfirmProps) {
  const [inputValue, setInputValue] = useState('');
  const isValid = inputValue === CONFIRM_PHRASE;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(CONFIRM_PHRASE);
      setInputValue('');
    }
  };

  const handleClose = () => {
    setInputValue('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg bg-surface-card border-red-500/30">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-serif text-red-400">
                High Risk <span className="italic">Action</span>
              </DialogTitle>
              <DialogDescription className="text-text-secondary">
                This action has potentially irreversible consequences.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Warning alert */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-serif font-medium text-red-300">Warning</p>
                <p className="text-sm text-red-200/80 mt-1">{plan.riskReason}</p>
              </div>
            </div>
          </motion.div>

          {/* Plan summary */}
          <div className="p-4 bg-surface-base rounded-lg border border-border-subtle">
            <p className="font-medium text-text-primary">{plan.summary}</p>
            <div className="mt-3 space-y-1.5">
              {plan.steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-mono">
                    {i + 1}
                  </span>
                  <span className="font-mono text-text-secondary">{step.toolName}</span>
                  <span className="text-text-muted">-</span>
                  <span className="text-text-muted text-xs">{step.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation input */}
          <div className="space-y-2">
            <label className="text-sm text-text-secondary">
              Type{' '}
              <code className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 font-mono">
                {CONFIRM_PHRASE}
              </code>
              {' '}to confirm:
            </label>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="w-full px-4 py-3 bg-surface-base border border-border-subtle rounded-lg
                         text-text-primary font-mono placeholder:text-text-muted
                         focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30
                         transition-all"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
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
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium
                       hover:bg-red-600 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4" />
                Execute High Risk Action
              </>
            )}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
