import { getComposioClient } from './client';
import { prisma } from '../../../lib/prisma';

export interface ComposioConnection {
  id: string;
  appName: string;
  status: string;
}

// Map app names to their Composio auth config IDs
// These are configured in the Composio dashboard
const AUTH_CONFIG_IDS: Record<string, string> = {
  github: 'ac_RY8dHYoKhJen',
  slack: 'ac_vzzEMYnDaVg9',
  discord: 'ac_Dhv01DCPEbOO',
};

/**
 * Get auth config ID for an app, or fetch from API if not in map
 */
async function getAuthConfigId(appName: string): Promise<string | null> {
  const normalized = appName.toLowerCase();

  // Check our known mappings first
  if (AUTH_CONFIG_IDS[normalized]) {
    return AUTH_CONFIG_IDS[normalized];
  }

  // Try to fetch from Composio API
  const client = getComposioClient();
  if (!client) return null;

  try {
    const configs = await client.authConfigs.list();
    const items = (configs as any)?.items || [];
    const config = items.find((c: any) =>
      c.appName?.toLowerCase() === normalized ||
      c.name?.toLowerCase().includes(normalized)
    );
    if (config?.id) {
      // Cache for future use
      AUTH_CONFIG_IDS[normalized] = config.id;
      return config.id;
    }
  } catch (err) {
    console.warn(`[Composio] Failed to fetch auth config for ${appName}:`, err);
  }

  return null;
}

/**
 * Initiate an OAuth connection for a user to a Composio app.
 * Returns a redirect URL for the OAuth flow.
 */
export async function initiateConnection(
  userId: string,
  appName: string,
  redirectUrl: string
): Promise<{ redirectUrl: string; connectionId: string; alreadyConnected?: boolean } | null> {
  console.log(`[Composio] initiateConnection called with userId: "${userId}", appName: "${appName}"`);
  console.log(`[Composio] userId type: ${typeof userId}, length: ${userId?.length}`);

  const client = getComposioClient();
  if (!client) {
    console.error('[Composio] Client not initialized - check COMPOSIO_API_KEY');
    return null;
  }

  try {
    // First check if user already has an active connection for this app
    const existingConnections = await listUserConnections(userId);
    console.log(`[Composio] Existing connections for user:`, JSON.stringify(existingConnections, null, 2));

    // Flexible matching: check if appName includes the target or vice versa
    const normalizedAppName = appName.toLowerCase();
    const existingConnection = existingConnections.find(c => {
      const connApp = c.appName.toLowerCase();
      return (connApp === normalizedAppName ||
              connApp.includes(normalizedAppName) ||
              normalizedAppName.includes(connApp)) &&
             c.status === 'active';
    });

    if (existingConnection) {
      console.log(`[Composio] User already has active connection for ${appName}: ${existingConnection.id}`);
      // Return success with the existing connection
      return {
        redirectUrl: '',
        connectionId: existingConnection.id,
        alreadyConnected: true,
      };
    }

    console.log(`[Composio] No existing connection found, initiating new connection for app: ${appName}, user: ${userId}`);

    // Get the auth config ID for this app
    const authConfigId = await getAuthConfigId(appName);
    if (!authConfigId) {
      console.error(`[Composio] No auth config found for app: ${appName}`);
      return null;
    }

    console.log(`[Composio] Using auth config ID: ${authConfigId}`);

    // Use Composio SDK to initiate connection
    // Format: initiate(entityId, authConfigId, options)
    const connRequest = await (client.connectedAccounts.initiate as any)(
      userId,         // entityId (user identifier)
      authConfigId,   // authConfigId from Composio dashboard
      {
        callbackUrl: redirectUrl,  // Where to redirect after OAuth
      }
    );

    console.log('[Composio] Connection request result:', JSON.stringify(connRequest, null, 2));

    // Extract redirect URL and connection ID from response
    const oauthRedirectUrl = connRequest?.redirectUrl || connRequest?.redirect_url || '';
    const connectionId = connRequest?.connectedAccountId || connRequest?.id || '';

    if (!oauthRedirectUrl) {
      console.error('[Composio] No redirect URL returned. Response:', connRequest);
      // For some apps, we might need to check if an integration exists first
      return null;
    }

    // Store pending connection in our DB (non-blocking)
    try {
      console.log(`[Composio] Upserting ToolConnection for userId: ${userId}, toolName: ${appName.toLowerCase()}`);
      await prisma.toolConnection.upsert({
        where: {
          userId_toolName: { userId, toolName: appName.toLowerCase() },
        },
        update: {
          composioConnectionId: connectionId,
          status: 'pending',
          revokedAt: null,
        },
        create: {
          userId,
          toolName: appName.toLowerCase(),
          provider: 'composio',
          composioConnectionId: connectionId,
          status: 'pending',
        },
      });
      console.log('[Composio] ToolConnection upsert successful');
    } catch (dbError) {
      // DB write is optional, continue with OAuth
      console.warn('[Composio] Failed to store connection in DB:', dbError);
      console.warn('[Composio] DB Error details:', JSON.stringify(dbError, null, 2));
    }

    return {
      redirectUrl: oauthRedirectUrl,
      connectionId,
    };
  } catch (error) {
    console.error(`[Composio] Failed to initiate connection for ${appName}:`, error);
    if (error instanceof Error) {
      console.error('[Composio] Error message:', error.message);
      console.error('[Composio] Stack:', error.stack);
    }
    return null;
  }
}

