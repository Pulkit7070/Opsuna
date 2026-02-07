import { ToolResult, ToolLog } from '@opsuna/shared';

export async function runDatabaseMigration(
  callId: string,
  params: { environment: string; dryRun?: boolean },
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
    const isDryRun = params.dryRun ?? false;
    addLog('info', `${isDryRun ? '[DRY RUN] ' : ''}Running database migrations on ${params.environment}`);

    await delay(500);
    addLog('info', 'Connecting to database...');

    await delay(400);
    addLog('info', 'Checking migration status...');

    await delay(600);
    addLog('info', 'Pending migrations:');

    await delay(200);
    addLog('info', '  - 20240201_add_users_table');

    await delay(200);
    addLog('info', '  - 20240215_add_sessions_table');

    await delay(200);
    addLog('info', '  - 20240220_add_audit_logs');

    if (!isDryRun) {
      await delay(800);
      addLog('info', 'Applying migrations...');

      await delay(600);
      addLog('info', '  ✓ 20240201_add_users_table applied');

      await delay(500);
      addLog('info', '  ✓ 20240215_add_sessions_table applied');

      await delay(400);
      addLog('info', '  ✓ 20240220_add_audit_logs applied');
    }

    await delay(300);
    addLog('info', `${isDryRun ? '[DRY RUN] ' : ''}Migration complete`);

    return {
      callId,
      toolName: 'run_database_migration',
      success: true,
      data: {
        environment: params.environment,
        dryRun: isDryRun,
        migrationsApplied: isDryRun ? 0 : 3,
        migrations: [
          { name: '20240201_add_users_table', status: isDryRun ? 'pending' : 'applied' },
          { name: '20240215_add_sessions_table', status: isDryRun ? 'pending' : 'applied' },
          { name: '20240220_add_audit_logs', status: isDryRun ? 'pending' : 'applied' },
        ],
        completedAt: new Date().toISOString(),
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Database migration failed: ${error}`);
    return {
      callId,
      toolName: 'run_database_migration',
      success: false,
      error: {
        code: 'MIGRATION_FAILED',
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
