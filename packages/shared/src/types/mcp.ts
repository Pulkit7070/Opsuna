import { RiskLevel } from './execution';

export type UIBlockType =
  | 'action_preview'
  | 'confirm_standard'
  | 'confirm_danger'
  | 'progress_stepper'
  | 'live_logs'
  | 'tool_result'
  | 'rollback_panel'
  | 'error_display'
  | 'success_summary';

export interface MCPUIMessage {
  id: string;
  executionId: string;
  type: UIBlockType;
  timestamp: Date;
  payload: UIBlockPayload;
}

export type UIBlockPayload =
  | ActionPreviewPayload
  | ConfirmStandardPayload
  | ConfirmDangerPayload
  | ProgressStepperPayload
  | LiveLogsPayload
  | ToolResultPayload
  | RollbackPanelPayload
  | ErrorDisplayPayload
  | SuccessSummaryPayload;

export interface ActionPreviewPayload {
  type: 'action_preview';
  summary: string;
  riskLevel: RiskLevel;
  riskReason: string;
  steps: ActionStep[];
  estimatedDuration?: number;
}

export interface ActionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  toolName: string;
  parameters: Record<string, unknown>;
  riskLevel: RiskLevel;
}

export interface ConfirmStandardPayload {
  type: 'confirm_standard';
  title: string;
  message: string;
  riskLevel: 'MEDIUM';
  confirmLabel: string;
  cancelLabel: string;
}

export interface ConfirmDangerPayload {
  type: 'confirm_danger';
  title: string;
  message: string;
  riskLevel: 'HIGH';
  confirmPhrase: string;
  warnings: string[];
}

export interface ProgressStepperPayload {
  type: 'progress_stepper';
  steps: ProgressStep[];
  currentStepIndex: number;
}

export interface ProgressStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
}

export interface LiveLogsPayload {
  type: 'live_logs';
  logs: LogItem[];
  isStreaming: boolean;
}

export interface LogItem {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  stepId?: string;
}

export interface ToolResultPayload {
  type: 'tool_result';
  stepId: string;
  toolName: string;
  status: 'success' | 'failed';
  summary: string;
  details?: Record<string, unknown>;
  error?: string;
}

export interface RollbackPanelPayload {
  type: 'rollback_panel';
  available: boolean;
  steps: RollbackStepInfo[];
  reason?: string;
}

export interface RollbackStepInfo {
  id: string;
  title: string;
  description: string;
  canRollback: boolean;
}

export interface ErrorDisplayPayload {
  type: 'error_display';
  title: string;
  message: string;
  code?: string;
  recoverable: boolean;
  suggestedActions?: string[];
}

export interface SuccessSummaryPayload {
  type: 'success_summary';
  title: string;
  message: string;
  results: ResultItem[];
  nextSteps?: string[];
}

export interface ResultItem {
  label: string;
  value: string;
  link?: string;
}