/**
 * Check and update connection status after OAuth callback.
 */
export async function checkConnectionStatus(
  userId: string,
  appName: string
): Promise<ComposioConnection | null> {
  const client = getComposioClient();
  if (!client) return null;

  try {
    const response = await client.connectedAccounts.list({
      userUuid: userId,
    } as any);

    // Handle both array and {items: []} response formats
    const connections = Array.isArray(response) ? response : (response as any)?.items || [];

    const conn = connections.find((c: any) =>
      c.appName?.toLowerCase() === appName.toLowerCase() ||
      c.integrationId?.toLowerCase() === appName.toLowerCase()
    );

    if (!conn) return null;

    // Update status in our DB
    const status = conn.status === 'ACTIVE' ? 'active' : conn.status?.toLowerCase() || 'unknown';

    await prisma.toolConnection.upsert({
      where: {
        userId_toolName: { userId, toolName: appName.toLowerCase() },
      },
      update: {
        composioConnectionId: conn.id,
        status,
      },
      create: {
        userId,
        toolName: appName.toLowerCase(),
        provider: 'composio',
        composioConnectionId: conn.id,
        status,
      },
    });

    return {
      id: conn.id,
      appName: appName.toLowerCase(),
      status,
    };
  } catch (error) {
    console.error(`[Composio] Failed to check connection for ${appName}:`, error);
    return null;
  }
}

/**
 * List all connections for a user.
 */
export async function listUserConnections(userId: string): Promise<ComposioConnection[]> {
  const client = getComposioClient();
  if (!client) {
    // Fall back to DB records
    const dbConnections = await prisma.toolConnection.findMany({
      where: { userId, status: 'active' },
    });
    return dbConnections.map(c => ({
      id: c.id,
      appName: c.toolName,
      status: c.status,
    }));
  }

  try {
    const response = await client.connectedAccounts.list({
      userUuid: userId,
    } as any);

    console.log(`[Composio] Raw connected accounts response:`, JSON.stringify(response, null, 2));

    // Handle both array and {items: []} response formats
    const connections = Array.isArray(response) ? response : (response as any)?.items || [];

    const mapped = connections.map((c: any) => ({
      id: c.id,
      // Use toolkit.slug which is where Composio stores the app name (e.g., "github")
      appName: c.toolkit?.slug?.toLowerCase() || c.appName?.toLowerCase() || c.integrationId?.toLowerCase() || '',
      status: c.status === 'ACTIVE' ? 'active' : c.status?.toLowerCase() || 'unknown',
    }));

    console.log(`[Composio] Mapped connections:`, JSON.stringify(mapped, null, 2));
    return mapped;
  } catch (error) {
    console.error('[Composio] Failed to list connections:', error);
    return [];
  }
}

/**
 * Disconnect/revoke a user's connection to an app.
 */
export async function revokeConnection(userId: string, appName: string): Promise<boolean> {
  const client = getComposioClient();

  try {
    // Update our DB
    await prisma.toolConnection.updateMany({
      where: { userId, toolName: appName.toLowerCase() },
      data: { status: 'revoked', revokedAt: new Date() },
    });

    if (client) {
      const response = await client.connectedAccounts.list({ userUuid: userId } as any);
      const connections = Array.isArray(response) ? response : (response as any)?.items || [];

      const conn = connections.find((c: any) =>
        c.appName?.toLowerCase() === appName.toLowerCase() ||
        c.integrationId?.toLowerCase() === appName.toLowerCase()
      );

      if (conn) {
        await client.connectedAccounts.delete(conn.id);
      }
    }

    return true;
  } catch (error) {
    console.error(`[Composio] Failed to revoke connection for ${appName}:`, error);
    return false;
  }
}
