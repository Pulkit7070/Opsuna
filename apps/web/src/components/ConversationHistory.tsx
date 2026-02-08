'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMemory, ConversationMessage } from '@/hooks/useMemory';
import { Spinner } from '@/components/ui/spinner';

interface ConversationHistoryProps {
  limit?: number;
  executionId?: string;
  showClearButton?: boolean;
}

export function ConversationHistory({
  limit = 20,
  executionId,
  showClearButton = false,
}: ConversationHistoryProps) {
  const { getHistory, clearHistory, loading, error } = useMemory();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [limit, executionId]);

  const loadHistory = async () => {
    const history = await getHistory({ limit, executionId });
    setMessages(history);
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear conversation history?')) {
      return;
    }

    setClearing(true);
    const success = await clearHistory();
    if (success) {
      setMessages([]);
    }
    setClearing(false);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-sm py-4 text-center">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-text-muted text-sm py-8 text-center">
        No conversation history yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showClearButton && (
        <div className="flex justify-end">
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-xs text-text-muted hover:text-destructive transition-colors disabled:opacity-50"
          >
            {clearing ? 'Clearing...' : 'Clear History'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  index,
}: {
  message: ConversationMessage;
  index: number;
}) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-accent/20 text-accent border border-accent/30'
            : isSystem
            ? 'bg-bg-elevated text-text-muted italic'
            : 'bg-bg-elevated text-text-primary'
        }`}
      >
        {/* Role indicator */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium uppercase tracking-wide opacity-60">
            {message.role}
          </span>
          <span className="text-xs opacity-40">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Metadata */}
        {message.metadata && (
          <div className="mt-2 pt-2 border-t border-white/10">
            {message.metadata.riskLevel != null && (
              <span
                className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                  message.metadata.riskLevel === 'HIGH'
                    ? 'bg-destructive/20 text-destructive'
                    : message.metadata.riskLevel === 'MEDIUM'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-success/20 text-success'
                }`}
              >
                {String(message.metadata.riskLevel)} risk
              </span>
            )}
            {message.metadata.stepCount != null && (
              <span className="text-xs text-text-muted ml-2">
                {String(message.metadata.stepCount)} steps
              </span>
            )}
          </div>
        )}

        {/* Execution link */}
        {message.executionId && (
          <div className="mt-1 text-xs text-text-muted">
            Execution: {message.executionId.slice(0, 8)}...
          </div>
        )}
      </div>
    </motion.div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
