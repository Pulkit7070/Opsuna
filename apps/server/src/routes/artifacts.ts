import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import {
  getExecutionArtifacts,
  getArtifact,
  downloadArtifact,
  deleteArtifact,
} from '../services/artifacts/store';
import {
  createExecutionReport,
  createSharedReport,
  getSharedReport,
  generateMarkdownReport,
} from '../services/artifacts/report';
import { ExecutionPlan, ToolCallResult } from '@opsuna/shared';

const router = Router();

/**
 * GET /api/executions/:id/artifacts
 * Get all artifacts for an execution.
 */
router.get(
  '/executions/:id/artifacts',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id: executionId } = req.params;

      // Verify execution belongs to user
      const execution = await prisma.execution.findFirst({
        where: { id: executionId, userId },
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found',
        });
      }

      const artifacts = await getExecutionArtifacts(executionId);

      return res.json({
        success: true,
        data: artifacts,
      });
    } catch (error) {
      console.error('[Artifacts] List error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get artifacts',
      });
    }
  }
);

/**
 * GET /api/artifacts/:id/download
 * Download an artifact by ID.
 */
router.get(
  '/artifacts/:id/download',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id } = req.params;

      const artifact = await getArtifact(id);

      if (!artifact) {
        return res.status(404).json({
          success: false,
          error: 'Artifact not found',
        });
      }

      // Verify user owns the execution
      const execution = await prisma.execution.findFirst({
        where: { id: artifact.executionId, userId },
      });

      if (!execution) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      const content = await downloadArtifact(artifact.storagePath);

      if (!content) {
        return res.status(404).json({
          success: false,
          error: 'Artifact content not found',
        });
      }

      res.setHeader('Content-Type', artifact.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${artifact.name}"`);
      res.setHeader('Content-Length', content.length);

      return res.send(content);
    } catch (error) {
      console.error('[Artifacts] Download error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to download artifact',
      });
    }
  }
);

/**
 * POST /api/executions/:id/report
 * Generate a report for an execution.
 */
router.post(
  '/executions/:id/report',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id: executionId } = req.params;

      // Verify execution belongs to user
      const execution = await prisma.execution.findFirst({
        where: { id: executionId, userId },
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found',
        });
      }

      const artifact = await createExecutionReport(executionId);

      if (!artifact) {
        return res.status(500).json({
          success: false,
          error: 'Failed to generate report',
        });
      }

      return res.json({
        success: true,
        data: artifact,
      });
    } catch (error) {
      console.error('[Artifacts] Report error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate report',
      });
    }
  }
);

/**
 * GET /api/executions/:id/report/inline
 * Get markdown report content directly (no storage required).
 */
router.get(
  '/executions/:id/report/inline',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id: executionId } = req.params;

      // Verify execution belongs to user
      const execution = await prisma.execution.findFirst({
        where: { id: executionId, userId },
        include: {
          toolCalls: {
            orderBy: { createdAt: 'asc' },
          },
          auditLogs: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found',
        });
      }

      // Build report data
      const reportData = {
        execution: {
          id: execution.id,
          prompt: execution.prompt,
          status: execution.status,
          riskLevel: execution.riskLevel,
          createdAt: execution.createdAt,
          completedAt: execution.completedAt,
        },
        plan: execution.plan as unknown as ExecutionPlan | null,
        results: execution.results as unknown as ToolCallResult[] | null,
        toolCalls: execution.toolCalls.map((tc) => ({
          stepId: tc.stepId,
          toolName: tc.toolName,
          status: tc.status,
          startedAt: tc.startedAt,
          completedAt: tc.completedAt,
          error: tc.error,
        })),
        auditLogs: execution.auditLogs.map((al) => ({
          action: al.action,
          actor: al.actor,
          createdAt: al.createdAt,
        })),
      };

      const markdown = generateMarkdownReport(reportData);

      return res.json({
        success: true,
        data: {
          content: markdown,
          executionId,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('[Artifacts] Inline report error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate report',
      });
    }
  }
);

