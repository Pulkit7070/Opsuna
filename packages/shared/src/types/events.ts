import { MCPUIMessage } from './mcp';
import { ExecutionStatus, LogEntry, ToolCallResult } from './execution';

export type WebSocketEventType =
  | 'connection'
  | 'subscribe'
  | 'unsubscribe'
  | 'execution_update'
  | 'ui_message'
  | 'log_entry'
  | 'step_update'
  | 'error'
  | 'heartbeat';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  payload: T;
  timestamp: Date;
}

export interface ConnectionPayload {
  clientId: string;
  connectedAt: Date;
}

export interface SubscribePayload {
  executionId: string;
}

export interface UnsubscribePayload {
  executionId: string;
}

export interface ExecutionUpdatePayload {
  executionId: string;
  status: ExecutionStatus;
  progress?: {
    currentStep: number;
    totalSteps: number;
  };
}

export interface UIMessagePayload {
  message: MCPUIMessage;
}

export interface LogEntryPayload {
  executionId: string;
  entry: LogEntry;
}

export interface StepUpdatePayload {
  executionId: string;
  stepId: string;
  result: ToolCallResult;
}

export interface ErrorPayload {
  code: string;
  message: string;
  executionId?: string;
}

export interface HeartbeatPayload {
  timestamp: Date;
}

// Client -> Server messages
export type ClientMessage =
  | { type: 'subscribe'; payload: SubscribePayload }
  | { type: 'unsubscribe'; payload: UnsubscribePayload }
  | { type: 'heartbeat'; payload: HeartbeatPayload };

// Server -> Client messages
export type ServerMessage =
  | { type: 'connection'; payload: ConnectionPayload }
  | { type: 'execution_update'; payload: ExecutionUpdatePayload }
  | { type: 'ui_message'; payload: UIMessagePayload }
  | { type: 'log_entry'; payload: LogEntryPayload }
  | { type: 'step_update'; payload: StepUpdatePayload }
  | { type: 'error'; payload: ErrorPayload }
  | { type: 'heartbeat'; payload: HeartbeatPayload };
