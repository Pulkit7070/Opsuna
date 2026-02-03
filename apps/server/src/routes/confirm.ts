import { Router } from 'express';
import {
  ConfirmRequestSchema,
  ExecutionIdParamSchema,
  ExecutionPlan,
  MCPUIMessage,
  ToolCallResult,
  LogEntry,
} from '@opsuna/shared';
import { v4 as uuid } from 'uuid';
import { prisma } from '../lib/prisma';
import { validateBody, validateParams } from '../middleware';
import { createError } from '../middleware/errorHandler';
import { executeSteps } from '../services/tools';
import { eventEmitter } from '../services/events';

const router = Router();

router.post(
  '/:id',
  validateParams(ExecutionIdParamSchema),
  validateBody(ConfirmRequestSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { confirmed, confirmPhrase } = req.body;
      const userId = req.user!.id;

      const execution = await prisma.execution.findFirst({
        where: { id, userId, status: 'awaiting_confirmation' },
      });

      if (!execution) {
        return next(createError('Execution not found or not awaiting confirmation', 404, 'NOT_FOUND'));
      }

      const plan: ExecutionPlan = JSON.parse(execution.plan!);

      // For HIGH risk, verify confirm phrase
      if (plan.riskLevel === 'HIGH') {
        const expectedPhrase = 'I understand the risks';
        if (confirmPhrase !== expectedPhrase) {
          return next(createError(
            'Invalid confirmation phrase for high-risk action',
            400,
            'INVALID_CONFIRMATION'
          ));
        }
      }

      if (!confirmed) {
        // User cancelled
        await prisma.execution.update({
          where: { id },
          data: { status: 'cancelled', updatedAt: new Date() },
        });

        await prisma.auditLog.create({
          data: {
            executionId: id,
            action: 'EXECUTION_CANCELLED',
            actor: userId,
          },
        });

        eventEmitter.emitStatus({
          executionId: id,
          status: 'cancelled',
        });

        return res.json({
          success: true,
          data: { executionId: id, status: 'cancelled' },
        });
      }

      // Start execution
      await prisma.execution.update({
        where: { id },
        data: { status: 'executing', updatedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          executionId: id,
          action: 'EXECUTION_STARTED',
          actor: userId,
        },
      });

      eventEmitter.emitStatus({
        executionId: id,
        status: 'executing',
        progress: { currentStep: 0, totalSteps: plan.steps.length },
      });

      // Return immediately, execute in background
      res.json({
        success: true,
        data: { executionId: id, status: 'executing' },
      });

      // Execute steps asynchronously
      executeInBackground(id, plan, userId);

    } catch (error) {
      next(createError(
        error instanceof Error ? error.message : 'Failed to process confirmation',
        500,
        'CONFIRMATION_FAILED'
      ));
    }
  }
);

