import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { ExecuteRequestSchema } from '@opsuna/shared';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware';
import { executeLimiter } from '../middleware/rateLimit';
import { generateExecutionPlan } from '../services/ai';
import { createError } from '../middleware/errorHandler';

const router = Router();

router.post(
  '/',
  executeLimiter,
  validateBody(ExecuteRequestSchema),
  async (req, res, next) => {
    try {
      const { prompt } = req.body;
      const userId = req.user!.id;

      // Generate execution plan using AI
      const plan = await generateExecutionPlan(prompt);

      // Create execution record
      const execution = await prisma.execution.create({
        data: {
          id: uuid(),
          userId,
          prompt,
          status: 'awaiting_confirmation',
          riskLevel: plan.riskLevel,
          plan: plan as unknown as Record<string, unknown>,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          executionId: execution.id,
          action: 'PLAN_GENERATED',
          actor: userId,
          details: { prompt, riskLevel: plan.riskLevel },
        },
      });

      res.status(201).json({
        success: true,
        data: {
          executionId: execution.id,
          status: execution.status,
          plan,
          riskLevel: plan.riskLevel,
        },
      });
    } catch (error) {
      next(createError(
        error instanceof Error ? error.message : 'Failed to generate execution plan',
        500,
        'PLAN_GENERATION_FAILED'
      ));
    }
  }
);

export { router as executeRouter };
