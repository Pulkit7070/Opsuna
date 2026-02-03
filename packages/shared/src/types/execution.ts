export type ExecutionStatus =
  | 'pending'
  | 'awaiting_confirmation'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rolled_back';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Execution {
  id: string;
  userId: string;
  prompt: string;
  status: ExecutionStatus;
  riskLevel: RiskLevel;
  plan: ExecutionPlan | null;
  results: ToolCallResult[];
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export interface ExecutionPlan {
  summary: string;
  riskLevel: RiskLevel;
  riskReason: string;
  steps: ExecutionStep[];
  rollbackSteps?: RollbackStep[];
}

export interface ExecutionStep {
  id: string;
  order: number;
  toolName: string;
  description: string;
  parameters: Record<string, unknown>;
  expectedDuration?: number;
  riskLevel: RiskLevel;
}

export interface RollbackStep {
  id: string;
  order: number;
  toolName: string;
  description: string;
  parameters: Record<string, unknown>;
  triggeredByStepId: string;
}

export interface ToolCallResult {
  stepId: string;
  toolName: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}

export interface ExecutionSummary {
  id: string;
  prompt: string;
  status: ExecutionStatus;
  riskLevel: RiskLevel;
  stepsCompleted: number;
  totalSteps: number;
  createdAt: Date;
  completedAt: Date | null;
}