async function executeInBackground(
  executionId: string,
  plan: ExecutionPlan,
  userId: string
) {
  let currentStepIndex = 0;

  try {
    const results = await executeSteps(plan.steps, {
      onStepStart: (stepId) => {
        const step = plan.steps.find(s => s.id === stepId);
        currentStepIndex = plan.steps.findIndex(s => s.id === stepId);

        eventEmitter.emitStatus({
          executionId,
          status: 'executing',
          progress: { currentStep: currentStepIndex + 1, totalSteps: plan.steps.length },
        });

        // Emit progress stepper UI message
        const progressMessage: MCPUIMessage = {
          id: uuid(),
          executionId,
          type: 'progress_stepper',
          timestamp: new Date(),
          payload: {
            type: 'progress_stepper',
            steps: plan.steps.map((s, i) => ({
              id: s.id,
              title: s.description,
              status: i < currentStepIndex ? 'success' : i === currentStepIndex ? 'running' : 'pending',
            })),
            currentStepIndex,
          },
        };
        eventEmitter.emitUIMessage({ executionId, message: progressMessage });

        // Emit live logs start
        const liveLogsMessage: MCPUIMessage = {
          id: uuid(),
          executionId,
          type: 'live_logs',
          timestamp: new Date(),
          payload: {
            type: 'live_logs',
            logs: [],
            isStreaming: true,
          },
        };
        eventEmitter.emitUIMessage({ executionId, message: liveLogsMessage });

        console.log(`[Executor] Starting step ${stepId}: ${step?.toolName}`);
      },

      onStepLog: (stepId, log) => {
        eventEmitter.emitLog({
          executionId,
          entry: log,
        });
      },

      onStepComplete: (stepId, result) => {
        eventEmitter.emitStepUpdate({ executionId, stepId, result });

        // Emit tool result UI message
        const resultMessage: MCPUIMessage = {
          id: uuid(),
          executionId,
          type: 'tool_result',
          timestamp: new Date(),
          payload: {
            type: 'tool_result',
            stepId,
            toolName: result.toolName,
            status: result.status === 'success' ? 'success' : 'failed',
            summary: result.status === 'success'
              ? `${result.toolName} completed successfully`
              : `${result.toolName} failed: ${result.error}`,
            details: result.result as Record<string, unknown> | undefined,
            error: result.error,
          },
        };
        eventEmitter.emitUIMessage({ executionId, message: resultMessage });

        console.log(`[Executor] Completed step ${stepId}: ${result.status}`);
      },

      onStepError: (stepId, error) => {
        const logEntry: LogEntry = {
          timestamp: new Date(),
          level: 'error',
          message: `Step ${stepId} failed: ${error}`,
        };
        eventEmitter.emitLog({ executionId, entry: logEntry });
        console.error(`[Executor] Step ${stepId} error:`, error);
      },
    });

    // Check if all steps succeeded
    const allSucceeded = results.every(r => r.status === 'success');
    const finalStatus = allSucceeded ? 'completed' : 'failed';

    // Update execution record
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: finalStatus,
        results: JSON.stringify(results),
        completedAt: new Date(),
        updatedAt: new Date(),
        error: allSucceeded ? null : results.find(r => r.error)?.error || 'Execution failed',
      },
    });

    await prisma.auditLog.create({
      data: {
        executionId,
        action: allSucceeded ? 'EXECUTION_COMPLETED' : 'EXECUTION_FAILED',
        actor: userId,
        details: JSON.stringify({ stepsCompleted: results.filter(r => r.status === 'success').length }),
      },
    });

    eventEmitter.emitStatus({ executionId, status: finalStatus });

    // Emit final UI message
    if (allSucceeded) {
      const successMessage: MCPUIMessage = {
        id: uuid(),
        executionId,
        type: 'success_summary',
        timestamp: new Date(),
        payload: {
          type: 'success_summary',
          title: 'Execution Complete',
          message: 'All steps completed successfully',
          results: results.map(r => ({
            label: r.toolName,
            value: 'Success',
          })),
        },
      };
      eventEmitter.emitUIMessage({ executionId, message: successMessage });
    } else {
      const errorMessage: MCPUIMessage = {
        id: uuid(),
        executionId,
        type: 'error_display',
        timestamp: new Date(),
        payload: {
          type: 'error_display',
          title: 'Execution Failed',
          message: results.find(r => r.error)?.error || 'One or more steps failed',
          recoverable: plan.rollbackSteps && plan.rollbackSteps.length > 0,
          suggestedActions: plan.rollbackSteps
            ? ['Review logs', 'Attempt rollback']
            : ['Review logs', 'Retry execution'],
        },
      };
      eventEmitter.emitUIMessage({ executionId, message: errorMessage });
    }

  } catch (error) {
    console.error(`[Executor] Execution ${executionId} failed:`, error);

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    eventEmitter.emitStatus({ executionId, status: 'failed' });
  }
}

export { router as confirmRouter };
