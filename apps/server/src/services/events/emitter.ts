import { EventEmitter } from 'events';
import {
  ExecutionStatus,
  MCPUIMessage,
  LogEntry,
  ToolCallResult,
} from '@opsuna/shared';

export type EventType =
  | 'execution:status'
  | 'execution:ui_message'
  | 'execution:log'
  | 'execution:step_update';

export interface ExecutionStatusEvent {
  executionId: string;
  status: ExecutionStatus;
  progress?: { currentStep: number; totalSteps: number };
}

export interface ExecutionUIMessageEvent {
  executionId: string;
  message: MCPUIMessage;
}

export interface ExecutionLogEvent {
  executionId: string;
  entry: LogEntry;
}

export interface ExecutionStepUpdateEvent {
  executionId: string;
  stepId: string;
  result: ToolCallResult;
}

class ExecutionEventEmitter extends EventEmitter {
  emitStatus(event: ExecutionStatusEvent) {
    this.emit('execution:status', event);
  }

  emitUIMessage(event: ExecutionUIMessageEvent) {
    this.emit('execution:ui_message', event);
  }

  emitLog(event: ExecutionLogEvent) {
    this.emit('execution:log', event);
  }

  emitStepUpdate(event: ExecutionStepUpdateEvent) {
    this.emit('execution:step_update', event);
  }

  onStatus(handler: (event: ExecutionStatusEvent) => void) {
    this.on('execution:status', handler);
  }

  onUIMessage(handler: (event: ExecutionUIMessageEvent) => void) {
    this.on('execution:ui_message', handler);
  }

  onLog(handler: (event: ExecutionLogEvent) => void) {
    this.on('execution:log', handler);
  }

  onStepUpdate(handler: (event: ExecutionStepUpdateEvent) => void) {
    this.on('execution:step_update', handler);
  }
}

export const eventEmitter = new ExecutionEventEmitter();
