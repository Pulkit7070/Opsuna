import { ToolResult, ToolLog } from '@opsuna/shared';

export async function postSlackMessage(
  callId: string,
  params: { channel: string; message: string },
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  const startTime = Date.now();
  const logs: ToolLog[] = [];

  const addLog = (level: ToolLog['level'], message: string) => {
    const log: ToolLog = { timestamp: new Date(), level, message };
    logs.push(log);
    onLog(log);
  };

  try {
    addLog('info', `Sending message to ${params.channel}`);

    await delay(300);
    addLog('info', 'Connecting to Slack API...');

    await delay(400);
    addLog('info', 'Posting message...');

    await delay(200);
    addLog('info', `Message posted to ${params.channel} successfully`);

    return {
      callId,
      toolName: 'post_slack_message',
      success: true,
      data: {
        channel: params.channel,
        messageId: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Failed to post message: ${error}`);
    return {
      callId,
      toolName: 'post_slack_message',
      success: false,
      error: {
        code: 'SLACK_POST_FAILED',
        message: String(error),
        recoverable: true,
      },
      duration: Date.now() - startTime,
      logs,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
