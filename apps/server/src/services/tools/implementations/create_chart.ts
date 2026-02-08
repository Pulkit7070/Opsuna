import { ToolResult, ToolLog } from '@opsuna/shared';

interface ChartDataPoint {
  name: string;
  value: number;
}

export async function createChart(
  callId: string,
  params: Record<string, unknown>,
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  // Extract and validate params
  const title = params.title as string;
  const chartType = params.chartType as 'line' | 'bar' | 'pie' | 'area';
  const data = params.data as ChartDataPoint[];
  const xAxisLabel = params.xAxisLabel as string | undefined;
  const yAxisLabel = params.yAxisLabel as string | undefined;
  const startTime = Date.now();
  const logs: ToolLog[] = [];

  const addLog = (level: ToolLog['level'], message: string) => {
    const log: ToolLog = { timestamp: new Date(), level, message };
    logs.push(log);
    onLog(log);
  };

  try {
    addLog('info', `Creating ${chartType} chart: "${title}"`);

    await delay(200);
    addLog('info', `Processing ${data?.length || 0} data points...`);

    // Validate data
    if (!data || data.length === 0) {
      throw new Error('No data provided for chart');
    }

    await delay(150);
    addLog('info', 'Generating visualization...');

    // Calculate some statistics for the log
    const values = data.map(d => d.value);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    await delay(100);
    addLog('info', `Data range: ${min.toLocaleString()} - ${max.toLocaleString()}`);
    addLog('info', `Average: ${avg.toLocaleString()}`);
    addLog('info', 'Chart generated successfully');

    return {
      callId,
      toolName: 'create_chart',
      success: true,
      data: {
        visualization: {
          type: 'chart',
          component: 'DataChart',
          props: {
            title,
            type: chartType,
            data,
            xAxisLabel,
            yAxisLabel,
          },
        },
        statistics: {
          total,
          average: Math.round(avg * 100) / 100,
          max,
          min,
          count: data.length,
        },
      },
      duration: Date.now() - startTime,
      logs,
    };
  } catch (error) {
    addLog('error', `Chart creation failed: ${error}`);
    return {
      callId,
      toolName: 'create_chart',
      success: false,
      error: {
        code: 'CHART_CREATION_FAILED',
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
