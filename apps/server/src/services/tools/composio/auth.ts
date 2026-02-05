import { getComposioClient } from './client';
import { prisma } from '../../../lib/prisma';

export interface ComposioConnection {
  id: string;
  appName: string;
  status: string;
}

/**
 * Initiate an OAuth connection for a user to a Composio app.
 * Returns a redirect URL for the OAuth flow.
 */
export async function initiateConnection(
  userId: string,
  appName: string,
  redirectUrl: string
): Promise<{ redirectUrl: string; connectionId: string } | null> {
  const client = getComposioClient();
  if (!client) return null;

  try {
    // The Composio SDK API - use any cast to handle varying SDK versions
    const initiateMethod = client.connectedAccounts.initiate as any;
    const result = await initiateMethod({
      integrationId: appName.toLowerCase(),
      userUuid: userId,
      redirectUri: redirectUrl,
    });

    // Handle different response formats
    const resultAny = result as any;
    const connectionId = resultAny.connectedAccountId || resultAny.id || '';
    const oauthRedirectUrl = resultAny.redirectUrl || resultAny.connectionStatus || '';

    // Store connection in our DB
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

    return {
      redirectUrl: oauthRedirectUrl,
      connectionId,
    };
  } catch (error) {
    console.error(`[Composio] Failed to initiate connection for ${appName}:`, error);
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

    // Handle both array and {items: []} response formats
    const connections = Array.isArray(response) ? response : (response as any)?.items || [];

    return connections.map((c: any) => ({
      id: c.id,
      appName: c.appName?.toLowerCase() || c.integrationId?.toLowerCase() || '',
      status: c.status === 'ACTIVE' ? 'active' : c.status?.toLowerCase() || 'unknown',
    }));
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
