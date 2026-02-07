'use client';

import { motion } from 'framer-motion';
import { User, Bot, Zap, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { ExecutionPlan, ToolCallResult, ExecutionStatus } from '@opsuna/shared';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type MessageRole = 'user' | 'assistant' | 'system' | 'execution';

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  plan?: ExecutionPlan;
  results?: ToolCallResult[];
  status?: ExecutionStatus;
  isLoading?: boolean;
}

interface ChatMessageProps {
  message: ChatMessageData;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ChatMessage({ message, onConfirm, onCancel }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isExecution = message.role === 'execution';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser ? 'bg-accent-orange/10 ml-12' : 'bg-surface-elevated mr-12'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-accent-orange/20' : 'bg-accent-blue/20'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-accent-orange" />
        ) : isExecution ? (
          <Zap className="w-4 h-4 text-accent-gold" />
        ) : (
          <Bot className="w-4 h-4 text-accent-blue" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-text-primary text-sm">
            {isUser ? 'You' : isExecution ? 'Execution' : 'Opsuna'}
          </span>
          <span className="text-xs text-text-muted">
            {formatTime(message.timestamp)}
          </span>
          {message.status && <StatusBadge status={message.status} />}
        </div>

        {/* Message content */}
        {message.isLoading ? (
          <div className="flex items-center gap-2 text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <div className="text-text-secondary text-sm whitespace-pre-wrap">
            {message.content}
          </div>
        )}

        {/* Plan preview */}
        {message.plan && (
          <PlanPreview
            plan={message.plan}
            status={message.status}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        )}

        {/* Results */}
        {message.results && message.results.length > 0 && (
          <ResultsSummary results={message.results} />
        )}
      </div>
    </motion.div>
  );
}

function PlanPreview({
  plan,
  status,
  onConfirm,
  onCancel,
}: {
  plan: ExecutionPlan;
  status?: ExecutionStatus;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  const showActions = status === 'awaiting_confirmation';

  return (
    <div className="mt-3 p-3 bg-surface-base rounded-lg border border-border-subtle">
      {/* Plan header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Execution Plan
        </span>
        <RiskBadge risk={plan.riskLevel} />
      </div>

      {/* Plan summary */}
      <p className="text-sm text-text-primary mb-3">{plan.summary}</p>

      {/* Steps */}
      <div className="space-y-2 mb-3">
        {plan.steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-start gap-2 text-xs text-text-muted"
          >
            <span className="w-5 h-5 rounded-full bg-surface-elevated flex items-center justify-center flex-shrink-0">
              {index + 1}
            </span>
            <div>
              <span className="font-mono text-accent-blue">{step.toolName}</span>
              <span className="mx-1">-</span>
              <span>{step.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-2 border-t border-border-subtle">
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2 bg-accent-green/20 hover:bg-accent-green/30
                       text-accent-green rounded-lg text-sm font-medium transition-colors"
          >
            Confirm & Execute
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 bg-surface-elevated hover:bg-surface-base
                       text-text-muted rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function ResultsSummary({ results }: { results: ToolCallResult[] }) {
  const successCount = results.filter((r) => r.status === 'success').length;
  const failedCount = results.filter((r) => r.status === 'failed').length;

  return (
    <div className="mt-3 p-3 bg-surface-base rounded-lg border border-border-subtle">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Results
        </span>
        <div className="flex items-center gap-3 text-xs">
          {successCount > 0 && (
            <span className="flex items-center gap-1 text-accent-green">
              <CheckCircle2 className="w-3 h-3" />
              {successCount} passed
            </span>
          )}
          {failedCount > 0 && (
            <span className="flex items-center gap-1 text-accent-red">
              <XCircle className="w-3 h-3" />
              {failedCount} failed
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {results.map((result) => (
          <div
            key={result.stepId}
            className="flex items-center gap-2 text-xs"
          >
            {result.status === 'success' ? (
              <CheckCircle2 className="w-3 h-3 text-accent-green" />
            ) : result.status === 'failed' ? (
              <XCircle className="w-3 h-3 text-accent-red" />
            ) : (
              <Clock className="w-3 h-3 text-text-muted" />
            )}
            <span className="font-mono text-text-muted">{result.toolName}</span>
            {result.error && (
              <span className="text-accent-red truncate">{result.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const config: Record<ExecutionStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-gray-500/20 text-gray-400' },
    awaiting_confirmation: { label: 'Awaiting', className: 'bg-yellow-500/20 text-yellow-400' },
    executing: { label: 'Running', className: 'bg-blue-500/20 text-blue-400' },
    completed: { label: 'Done', className: 'bg-green-500/20 text-green-400' },
    failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-500/20 text-gray-400' },
    rolled_back: { label: 'Rolled Back', className: 'bg-orange-500/20 text-orange-400' },
  };

  const { label, className } = config[status];
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', className)}>
      {label}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const config: Record<string, { className: string }> = {
    LOW: { className: 'bg-green-500/20 text-green-400' },
    MEDIUM: { className: 'bg-yellow-500/20 text-yellow-400' },
    HIGH: { className: 'bg-red-500/20 text-red-400' },
  };

  const { className } = config[risk] || config.LOW;
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', className)}>
      {risk} Risk
    </span>
  );
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
