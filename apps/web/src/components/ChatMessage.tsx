'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Zap, CheckCircle2, XCircle, Clock, Loader2, BarChart3 } from 'lucide-react';
import { ExecutionPlan, ToolCallResult, ExecutionStatus } from '@opsuna/shared';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DataChart } from '@/components/tambo/DataChart';
import dynamic from 'next/dynamic';

// Dynamically import MermaidDiagram to avoid SSR issues
const MermaidDiagram = dynamic(
  () => import('@/components/tambo/MermaidDiagram').then(mod => mod.MermaidDiagram),
  { ssr: false, loading: () => <div className="p-4 text-text-muted">Loading diagram...</div> }
);

// Visualization data types
interface ChartVisualization {
  type: 'chart';
  component: 'DataChart';
  props: {
    title: string;
    type: 'line' | 'bar' | 'pie' | 'area';
    data: Array<{ name: string; value: number }>;
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
}

interface DiagramVisualization {
  type: 'diagram';
  component: 'MermaidDiagram';
  props: {
    title: string;
    diagram: string;
    diagramType?: 'flowchart' | 'sequence' | 'class' | 'er' | 'state';
  };
}

type VisualizationData = ChartVisualization | DiagramVisualization;

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

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(function ChatMessage(
  { message, onConfirm, onCancel },
  ref
) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isExecution = message.role === 'execution';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser ? 'bg-accent/5 ml-12' : 'bg-bg-elevated mr-12'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-accent/20' : isExecution ? 'bg-warning/20' : 'bg-info/20'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-accent" />
        ) : isExecution ? (
          <Zap className="w-4 h-4 text-warning" />
        ) : (
          <Bot className="w-4 h-4 text-info" />
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
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
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
});

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
    <div className="mt-3 p-3 bg-bg-primary rounded-lg border border-border-subtle">
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
            <span className="w-5 h-5 rounded-full bg-bg-elevated flex items-center justify-center flex-shrink-0 text-text-secondary">
              {index + 1}
            </span>
            <div>
              <span className="font-mono text-accent">{step.toolName}</span>
              <span className="mx-1 text-text-muted">-</span>
              <span className="text-text-secondary">{step.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-2 border-t border-border-subtle">
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2 bg-success/10 hover:bg-success/20 border border-success/20 hover:border-success/30
                       text-success rounded-lg text-sm font-medium transition-colors"
          >
            Confirm & Execute
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 bg-bg-elevated hover:bg-bg-surface border border-border-subtle
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

  // Extract all visualizations from results
  const visualizations = results
    .filter((r) => r.status === 'success' && r.result)
    .map((r) => {
      const resultData = r.result as Record<string, unknown> | null;
      return resultData?.visualization as VisualizationData | undefined;
    })
    .filter((v): v is VisualizationData => v?.type === 'chart' || v?.type === 'diagram');

  const chartResults = visualizations.filter((v): v is ChartVisualization => v.type === 'chart');
  const diagramResults = visualizations.filter((v): v is DiagramVisualization => v.type === 'diagram');

  return (
    <div className="mt-3 p-3 bg-bg-primary rounded-lg border border-border-subtle">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Results
        </span>
        <div className="flex items-center gap-3 text-xs">
          {successCount > 0 && (
            <span className="flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              {successCount} passed
            </span>
          )}
          {failedCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="w-3 h-3" />
              {failedCount} failed
            </span>
          )}
        </div>
      </div>

      {/* Tool status list */}
      <div className="space-y-1">
        {results.map((result) => (
          <div
            key={result.stepId}
            className="flex items-center gap-2 text-xs"
          >
            {result.status === 'success' ? (
              <CheckCircle2 className="w-3 h-3 text-success" />
            ) : result.status === 'failed' ? (
              <XCircle className="w-3 h-3 text-destructive" />
            ) : (
              <Clock className="w-3 h-3 text-text-muted" />
            )}
            <span className="font-mono text-text-muted">{result.toolName}</span>
            {result.error && (
              <span className="text-destructive truncate">{result.error}</span>
            )}
          </div>
        ))}
      </div>

      {/* Render Diagram Visualizations */}
      {diagramResults.length > 0 && (
        <div className="mt-4 space-y-4">
          {diagramResults.map((diagram, index) => (
            <motion.div
              key={`diagram-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MermaidDiagram
                title={diagram.props.title}
                diagram={diagram.props.diagram}
                diagramType={diagram.props.diagramType}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Render Chart Visualizations */}
      {chartResults.length > 0 && (
        <div className="mt-4 space-y-4">
          {chartResults.map((chart, index) => (
            <motion.div
              key={`chart-${index}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-bg-elevated rounded-xl border border-border-subtle"
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">
                  {chart.props.title}
                </span>
              </div>
              <DataChart
                title={chart.props.title}
                type={chart.props.type}
                data={chart.props.data}
                xAxisLabel={chart.props.xAxisLabel}
                yAxisLabel={chart.props.yAxisLabel}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const config: Record<ExecutionStatus, { label: string; variant: 'secondary' | 'warning' | 'info' | 'success' | 'destructive' }> = {
    pending: { label: 'Pending', variant: 'secondary' },
    awaiting_confirmation: { label: 'Awaiting', variant: 'warning' },
    executing: { label: 'Running', variant: 'info' },
    completed: { label: 'Done', variant: 'success' },
    failed: { label: 'Failed', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'secondary' },
    rolled_back: { label: 'Rolled Back', variant: 'warning' },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant} size="sm">{label}</Badge>;
}

function RiskBadge({ risk }: { risk: string }) {
  const config: Record<string, { variant: 'success' | 'warning' | 'destructive' }> = {
    LOW: { variant: 'success' },
    MEDIUM: { variant: 'warning' },
    HIGH: { variant: 'destructive' },
  };

  const { variant } = config[risk] || config.LOW;
  return <Badge variant={variant} size="sm">{risk} Risk</Badge>;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
