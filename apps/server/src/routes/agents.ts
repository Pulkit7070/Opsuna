import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import {
  getAccessibleAgents,
  getBuiltinAgents,
  getUserAgents,
  getAgent,
  getAgentWithAccess,
  createAgent,
  updateAgent,
  deleteAgent,
  initializeBuiltinAgents,
} from '../services/agents/registry';
import { AgentCreateInput, AgentUpdateInput } from '../services/agents/types';
import { getAllChains } from '../services/agents/chain';

const router = Router();

// Initialize built-in agents on startup
initializeBuiltinAgents().catch((err) =>
  console.error('[Agents] Failed to initialize built-in agents:', err)
);

/**
 * GET /api/agents
 * Get all accessible agents (built-in + public + own).
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const agents = await getAccessibleAgents(userId);

    return res.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error('[Agents] List error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get agents',
    });
  }
});

/**
 * GET /api/agents/builtin
 * Get built-in agents only.
 */
router.get('/builtin', async (_req: Request, res: Response) => {
  try {
    const agents = await getBuiltinAgents();

    return res.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error('[Agents] Builtin list error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get built-in agents',
    });
  }
});

/**
 * GET /api/agents/mine
 * Get user's custom agents.
 */
router.get('/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;

    const agents = await getUserAgents(userId);

    return res.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error('[Agents] User agents error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user agents',
    });
  }
});

/**
 * GET /api/agents/chains
 * Get available agent chains.
 */
router.get('/chains', async (_req: Request, res: Response) => {
  try {
    const chains = getAllChains();

    return res.json({
      success: true,
      data: chains,
    });
  } catch (error) {
    console.error('[Agents] Chains error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get chains',
    });
  }
});

/**
 * GET /api/agents/:id
 * Get a single agent by ID.
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const { id } = req.params;

    const agent = await getAgentWithAccess(id, userId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
      });
    }

    return res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('[Agents] Get error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get agent',
    });
  }
});

/**
 * POST /api/agents
 * Create a new custom agent.
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const input = req.body as AgentCreateInput;

    // Validate required fields
    if (!input.name || !input.description || !input.systemPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and system prompt are required',
      });
    }

    if (!input.toolNames || !Array.isArray(input.toolNames)) {
      return res.status(400).json({
        success: false,
        error: 'Tool names must be an array',
      });
    }

    const agent = await createAgent(userId, input);

    return res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('[Agents] Create error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create agent',
    });
  }
});

/**
 * PUT /api/agents/:id
 * Update an agent.
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const { id } = req.params;
    const input = req.body as AgentUpdateInput;

    const agent = await updateAgent(id, userId, input);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found or cannot be modified',
      });
    }

    return res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    console.error('[Agents] Update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update agent',
    });
  }
});

/**
 * DELETE /api/agents/:id
 * Delete an agent.
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user!.id;
    const { id } = req.params;

    const deleted = await deleteAgent(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found or cannot be deleted',
      });
    }

    return res.json({
      success: true,
      message: 'Agent deleted',
    });
  } catch (error) {
    console.error('[Agents] Delete error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete agent',
    });
  }
});

export { router as agentsRouter };
