'use client';

import { motion } from 'framer-motion';
import { ExecutionPlan, ToolCallResult, LogEntry, ExecutionStatus } from '@opsuna/shared';
import { ActionPreviewCard } from '@/components/tambo/ActionPreviewCard';
import { ProgressStepper } from '@/components/tambo/ProgressStepper';
import { LiveLogsViewer } from '@/components/tambo/LiveLogsViewer';
import { ToolResultSummary } from '@/components/tambo/ToolResultSummary';
import { RollbackPanel } from '@/components/tambo/RollbackPanel';
import { ConfirmActionModal } from '@/components/tambo/ConfirmActionModal';
import { DangerZoneConfirm } from '@/components/tambo/DangerZoneConfirm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, RefreshCw, Clock, Ban, Sparkles } from 'lucide-react';

interface ExecutionPanelProps {
  executionId: string | null;
  status: ExecutionStatus | null;
  plan: ExecutionPlan | null;
  results: ToolCallResult[];
  logs: LogEntry[];
  error: string | null;
  progress: { currentStep: number; totalSteps: number } | null;
  showConfirmDialog: boolean;
  isLoading: boolean;
  onConfirm: (phrase?: string) => void;
  onCancel: () => void;
  onCloseConfirmDialog: () => void;
  onReset: () => void;
}

export function ExecutionPanel({
  executionId,
  status,
  plan,
  results,
  logs,
  error,
  progress,
  showConfirmDialog,
  isLoading,
  onConfirm,
  onCancel,
  onCloseConfirmDialog,
  onReset,
}: ExecutionPanelProps) {
  if (!plan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-12 text-center"
      >
        <Sparkles className="h-10 w-10 text-accent mx-auto mb-4 opacity-50" />
        <p className="text-text-muted">
          Enter a prompt above to generate an execution plan
        </p>
      </motion.div>
    );
  }

  const isExecuting = status === 'executing';
  const isComplete = status === 'completed' || status === 'failed' || status === 'cancelled' || status === 'rolled_back';

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {progress && isExecuting && (
            <span className="text-sm font-mono text-text-muted">
              Step {progress.currentStep} of {progress.totalSteps}
            </span>
          )}
        </div>
        {isComplete && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="px-4 py-2 bg-bg-primary border border-border-subtle rounded-lg
                       text-text-secondary hover:text-text-primary hover:border-accent/30
                       transition-all flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            New Execution
          </motion.button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action preview (shown when awaiting confirmation) */}
      {status === 'awaiting_confirmation' && (
        <ActionPreviewCard
          plan={plan}
          onConfirm={() => onConfirm()}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      )}

      {/* Progress stepper (shown during and after execution) */}
      {(isExecuting || isComplete) && results.length > 0 && (
        <ProgressStepper
          steps={plan.steps}
          results={results}
          currentStepIndex={progress?.currentStep ? progress.currentStep - 1 : 0}
        />
      )}

      {/* Live logs (shown during execution) */}
      {isExecuting && (
        <LiveLogsViewer logs={logs} isStreaming={true} />
      )}

      {/* Results summary (shown after completion) */}
      {isComplete && results.length > 0 && (
        <ToolResultSummary results={results} executionId={executionId || undefined} />
      )}

      {/* Logs after completion */}
      {isComplete && logs.length > 0 && (
        <LiveLogsViewer logs={logs} isStreaming={false} />
      )}

      {/* Rollback panel (shown if execution failed and rollback is available) */}
      {(status === 'completed' || status === 'failed') &&
        executionId &&
        plan.rollbackSteps &&
        plan.rollbackSteps.length > 0 && (
          <RollbackPanel
            executionId={executionId}
            plan={plan}
            onRollbackComplete={onReset}
          />
        )}

      {/* Success message */}
      {status === 'completed' && !error && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Execution Complete</AlertTitle>
          <AlertDescription>
            All {plan.steps.length} steps completed successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Confirmation dialogs */}
      {plan.riskLevel === 'HIGH' ? (
        <DangerZoneConfirm
          open={showConfirmDialog}
          onClose={onCloseConfirmDialog}
          onConfirm={onConfirm}
          onCancel={onCancel}
          plan={plan}
          isLoading={isLoading}
        />
      ) : (
        <ConfirmActionModal
          open={showConfirmDialog}
          onClose={onCloseConfirmDialog}
          onConfirm={() => onConfirm()}
          onCancel={onCancel}
          plan={plan}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ExecutionStatus | null }) {
  if (!status) return null;

  const config: Record<ExecutionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning'; icon: React.ReactNode }> = {
    pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
    awaiting_confirmation: { label: 'Awaiting Confirmation', variant: 'warning', icon: <Clock className="h-3 w-3" /> },
    executing: { label: 'Executing', variant: 'default', icon: <RefreshCw className="h-3 w-3 animate-spin" /> },
    completed: { label: 'Completed', variant: 'success', icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
    cancelled: { label: 'Cancelled', variant: 'secondary', icon: <Ban className="h-3 w-3" /> },
    rolled_back: { label: 'Rolled Back', variant: 'warning', icon: <RefreshCw className="h-3 w-3" /> },
  };

  const { label, variant, icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  );
}
