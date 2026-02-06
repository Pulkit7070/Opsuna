import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { Prisma } from '@prisma/client';
import { ExecuteRequestSchema } from '@opsuna/shared';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware';
import { executeLimiter } from '../middleware/rateLimit';
import { generateExecutionPlan } from '../services/ai';
import { createError } from '../middleware/errorHandler';
import { storeMessage } from '../services/memory/conversation';

const router = Router();

router.post(
  '/',
  executeLimiter,
  validateBody(ExecuteRequestSchema),
  async (req, res, next) => {
    try {
      const { prompt, agentId } = req.body as { prompt: string; agentId?: string };
      const userId = req.user!.id;

      // Generate execution plan using AI (with memory context and optional agent)
      const plan = await generateExecutionPlan(prompt, { userId, useMemory: true, agentId });

      // Create execution record
      const execution = await prisma.execution.create({
        data: {
          id: uuid(),
          userId,
          agentId: agentId || null,
          prompt,
          status: 'awaiting_confirmation',
          riskLevel: plan.riskLevel,
          plan: plan as unknown as Prisma.InputJsonValue,
        },
      });

      // Store conversation message (user prompt)
      storeMessage({
        userId,
        role: 'user',
        content: prompt,
        executionId: execution.id,
        metadata: agentId ? { agentId } : undefined,
      }).catch((err) => console.warn('[Execute] Failed to store conversation:', err));

      // Store AI response as conversation message
      storeMessage({
        userId,
        role: 'assistant',
        content: `Generated plan: ${plan.summary}`,
        executionId: execution.id,
        metadata: { riskLevel: plan.riskLevel, stepCount: plan.steps.length, agentId },
      }).catch((err) => console.warn('[Execute] Failed to store AI response:', err));

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
