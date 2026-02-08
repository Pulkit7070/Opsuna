import { ToolResult, ToolLog } from '@opsuna/shared';
import { getComposioClient } from './client';

/**
 * Extract the app name from a Composio action name.
 * e.g., "github_create_a_pull_request" -> "github"
 */
function extractAppName(actionName: string): string {
  const parts = actionName.toLowerCase().split('_');
  return parts[0] || '';
}

/**
 * Get the connected account ID for a user and app.
 */
async function getConnectedAccountId(userId: string, appName: string): Promise<string | null> {
  const client = getComposioClient();
  if (!client) return null;

  try {
    const response = await client.connectedAccounts.list({
      userUuid: userId,
    } as any);

    const connections = Array.isArray(response) ? response : (response as any)?.items || [];

    // Find an ACTIVE connection for this app
    const conn = connections.find((c: any) => {
      const connApp = c.toolkit?.slug?.toLowerCase() || c.appName?.toLowerCase() || '';
      const isMatchingApp = connApp === appName || connApp.includes(appName) || appName.includes(connApp);
      const isActive = c.status === 'ACTIVE' || c.status === 'active';
      return isMatchingApp && isActive;
    });

    if (conn) {
      console.log(`[Composio] Found active connection for ${appName}: ${conn.id}`);
    } else {
      console.log(`[Composio] No active connection found for ${appName}`);
    }

    return conn?.id || null;
  } catch (error) {
    console.error(`[Composio] Failed to get connected account for ${appName}:`, error);
    return null;
  }
}

/**
 * Execute a Composio action.
 * Requires the user to have a connected account for the relevant app.
 */
export async function executeComposioAction(
  callId: string,
  composioActionName: string,
  params: Record<string, unknown>,
  userId: string,
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  const client = getComposioClient();
  const startTime = Date.now();

  if (!client) {
    return {
      callId,
      toolName: composioActionName,
      success: false,
      error: {
        code: 'COMPOSIO_NOT_CONFIGURED',
        message: 'Composio API key is not configured',
        recoverable: false,
      },
      duration: 0,
      logs: [],
    };
  }

  // Extract app name and get connected account
  const appName = extractAppName(composioActionName);
  const connectedAccountId = await getConnectedAccountId(userId, appName);

  onLog({
    timestamp: new Date(),
    level: 'info',
    message: `Executing Composio action: ${composioActionName} (app: ${appName}, connected: ${!!connectedAccountId})`,
  });

  if (!connectedAccountId) {
    return {
      callId,
      toolName: composioActionName,
      success: false,
      error: {
        code: 'NO_CONNECTED_ACCOUNT',
        message: `No connected account found for ${appName}. Please connect your ${appName} account first.`,
        recoverable: true,
      },
      duration: Date.now() - startTime,
      logs: [],
    };
  }

  try {
    // Use the official tools.execute() method with dangerouslySkipVersionCheck
    // This is fine for hackathon/development - for production, pin specific versions
    console.log('[Composio] Executing action:', composioActionName);
    console.log('[Composio] With params:', JSON.stringify(params));
    console.log('[Composio] User ID:', userId);
    console.log('[Composio] Connected Account ID:', connectedAccountId);

    const result = await client.tools.execute(composioActionName, {
      userId,
      connectedAccountId,
      arguments: params,
      dangerouslySkipVersionCheck: true,
    } as any);

    const duration = Date.now() - startTime;

    onLog({
      timestamp: new Date(),
      level: 'info',
      message: `Composio action completed in ${duration}ms`,
    });

    // Composio returns { data, error, successful }
    const isSuccess = result?.successful !== false && !result?.error;

    return {
      callId,
      toolName: composioActionName,
      success: isSuccess,
      data: result?.data || result,
      error: !isSuccess
        ? {
            code: 'COMPOSIO_EXECUTION_FAILED',
            message: result?.error || 'Action execution failed',
            recoverable: true,
          }
        : undefined,
      duration,
      logs: [],
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);

    onLog({
      timestamp: new Date(),
      level: 'error',
      message: `Composio action failed: ${message}`,
    });

    return {
      callId,
      toolName: composioActionName,
      success: false,
      error: {
        code: 'COMPOSIO_ERROR',
        message,
        recoverable: message.includes('connected account') || message.includes('auth'),
      },
      duration,
      logs: [],
    };
  }
}
