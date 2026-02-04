import { ToolResult, ToolLog } from '@opsuna/shared';
import { getComposioClient } from './client';

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

  onLog({
    timestamp: new Date(),
    level: 'info',
    message: `Executing Composio action: ${composioActionName}`,
  });

  try {
    const result = await client.tools.execute(composioActionName, {
      userId,
      arguments: params,
    });

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
