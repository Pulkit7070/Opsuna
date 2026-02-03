'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionSummary } from '@opsuna/shared';
import { getExecutions } from '@/hooks/useApi';
import { History, ChevronRight, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryListProps {
  onSelect?: (executionId: string) => void;
}

export function HistoryList({ onSelect }: HistoryListProps) {
  const [executions, setExecutions] = useState<ExecutionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadExecutions = async () => {
    setIsLoading(true);
    try {
      const response = await getExecutions();
      if (response.success) {
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
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-[#A1A1AA]" />
            Recent Executions
          </h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={loadExecutions}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-[#71717A] hover:text-white transition-colors"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </motion.button>
        </div>
      </div>

      <div className="p-2">
        {executions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-[#71717A] mb-2" />
            <p className="text-sm text-[#71717A]">No executions yet</p>
            <p className="text-xs text-[#71717A] mt-1">Your history will appear here</p>
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
                  className="w-full text-left p-3 rounded-lg hover:bg-[#1a1a1a]
                             transition-all duration-200 group flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate group-hover:text-white transition-colors">
                      {exec.prompt}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={exec.status} />
                      <span className="text-xs text-[#71717A]">
                        {formatDate(exec.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#71717A] group-hover:text-white group-hover:translate-x-1 transition-all" />
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
  const config: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
    awaiting_confirmation: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    executing: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    cancelled: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
    rolled_back: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  };

  const { bg, text, border } = config[status] || config.pending;

  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-mono', bg, text, border)}>
      {status.replace('_', ' ')}
    </span>
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
