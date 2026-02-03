import { ToolResult, ToolLog } from '@opsuna/shared';

export async function createGithubPR(
  callId: string,
  params: { title: string; body: string; base: string; head: string },
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
    addLog('info', `Creating PR: ${params.head} -> ${params.base}`);

    await delay(500);
    addLog('info', 'Authenticating with GitHub...');

    await delay(400);
    addLog('info', 'Checking branch status...');

    await delay(300);
    addLog('info', `Comparing ${params.head} with ${params.base}...`);

    await delay(600);
    addLog('info', 'Creating pull request...');

    const prNumber = Math.floor(Math.random() * 1000) + 100;
    await delay(400);
    addLog('info', `Pull request #${prNumber} created successfully`);

    return {
      callId,
      toolName: 'create_github_pr',
      success: true,
      data: {
        prNumber,
        title: params.title,
        url: `https://github.com/example/repo/pull/${prNumber}`,
        state: 'open',
        base: params.base,
        head: params.head,
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Failed to create PR: ${error}`);
    return {
      callId,
      toolName: 'create_github_pr',
      success: false,
      error: {
        code: 'PR_CREATION_FAILED',
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
