import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  searchMemory,
  getRecentMemories,
  deleteMemory,
  clearMemoriesByType,
  MemoryType,
} from '../services/memory/store';
import {
  getConversationHistory,
  clearConversationHistory,
} from '../services/memory/conversation';
import { getToolPatterns, getPatternContext } from '../services/memory/patterns';

const router = Router();

// All memory routes require authentication
router.use(authMiddleware);

/**
 * GET /api/memory/search
 * Search memories using semantic similarity.
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const { q, type, limit } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
    }

    const memories = await searchMemory(userId, q, {
      type: type as MemoryType | undefined,
      limit: limit ? parseInt(limit as string, 10) : 5,
    });

    return res.json({
      success: true,
      data: memories,
    });
  } catch (error) {
    console.error('[Memory] Search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search memories',
    });
  }
});

/**
 * GET /api/memory/recent
 * Get recent memories for the current user.
 */
router.get('/recent', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const { type, limit } = req.query;

    const memories = await getRecentMemories(userId, {
      type: type as MemoryType | undefined,
      limit: limit ? parseInt(limit as string, 10) : 10,
    });

    return res.json({
      success: true,
      data: memories,
    });
  } catch (error) {
    console.error('[Memory] Recent error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recent memories',
    });
  }
});

/**
 * GET /api/memory/history
 * Get conversation history for the current user.
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const { limit, executionId } = req.query;

    const messages = await getConversationHistory(userId, {
      limit: limit ? parseInt(limit as string, 10) : 20,
      executionId: executionId as string | undefined,
    });

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('[Memory] History error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get conversation history',
    });
  }
});

/**
 * GET /api/memory/patterns
 * Get tool usage patterns for the current user.
 */
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const { tools } = req.query;
    const toolNames = tools ? (tools as string).split(',') : undefined;

    const patterns = await getToolPatterns(userId, toolNames);

    return res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    console.error('[Memory] Patterns error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get tool patterns',
    });
  }
});

/**
 * GET /api/memory/context
 * Get memory context for AI prompt injection.
 * This is used internally but can also be called to preview context.
 */
router.get('/context', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const { q } = req.query;

    // Get pattern context
    const patternContext = await getPatternContext(userId);

    // Get relevant memories if query provided
    let relevantMemories: string = '';
    if (q && typeof q === 'string') {
      const memories = await searchMemory(userId, q, { limit: 3 });
      if (memories.length > 0) {
        relevantMemories = 'Relevant past experiences:\n' +
          memories.map((m) => `- ${m.content.slice(0, 200)}`).join('\n');
      }
    }

    return res.json({
      success: true,
      data: {
        patternContext,
        relevantMemories,
        hasContext: !!(patternContext || relevantMemories),
      },
    });
  } catch (error) {
    console.error('[Memory] Context error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get memory context',
    });
  }
});

/**
 * DELETE /api/memory/:id
 * Delete a specific memory.
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const { id } = req.params;

    const deleted = await deleteMemory(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Memory not found',
      });
    }

    return res.json({
      success: true,
      message: 'Memory deleted',
    });
  } catch (error) {
    console.error('[Memory] Delete error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete memory',
    });
  }
});

/**
 * DELETE /api/memory/clear/:type
 * Clear all memories of a specific type.
 */
router.delete('/clear/:type', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const { type } = req.params;

    const validTypes = ['execution', 'tool_result', 'conversation', 'pattern'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    const count = await clearMemoriesByType(userId, type as MemoryType);

    return res.json({
      success: true,
      message: `Cleared ${count} memories`,
      count,
    });
  } catch (error) {
    console.error('[Memory] Clear error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear memories',
    });
  }
});

/**
 * DELETE /api/memory/history/clear
 * Clear conversation history.
 */
router.delete('/history/clear', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const count = await clearConversationHistory(userId);

    return res.json({
      success: true,
      message: `Cleared ${count} messages`,
      count,
    });
  } catch (error) {
    console.error('[Memory] Clear history error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear conversation history',
    });
  }
});

export { router as memoryRouter };
