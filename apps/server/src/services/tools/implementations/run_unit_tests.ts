import { ToolResult, ToolLog } from '@opsuna/shared';

export async function runUnitTests(
  callId: string,
  params: { testSuite?: string; coverage?: boolean },
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
    const suite = params.testSuite || 'all';
    addLog('info', `Running unit tests for suite: ${suite}`);

    await delay(500);
    addLog('info', 'Collecting test files...');

    await delay(800);
    addLog('info', 'Running 47 test files...');

    await delay(1200);
    addLog('info', '  ✓ auth.test.ts (12 tests, 245ms)');

    await delay(400);
    addLog('info', '  ✓ api.test.ts (23 tests, 512ms)');

    await delay(300);
    addLog('info', '  ✓ utils.test.ts (8 tests, 89ms)');

    await delay(500);
    addLog('info', '  ✓ components.test.tsx (34 tests, 1.2s)');

    await delay(600);
    if (params.coverage) {
      addLog('info', 'Generating coverage report...');
      await delay(400);
    }

    addLog('info', 'All tests passed!');

    return {
      callId,
      toolName: 'run_unit_tests',
      success: true,
      data: {
        suite,
        totalTests: 142,
        passed: 142,
        failed: 0,
        skipped: 3,
        duration: '4.2s',
        coverage: params.coverage ? {
          lines: 87.4,
          branches: 82.1,
          functions: 91.2,
          statements: 86.8,
        } : null,
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Test run failed: ${error}`);
    return {
      callId,
      toolName: 'run_unit_tests',
      success: false,
      error: {
        code: 'TEST_RUN_FAILED',
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
