import { ToolResult, ToolLog } from '@opsuna/shared';

export async function runSmokeTests(
  callId: string,
  params: { environment: string; suite?: string },
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  const startTime = Date.now();
  const logs: ToolLog[] = [];
  const suite = params.suite || 'smoke';

  const addLog = (level: ToolLog['level'], message: string) => {
    const log: ToolLog = { timestamp: new Date(), level, message };
    logs.push(log);
    onLog(log);
  };

  try {
    addLog('info', `Starting ${suite} tests on ${params.environment}`);

    await delay(400);
    addLog('info', 'Initializing test runner...');

    await delay(300);
    addLog('info', 'Loading test configuration...');

    // Simulate running tests
    const testCases = [
      { name: 'Health endpoint responds', passed: true },
      { name: 'Authentication flow works', passed: true },
      { name: 'API returns valid JSON', passed: true },
      { name: 'Database connection active', passed: true },
      { name: 'Cache layer operational', passed: true },
    ];

    for (const test of testCases) {
      await delay(500);
      if (test.passed) {
        addLog('info', `  PASS: ${test.name}`);
      } else {
        addLog('error', `  FAIL: ${test.name}`);
      }
    }

    await delay(300);
    const passed = testCases.filter(t => t.passed).length;
    const total = testCases.length;
    addLog('info', `Test run complete: ${passed}/${total} passed`);

    return {
      callId,
      toolName: 'run_smoke_tests',
      success: true,
      data: {
        environment: params.environment,
        suite,
        passed,
        failed: total - passed,
        total,
        results: testCases,
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Test execution failed: ${error}`);
    return {
      callId,
      toolName: 'run_smoke_tests',
      success: false,
      error: {
        code: 'TEST_EXECUTION_FAILED',
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
