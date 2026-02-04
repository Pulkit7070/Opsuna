import { Router } from 'express';
import { ExecutionIdParamSchema, RollbackRequestSchema, ExecutionPlan } from '@opsuna/shared';
import { prisma } from '../lib/prisma';
import { validateBody, validateParams } from '../middleware';
import { createError } from '../middleware/errorHandler';
import { executeSteps } from '../services/tools';
import { eventEmitter } from '../services/events';

const router = Router();

router.post(
  '/:id',
  validateParams(ExecutionIdParamSchema),
  validateBody(RollbackRequestSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user!.id;

      const execution = await prisma.execution.findFirst({
        where: {
          id,
          userId,
          status: { in: ['completed', 'failed'] },
        },
      });

      if (!execution) {
        return next(createError('Execution not found or not rollback-able', 404, 'NOT_FOUND'));
      }

      const plan = execution.plan as unknown as ExecutionPlan;

      if (!plan.rollbackSteps || plan.rollbackSteps.length === 0) {
        return next(createError('No rollback steps available', 400, 'NO_ROLLBACK'));
      }

      // Start rollback
      await prisma.execution.update({
        where: { id },
        data: { status: 'executing', updatedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          executionId: id,
          action: 'ROLLBACK_STARTED',
          actor: userId,
          details: { reason },
        },
      });

      eventEmitter.emitStatus({ executionId: id, status: 'executing' });

      // Return immediately
      res.json({
        success: true,
        data: { executionId: id, status: 'rolling_back' },
      });

      // Execute rollback steps
      const rollbackSteps = plan.rollbackSteps.map((step, index) => ({
        ...step,
        order: index + 1,
        riskLevel: 'HIGH' as const,
      }));

      const results = await executeSteps(rollbackSteps, {
        onStepStart: (stepId) => {
          console.log(`[Rollback] Starting rollback step ${stepId}`);
        },
        onStepLog: (stepId, log) => {
          eventEmitter.emitLog({ executionId: id, entry: log });
        },
        onStepComplete: (stepId, result) => {
          eventEmitter.emitStepUpdate({ executionId: id, stepId, result });
        },
        onStepError: (stepId, error) => {
          console.error(`[Rollback] Step ${stepId} error:`, error);
        },
      });

      const allSucceeded = results.every(r => r.status === 'success');
      const finalStatus = allSucceeded ? 'rolled_back' : 'failed';

      await prisma.execution.update({
        where: { id },
        data: {
          status: finalStatus,
          updatedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          executionId: id,
          action: allSucceeded ? 'ROLLBACK_COMPLETED' : 'ROLLBACK_FAILED',
          actor: userId,
          details: { rolledBackSteps: results.filter(r => r.status === 'success').map(r => r.stepId) },
        },
      });

      eventEmitter.emitStatus({ executionId: id, status: finalStatus });

    } catch (error) {
      next(createError(
        error instanceof Error ? error.message : 'Rollback failed',
        500,
        'ROLLBACK_FAILED'
      ));
    }
  }
);

export { router as rollbackRouter };
