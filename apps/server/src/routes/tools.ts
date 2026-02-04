import { Router } from 'express';
import { registry } from '../services/tools/registry';
import {
  fetchComposioTools,
  fetchComposioToolsByApp,
  searchComposioTools,
  listComposioApps,
  initiateConnection,
  checkConnectionStatus,
  listUserConnections,
  revokeConnection,
} from '../services/tools/composio';
import { createError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/tools — List all available tools (local + Composio merged)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, source, search } = req.query;

    // If searching, use Composio semantic search
    if (search && typeof search === 'string') {
      const composioResults = await searchComposioTools(search, req.user?.id);
      const localTools = registry.listBySource('local').filter(t =>
        t.name.includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      );
      return res.json({
        success: true,
        data: [...localTools, ...composioResults],
      });
    }

    let tools = registry.list();

    if (source && typeof source === 'string') {
      tools = tools.filter(t => t.source === source);
    }

    if (category && typeof category === 'string') {
      tools = tools.filter(t => t.category === category);
    }

    res.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to list tools',
      500,
      'TOOLS_LIST_FAILED'
    ));
  }
});

/**
 * GET /api/tools/composio/catalog — Browse full Composio catalog
 */
router.get('/composio/catalog', async (req, res, next) => {
  try {
    const { app, refresh } = req.query;

    let tools;
    if (app && typeof app === 'string') {
      tools = await fetchComposioToolsByApp(app);
    } else {
      tools = await fetchComposioTools(refresh === 'true');
    }

    res.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to fetch Composio catalog',
      500,
      'COMPOSIO_CATALOG_FAILED'
    ));
  }
});

/**
 * GET /api/tools/composio/apps — List available Composio apps
 */
router.get('/composio/apps', async (_req, res, next) => {
  try {
    const apps = await listComposioApps();
    res.json({ success: true, data: apps });
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to list Composio apps',
      500,
      'COMPOSIO_APPS_FAILED'
    ));
  }
});

/**
 * POST /api/tools/composio/connect — Initiate OAuth connection
 */
router.post('/composio/connect', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { appName, redirectUrl } = req.body;

    if (!appName) {
      return next(createError('appName is required', 400, 'MISSING_APP_NAME'));
    }

    const result = await initiateConnection(
      userId,
      appName,
      redirectUrl || `${req.headers.origin || 'http://localhost:3000'}/tools/callback`
    );

    if (!result) {
      return next(createError('Failed to initiate connection', 500, 'CONNECTION_FAILED'));
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to initiate connection',
      500,
      'CONNECTION_INIT_FAILED'
    ));
  }
});

/**
 * GET /api/tools/composio/connections — List user's connected accounts
 */
router.get('/composio/connections', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const connections = await listUserConnections(userId);
    res.json({ success: true, data: connections });
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to list connections',
      500,
      'CONNECTIONS_LIST_FAILED'
    ));
  }
});

/**
 * POST /api/tools/composio/connections/:appName/check — Check connection status
 */
router.post('/composio/connections/:appName/check', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { appName } = req.params;
    const connection = await checkConnectionStatus(userId, appName);

    if (!connection) {
      return res.json({
        success: true,
        data: { appName, status: 'not_connected' },
      });
    }

    res.json({ success: true, data: connection });
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to check connection',
      500,
      'CONNECTION_CHECK_FAILED'
    ));
  }
});

/**
 * DELETE /api/tools/composio/connections/:appName — Revoke connection
 */
router.delete('/composio/connections/:appName', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { appName } = req.params;
    const success = await revokeConnection(userId, appName);

    res.json({ success, data: { appName, status: 'revoked' } });
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to revoke connection',
      500,
      'CONNECTION_REVOKE_FAILED'
    ));
  }
});

export { router as toolsRouter };
