import { ToolResult, ToolLog } from '@opsuna/shared';

export async function rollbackDeploy(
  callId: string,
  params: { environment: string; version?: string },
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
    const targetVersion = params.version || 'previous';
    addLog('info', `Starting rollback of ${params.environment} to ${targetVersion}`);

    await delay(500);
    addLog('warn', 'This action will revert the current deployment');

    await delay(600);
    addLog('info', 'Fetching previous deployment configuration...');

    await delay(800);
    addLog('info', 'Stopping current deployment...');

    await delay(1000);
    addLog('info', 'Reverting to previous version...');

    await delay(700);
    addLog('info', 'Restarting services...');

    await delay(500);
    addLog('info', 'Running health checks...');

    await delay(400);
    addLog('info', `Rollback of ${params.environment} completed successfully`);

    return {
      callId,
      toolName: 'rollback_deploy',
      success: true,
      data: {
        environment: params.environment,
        previousVersion: '1.0.0',
        rolledBackTo: targetVersion === 'previous' ? '0.9.9' : targetVersion,
        timestamp: new Date().toISOString(),
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Rollback failed: ${error}`);
    return {
      callId,
      toolName: 'rollback_deploy',
      success: false,
      error: {
        code: 'ROLLBACK_FAILED',
        message: String(error),
        recoverable: false,
      },
      duration: Date.now() - startTime,
      logs,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
