import { ToolResult, ToolLog } from '@opsuna/shared';

// Fake Slack users for realistic responses
const SLACK_USERS = [
  { id: 'U01ABC123', name: 'alice', real_name: 'Alice Johnson' },
  { id: 'U02DEF456', name: 'bob', real_name: 'Bob Smith' },
  { id: 'U03GHI789', name: 'charlie', real_name: 'Charlie Brown' },
];

// Fake Slack channels
const SLACK_CHANNELS: Record<string, { id: string; name: string; members: number }> = {
  '#engineering': { id: 'C01ENG001', name: 'engineering', members: 42 },
  '#devops': { id: 'C02OPS002', name: 'devops', members: 15 },
  '#general': { id: 'C03GEN003', name: 'general', members: 128 },
  '#deployments': { id: 'C04DEP004', name: 'deployments', members: 23 },
  '#alerts': { id: 'C05ALR005', name: 'alerts', members: 31 },
};

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
    const channelKey = params.channel.startsWith('#') ? params.channel : `#${params.channel}`;
    const channelInfo = SLACK_CHANNELS[channelKey] || {
      id: `C${Date.now().toString(36).toUpperCase()}`,
      name: params.channel.replace('#', ''),
      members: Math.floor(Math.random() * 50) + 5,
    };

    addLog('info', `Connecting to Slack workspace...`);
    await delay(200);

    addLog('info', `Resolving channel ${channelKey}...`);
    await delay(150);

    addLog('info', `Found channel: ${channelInfo.name} (${channelInfo.members} members)`);
    await delay(100);

    addLog('info', `Posting message (${params.message.length} characters)...`);
    await delay(300);

    const messageTs = `${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    addLog('info', `Message posted successfully to ${channelKey}`);

    // Simulate reaction from bot
    await delay(100);
    addLog('info', `Received delivery confirmation from Slack`);

    return {
      callId,
      toolName: 'post_slack_message',
      success: true,
      data: {
        ok: true,
        channel: channelInfo.id,
        channelName: channelInfo.name,
        ts: messageTs,
        message: {
          type: 'message',
          subtype: 'bot_message',
          text: params.message,
          ts: messageTs,
          username: 'Opsuna Bot',
          icons: { emoji: ':robot_face:' },
        },
        permalink: `https://workspace.slack.com/archives/${channelInfo.id}/p${messageTs.replace('.', '')}`,
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
