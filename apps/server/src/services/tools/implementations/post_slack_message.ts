import { ToolResult, ToolLog } from '@opsuna/shared';
import { getComposioClient } from '../composio/client';

/**
 * Get Composio connected account for Slack
 */
async function getSlackConnection(userId: string): Promise<string | null> {
  const client = getComposioClient();
  if (!client) return null;

  try {
    const response = await client.connectedAccounts.list({
      userUuid: userId,
    } as any);

    const connections = Array.isArray(response) ? response : (response as any)?.items || [];

    // Find an ACTIVE Slack connection
    const conn = connections.find((c: any) => {
      const connApp = c.toolkit?.slug?.toLowerCase() || c.appName?.toLowerCase() || '';
      const isSlack = connApp === 'slack' || connApp.includes('slack');
      const isActive = c.status === 'ACTIVE' || c.status === 'active';
      return isSlack && isActive;
    });

    return conn?.id || null;
  } catch (error) {
    console.error('[Slack] Failed to check Composio connection:', error);
    return null;
  }
}

/**
 * Execute Slack message via Composio
 */
async function sendViaComposio(
  callId: string,
  channel: string,
  message: string,
  userId: string,
  connectedAccountId: string,
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  const client = getComposioClient()!;
  const startTime = Date.now();

  onLog({
    timestamp: new Date(),
    level: 'info',
    message: `Sending message to ${channel} via Slack API...`,
  });

  try {
    // Use Composio's Slack send message action
    const result = await client.tools.execute('slack_sends_a_message_to_a_slack_channel', {
      userId,
      connectedAccountId,
      arguments: {
        channel: channel.replace('#', ''),
        text: message,
      },
      dangerouslySkipVersionCheck: true,
    } as any);

    const duration = Date.now() - startTime;
    const isSuccess = result?.successful !== false && !result?.error;

    if (isSuccess) {
      onLog({
        timestamp: new Date(),
        level: 'info',
        message: `Message sent successfully to ${channel}`,
      });
    }

    return {
      callId,
      toolName: 'post_slack_message',
      success: isSuccess,
      data: result?.data || result,
      error: !isSuccess
        ? {
            code: 'SLACK_SEND_FAILED',
            message: result?.error || 'Failed to send Slack message',
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
      message: `Slack send failed: ${message}`,
    });

    return {
      callId,
      toolName: 'post_slack_message',
      success: false,
      error: {
        code: 'SLACK_ERROR',
        message,
        recoverable: true,
      },
      duration,
      logs: [],
    };
  }
}

export async function postSlackMessage(
  callId: string,
  params: Record<string, unknown>,
  onLog: (log: ToolLog) => void,
  userId?: string
): Promise<ToolResult> {
  const startTime = Date.now();

  // Validate required parameters
  const channel = params.channel as string;
  const message = params.message as string;

  if (!channel || !message) {
    return {
      callId,
      toolName: 'post_slack_message',
      success: false,
      error: {
        code: 'MISSING_PARAMS',
        message: 'Missing required parameters: channel and message',
        recoverable: false,
      },
      duration: 0,
      logs: [],
    };
  }

  // Check if user has Slack connected via Composio
  if (userId) {
    const connectedAccountId = await getSlackConnection(userId);

    if (connectedAccountId) {
      return sendViaComposio(callId, channel, message, userId, connectedAccountId, onLog);
    }
  }

  // No Composio connection - return helpful error
  onLog({
    timestamp: new Date(),
    level: 'warn',
    message: 'Slack not connected - message will not be sent',
  });

  return {
    callId,
    toolName: 'post_slack_message',
    success: false,
    error: {
      code: 'SLACK_NOT_CONNECTED',
      message: 'Slack is not connected. Please go to Tools page and connect your Slack workspace to send messages.',
      recoverable: true,
    },
    duration: Date.now() - startTime,
    logs: [],
  };
}
