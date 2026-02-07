'use client';

import { motion } from 'framer-motion';
import { Hash, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlackMessagePreviewProps {
  channel: string;
  message: string;
  timestamp?: string;
  sent?: boolean;
  permalink?: string;
}

export function SlackMessagePreview({
  channel,
  message,
  timestamp,
  sent = false,
  permalink,
}: SlackMessagePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border bg-surface-elevated p-4',
        sent ? 'border-accent-green/30' : 'border-border-subtle'
      )}
    >
      {/* Slack-style header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#4A154B] flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white"
              fill="currentColor"
            >
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <Hash className="w-4 h-4" />
            <span className="font-medium">{channel.replace('#', '')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sent ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex items-center gap-1 text-xs text-accent-green"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Sent</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              <span>Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Message bubble */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'p-3 rounded-lg',
            sent ? 'bg-accent-green/10' : 'bg-surface-base'
          )}
        >
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded bg-accent-orange/20 flex items-center justify-center flex-shrink-0">
              <span className="text-accent-orange font-bold text-sm">O</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-text-primary text-sm">Opsuna Tambo</span>
                <span className="text-xs text-text-muted">
                  {timestamp || new Date().toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{message}</p>
            </div>
          </div>
        </motion.div>

        {/* Permalink */}
        {permalink && (
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            href={permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 mt-2 text-xs text-accent-blue hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View in Slack</span>
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}
