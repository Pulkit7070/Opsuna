import { ExecutionStep, ToolCallResult, ToolLog, LogEntry } from '@opsuna/shared';
import { routeToolCall } from './router';
import { v4 as uuid } from 'uuid';

interface ExecutorCallbacks {
  onStepStart: (stepId: string) => void;
  onStepLog: (stepId: string, log: LogEntry) => void;
  onStepComplete: (stepId: string, result: ToolCallResult) => void;
  onStepError: (stepId: string, error: string) => void;
}

export async function executeSteps(
  steps: ExecutionStep[],
  callbacks: ExecutorCallbacks,
  userId?: string
): Promise<ToolCallResult[]> {
  const results: ToolCallResult[] = [];

  for (const step of steps) {
    const callId = uuid();
    const logs: LogEntry[] = [];

    callbacks.onStepStart(step.id);

    const onLog = (toolLog: ToolLog) => {
      const logEntry: LogEntry = {
        timestamp: toolLog.timestamp,
        level: toolLog.level,
        message: toolLog.message,
      };
      logs.push(logEntry);
      callbacks.onStepLog(step.id, logEntry);
    };

    try {
      const startedAt = new Date();

      const toolResult = await routeToolCall(
        callId,
        step.toolName,
        step.parameters,
        onLog,
        userId
      );

      const completedAt = new Date();

      const result: ToolCallResult = {
        stepId: step.id,
        toolName: step.toolName,
        status: toolResult.success ? 'success' : 'failed',
        startedAt,
        completedAt,
        result: toolResult.data,
        error: toolResult.error?.message,
        logs,
      };

      results.push(result);
      callbacks.onStepComplete(step.id, result);

      // Stop execution if a step fails
      if (!toolResult.success) {
        // Mark remaining steps as skipped
        const remainingSteps = steps.slice(steps.indexOf(step) + 1);
        for (const remaining of remainingSteps) {
          const skippedResult: ToolCallResult = {
            stepId: remaining.id,
            toolName: remaining.toolName,
            status: 'skipped',
            logs: [],
          };
          results.push(skippedResult);
        }
        break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      callbacks.onStepError(step.id, errorMessage);

      const result: ToolCallResult = {
        stepId: step.id,
        toolName: step.toolName,
        status: 'failed',
        startedAt: new Date(),
        completedAt: new Date(),
        error: errorMessage,
        logs,
      };

      results.push(result);

      // Mark remaining steps as skipped
      const remainingSteps = steps.slice(steps.indexOf(step) + 1);
      for (const remaining of remainingSteps) {
        const skippedResult: ToolCallResult = {
          stepId: remaining.id,
          toolName: remaining.toolName,
          status: 'skipped',
          logs: [],
        };
        results.push(skippedResult);
      }
      break;
    }
  }

  return results;
}

export async function executeWithRetry(
  step: ExecutionStep,
  maxRetries: number = 3,
  callbacks: ExecutorCallbacks
): Promise<ToolCallResult> {
  let lastError: string = '';
  const logs: LogEntry[] = [];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const callId = uuid();

    const onLog = (toolLog: ToolLog) => {
      const logEntry: LogEntry = {
        timestamp: toolLog.timestamp,
        level: toolLog.level,
        message: attempt > 1 ? `[Retry ${attempt}] ${toolLog.message}` : toolLog.message,
      };
      logs.push(logEntry);
      callbacks.onStepLog(step.id, logEntry);
    };

    try {
      const startedAt = new Date();

      const toolResult = await routeToolCall(
        callId,
        step.toolName,
        step.parameters,
        onLog
      );

      const completedAt = new Date();

      if (toolResult.success) {
        return {
          stepId: step.id,
          toolName: step.toolName,
          status: 'success',
          startedAt,
          completedAt,
          result: toolResult.data,
          logs,
        };
      }

      lastError = toolResult.error?.message || 'Unknown error';

      if (!toolResult.error?.recoverable) {
        break;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    // Wait before retry
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    stepId: step.id,
    toolName: step.toolName,
    status: 'failed',
    completedAt: new Date(),
    error: lastError,
    logs,
  };
}
