import { ToolResult, ToolLog } from '@opsuna/shared';

export async function checkCIStatus(
  callId: string,
  params: { repo: string; branch?: string },
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
    const branch = params.branch || 'main';
    addLog('info', `Checking CI status for ${params.repo}@${branch}`);

    await delay(400);
    addLog('info', 'Fetching workflow runs...');

    await delay(600);
    addLog('info', 'Latest workflows:');

    await delay(300);
    addLog('info', '  ✓ Build & Test - passed (2m 34s ago)');

    await delay(200);
    addLog('info', '  ✓ Lint & Format - passed (2m 34s ago)');

    await delay(200);
    addLog('info', '  ✓ Security Scan - passed (2m 34s ago)');

    await delay(200);
    addLog('info', '  ✓ Deploy Preview - passed (1m 12s ago)');

    await delay(300);
    addLog('info', 'All CI checks passing');

    return {
      callId,
      toolName: 'check_ci_status',
      success: true,
      data: {
        repo: params.repo,
        branch,
        status: 'success',
        workflows: [
          { name: 'Build & Test', status: 'success', duration: '3m 45s', completedAt: new Date(Date.now() - 154000).toISOString() },
          { name: 'Lint & Format', status: 'success', duration: '1m 12s', completedAt: new Date(Date.now() - 154000).toISOString() },
          { name: 'Security Scan', status: 'success', duration: '2m 8s', completedAt: new Date(Date.now() - 154000).toISOString() },
          { name: 'Deploy Preview', status: 'success', duration: '4m 22s', completedAt: new Date(Date.now() - 72000).toISOString() },
        ],
        commitSha: 'abc123def456',
        commitMessage: 'feat: add new feature',
        author: 'developer@example.com',
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Failed to check CI status: ${error}`);
    return {
      callId,
      toolName: 'check_ci_status',
      success: false,
      error: {
        code: 'CI_CHECK_FAILED',
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
