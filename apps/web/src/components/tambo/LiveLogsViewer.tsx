'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogEntry } from '@opsuna/shared';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveLogsViewerProps {
  logs: LogEntry[];
  isStreaming?: boolean;
  maxHeight?: string;
}

export function LiveLogsViewer({
  logs,
  isStreaming = false,
  maxHeight = '300px',
}: LiveLogsViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between">
        <h3 className="text-lg font-serif font-medium text-text-primary flex items-center gap-2">
          <Terminal className="h-5 w-5 text-accent-gold" />
          Live <span className="italic text-gradient-cyan">Logs</span>
        </h3>
        {isStreaming && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-green-400">Streaming</span>
          </div>
        )}
      </div>

      {/* Log content */}
      <div
        ref={scrollRef}
        className="bg-black/50 p-4 font-mono text-sm overflow-auto"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <div className="text-text-muted text-center py-8">
            <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for logs...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <LogLine key={index} log={log} index={index} />
            ))}
          </div>
        )}
        {isStreaming && (
          <div className="flex items-center gap-1 mt-2 text-accent-gold">
            <span className="animate-pulse">|</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LogLine({ log, index }: { log: LogEntry; index: number }) {
  const timestamp = new Date(log.timestamp).toLocaleTimeString();

  const levelConfig = {
    info: { color: 'text-blue-400', prefix: 'INFO ' },
    warn: { color: 'text-yellow-400', prefix: 'WARN ' },
    error: { color: 'text-red-400', prefix: 'ERROR' },
    debug: { color: 'text-text-muted', prefix: 'DEBUG' },
  };

  const { color, prefix } = levelConfig[log.level];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex gap-3 hover:bg-white/5 px-2 py-0.5 rounded transition-colors"
    >
      <span className="text-text-muted flex-shrink-0">{timestamp}</span>
      <span className={cn('flex-shrink-0 w-12', color)}>
        [{prefix}]
      </span>
      <span className="text-text-secondary break-all">{log.message}</span>
    </motion.div>
  );
}
