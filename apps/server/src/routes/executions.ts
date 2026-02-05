import { Router } from 'express';
import { PaginationQuerySchema, ExecutionIdParamSchema, ExecutionPlan, ToolCallResult } from '@opsuna/shared';
import { prisma } from '../lib/prisma';
import { validateQuery, validateParams } from '../middleware';
import { createError } from '../middleware/errorHandler';

const router = Router();

// List executions
router.get(
  '/',
  validateQuery(PaginationQuerySchema),
  async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const userId = req.user!.id;
      const skip = (page - 1) * pageSize;

      const [executions, total] = await Promise.all([
        prisma.execution.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
          select: {
            id: true,
            prompt: true,
            status: true,
            riskLevel: true,
            createdAt: true,
            completedAt: true,
            plan: true,
          },
        }),
        prisma.execution.count({ where: { userId } }),
      ]);

      const summaries = executions.map(exec => {
        const plan = exec.plan as ExecutionPlan | null;
        return {
          id: exec.id,
          prompt: exec.prompt,
          status: exec.status,
          riskLevel: exec.riskLevel,
          stepsCompleted: 0, // Would need to calculate from results
          totalSteps: plan?.steps.length || 0,
          createdAt: exec.createdAt,
          completedAt: exec.completedAt,
        };
      });

      res.json({
        success: true,
        data: {
          executions: summaries,
          total,
          page,
          pageSize,
        },
      });
    } catch (error) {
      next(createError(
        error instanceof Error ? error.message : 'Failed to fetch executions',
        500,
        'FETCH_FAILED'
      ));
    }
  }
);

// Get execution details
router.get(
  '/:id',
  validateParams(ExecutionIdParamSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const execution = await prisma.execution.findFirst({
        where: { id, userId },
        include: {
          toolCalls: true,
          auditLogs: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!execution) {
        return next(createError('Execution not found', 404, 'NOT_FOUND'));
      }

      const plan = execution.plan as ExecutionPlan | null;
      const results = (execution.results as ToolCallResult[] | null) || [];

      res.json({
        success: true,
        data: {
          execution: {
            id: execution.id,
            userId: execution.userId,
            prompt: execution.prompt,
            status: execution.status,
            riskLevel: execution.riskLevel,
            plan,
            results,
            error: execution.error,
            createdAt: execution.createdAt,
            updatedAt: execution.updatedAt,
            completedAt: execution.completedAt,
          },
        },
      });
    } catch (error) {
      next(createError(
        error instanceof Error ? error.message : 'Failed to fetch execution',
        500,
        'FETCH_FAILED'
      ));
    }
  }
);

export { router as executionsRouter };
