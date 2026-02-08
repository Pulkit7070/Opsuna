'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useToasts, useUIStore } from '@/store/ui';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const toasts = useToasts();
  const { removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
  };
  onDismiss: () => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-success/10',
      border: 'border-success/30',
      iconColor: 'text-success',
      titleColor: 'text-success',
    },
    error: {
      icon: XCircle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      iconColor: 'text-destructive',
      titleColor: 'text-destructive',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      iconColor: 'text-warning',
      titleColor: 'text-warning',
    },
    info: {
      icon: Info,
      bg: 'bg-info/10',
      border: 'border-info/30',
      iconColor: 'text-info',
      titleColor: 'text-info',
    },
  };

  const { icon: Icon, bg, border, iconColor, titleColor } = config[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className={cn(
        'relative p-4 rounded-lg border backdrop-blur-xl',
        bg, border
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0', iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium', titleColor)}>{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-text-secondary mt-1">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
