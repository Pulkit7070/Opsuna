export { getComposioClient } from './client';
export { fetchComposioTools, fetchComposioToolsByApp, searchComposioTools, listComposioApps } from './catalog';
export { executeComposioAction } from './executor';
export { initiateConnection, checkConnectionStatus, listUserConnections, revokeConnection } from './auth';

import { registry } from '../registry';
import { fetchComposioTools } from './catalog';

/**
 * Initialize Composio tools and register them in the tool registry.
 * Should be called during server startup.
 */
export async function initializeComposioTools(): Promise<void> {
  if (registry.isInitialized()) {
    console.log('[Composio] Registry already initialized, skipping');
    return;
  }

  try {
    console.log('[Composio] Loading tools into registry...');
    const tools = await fetchComposioTools(true);

    if (tools.length > 0) {
      registry.registerMany(tools);
      console.log(`[Composio] Registered ${tools.length} tools in registry`);
    } else {
      console.log('[Composio] No tools fetched, registry has local tools only');
    }

    registry.setInitialized();
  } catch (error) {
    console.error('[Composio] Failed to initialize tools:', error);
    registry.setInitialized(); // Mark as initialized anyway to prevent retry loops
  }
}