/**
 * POST /api/executions/:id/share
 * Create a shareable link for an execution.
 */
router.post(
  '/executions/:id/share',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id: executionId } = req.params;
      const { expiresInHours } = req.body as { expiresInHours?: number };

      // Verify execution belongs to user
      const execution = await prisma.execution.findFirst({
        where: { id: executionId, userId },
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found',
        });
      }

      const shared = await createSharedReport(executionId, expiresInHours);

      if (!shared) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create shared link',
        });
      }

      return res.json({
        success: true,
        data: shared,
      });
    } catch (error) {
      console.error('[Artifacts] Share error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create shared link',
      });
    }
  }
);

/**
 * GET /api/shared/:token
 * Get a shared report by token (no auth required).
 */
router.get('/shared/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { format } = req.query;

    const reportData = await getSharedReport(token);

    if (!reportData) {
      return res.status(404).json({
        success: false,
        error: 'Report not found or expired',
      });
    }

    // Return markdown if requested
    if (format === 'markdown') {
      const markdown = generateMarkdownReport(reportData);
      res.setHeader('Content-Type', 'text/markdown');
      return res.send(markdown);
    }

    return res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('[Artifacts] Shared report error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get shared report',
    });
  }
});

/**
 * GET /api/executions/:id/replay
 * Get replay data for an execution (timestamped events).
 */
router.get(
  '/executions/:id/replay',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id: executionId } = req.params;

      // Verify execution belongs to user
      const execution = await prisma.execution.findFirst({
        where: { id: executionId, userId },
        include: {
          auditLogs: {
            orderBy: { createdAt: 'asc' },
          },
          artifacts: true,
        },
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found',
        });
      }

      const plan = execution.plan as unknown as ExecutionPlan;
      const results = (execution.results || []) as unknown as ToolCallResult[];

      // Build replay events from audit logs and results
      const events = execution.auditLogs.map((log) => ({
        id: log.id,
        timestamp: log.createdAt,
        type: log.action,
        details: log.details,
      }));

      // Add step events from results
      const stepEvents = results.map((result, index) => ({
        id: `step-${index}`,
        timestamp: execution.createdAt, // Base timestamp
        type: 'STEP_RESULT',
        details: {
          stepIndex: index,
          toolName: result.toolName,
          status: result.status,
          error: result.error,
        },
      }));

      return res.json({
        success: true,
        data: {
          execution: {
            id: execution.id,
            status: execution.status,
            prompt: execution.prompt,
            createdAt: execution.createdAt,
            completedAt: execution.completedAt,
          },
          plan: {
            summary: plan.summary,
            riskLevel: plan.riskLevel,
            steps: plan.steps.map((s) => ({
              id: s.id,
              toolName: s.toolName,
              description: s.description,
            })),
          },
          results,
          events: [...events, ...stepEvents].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ),
          artifacts: execution.artifacts,
        },
      });
    } catch (error) {
      console.error('[Artifacts] Replay error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get replay data',
      });
    }
  }
);

/**
 * DELETE /api/artifacts/:id
 * Delete an artifact.
 */
router.delete(
  '/artifacts/:id',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id } = req.params;

      const artifact = await getArtifact(id);

      if (!artifact) {
        return res.status(404).json({
          success: false,
          error: 'Artifact not found',
        });
      }

      // Verify user owns the execution
      const execution = await prisma.execution.findFirst({
        where: { id: artifact.executionId, userId },
      });

      if (!execution) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
        });
      }

      const deleted = await deleteArtifact(id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete artifact',
        });
      }

      return res.json({
        success: true,
        message: 'Artifact deleted',
      });
    } catch (error) {
      console.error('[Artifacts] Delete error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete artifact',
      });
    }
  }
);

export { router as artifactsRouter };
