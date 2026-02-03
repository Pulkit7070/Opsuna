import { Execution, ExecutionPlan, ExecutionSummary, RiskLevel } from './execution';

// API Request Types
export interface ExecuteRequest {
  prompt: string;
}

export interface ConfirmRequest {
  confirmed: boolean;
  confirmPhrase?: string;
}

export interface RollbackRequest {
  stepIds?: string[];
  reason?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ExecuteResponse {
  executionId: string;
  status: 'awaiting_confirmation';
  plan: ExecutionPlan;
  riskLevel: RiskLevel;
}

export interface ConfirmResponse {
  executionId: string;
  status: 'executing' | 'cancelled';
}

export interface ExecutionResponse {
  execution: Execution;
}

export interface ExecutionsListResponse {
  executions: ExecutionSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RollbackResponse {
  executionId: string;
  status: 'rolled_back' | 'rollback_failed';
  rolledBackSteps: string[];
  errors?: string[];
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: Date;
  services: {
    database: boolean;
    ai: boolean;
    websocket: boolean;
  };
}
