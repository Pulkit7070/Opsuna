import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { Prisma } from '@prisma/client';
import { ExecuteRequestSchema } from '@opsuna/shared';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware';
import { userExecuteLimiter } from '../middleware/userRateLimit';
import { generateIntentToken } from '../middleware/intentToken';
import { sanitizePromptInput, extractClientInfo } from '../middleware/sanitize';
import { generateExecutionPlan } from '../services/ai';
import { createError } from '../middleware/errorHandler';
import { storeMessage } from '../services/memory/conversation';

const router = Router();

router.post(
  '/',
  userExecuteLimiter,
  sanitizePromptInput,
  validateBody(ExecuteRequestSchema),
  async (req, res, next) => {
    try {
      const { prompt, agentId } = req.body as { prompt: string; agentId?: string };
      const userId = req.user!.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      // Generate execution plan using AI (with memory context and optional agent)
      const plan = await generateExecutionPlan(prompt, { userId, useMemory: true, agentId });

      // Generate intent token for secure confirmation
      const { token: intentToken, expiresAt: intentExpiresAt } = generateIntentToken();

      // Create execution record with intent token
      const execution = await prisma.execution.create({
        data: {
          id: uuid(),
          userId,
          agentId: agentId || null,
          prompt,
          status: 'awaiting_confirmation',
          riskLevel: plan.riskLevel,
          plan: plan as unknown as Prisma.InputJsonValue,
          intentToken,
          intentExpiresAt,
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

      // Create audit log with client info
      await prisma.auditLog.create({
        data: {
          executionId: execution.id,
          action: 'PLAN_GENERATED',
          actor: userId,
          details: { prompt, riskLevel: plan.riskLevel },
          ipAddress,
          userAgent,
          severity: 'info',
        },
      });

      res.status(201).json({
        success: true,
        data: {
          executionId: execution.id,
          status: execution.status,
          plan,
          riskLevel: plan.riskLevel,
          intentToken, // Client needs this for confirmation
          intentExpiresAt: intentExpiresAt.toISOString(),
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
