import { ToolResult, ToolLog } from '@opsuna/shared';

export async function createJiraTicket(
  callId: string,
  params: { title: string; description: string; type: string; priority?: string; assignee?: string },
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
    addLog('info', `Creating Jira ticket: ${params.title}`);

    await delay(300);
    addLog('info', `Type: ${params.type}`);

    await delay(200);
    addLog('info', `Priority: ${params.priority || 'Medium'}`);

    await delay(400);
    addLog('info', 'Connecting to Jira API...');

    await delay(500);
    addLog('info', 'Creating ticket...');

    await delay(300);
    if (params.assignee) {
      addLog('info', `Assigning to: ${params.assignee}`);
    }

    await delay(200);
    const ticketKey = `PROJ-${Math.floor(Math.random() * 9000) + 1000}`;
    addLog('info', `✅ Ticket created: ${ticketKey}`);

    return {
      callId,
      toolName: 'create_jira_ticket',
      success: true,
      data: {
        key: ticketKey,
        id: `ticket-${Date.now()}`,
        title: params.title,
        description: params.description,
        type: params.type,
        priority: params.priority || 'Medium',
        status: 'To Do',
        assignee: params.assignee || null,
        reporter: 'automation@example.com',
        url: `https://jira.example.com/browse/${ticketKey}`,
        createdAt: new Date().toISOString(),
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Failed to create Jira ticket: ${error}`);
    return {
      callId,
      toolName: 'create_jira_ticket',
      success: false,
      error: {
        code: 'JIRA_CREATE_FAILED',
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
