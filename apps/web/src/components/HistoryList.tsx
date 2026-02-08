'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionSummary } from '@opsuna/shared';
import { getExecutions } from '@/hooks/useApi';
import { History, ChevronRight, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

interface HistoryListProps {
  onSelect?: (executionId: string) => void;
}

export function HistoryList({ onSelect }: HistoryListProps) {
  const [executions, setExecutions] = useState<ExecutionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadExecutions = async () => {
    setIsLoading(true);
    try {
      const response = await getExecutions() as { success: boolean; data?: { executions: ExecutionSummary[] } };
      if (response.success && response.data) {
        setExecutions(response.data.executions);
      }
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  return (
    <div className="card">
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-text-primary flex items-center gap-2">
            <History className="h-4 w-4 text-accent" />
            Recent Executions
          </h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={loadExecutions}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </motion.button>
        </div>
      </div>

      <div className="p-2">
        {isLoading && executions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="md" variant="primary" />
          </div>
        ) : executions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-text-muted mb-2" />
            <p className="text-sm text-text-muted">No executions yet</p>
            <p className="text-xs text-text-muted mt-1 font-mono">Your history will appear here</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-1">
              {executions.slice(0, 10).map((exec, index) => (
                <motion.button
                  key={exec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect?.(exec.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-bg-elevated
                             transition-all duration-200 group flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary truncate group-hover:text-accent transition-colors">
                      {exec.prompt}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={exec.status} />
                      <span className="text-xs text-text-muted font-mono">
                        {formatDate(exec.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'secondary' | 'warning' | 'info' | 'success' | 'destructive' | 'default' }> = {
    pending: { variant: 'secondary' },
    awaiting_confirmation: { variant: 'warning' },
    executing: { variant: 'info' },
    completed: { variant: 'success' },
    failed: { variant: 'destructive' },
    cancelled: { variant: 'secondary' },
    rolled_back: { variant: 'warning' },
  };

  const { variant } = config[status] || config.pending;

  return (
    <Badge variant={variant} size="sm">
      {status.replace('_', ' ')}
    </Badge>
  );
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}
