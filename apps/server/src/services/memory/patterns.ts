import { storeMemory, searchMemory, getRecentMemories, MemoryRecord } from './store';

export interface ToolPattern {
  toolName: string;
  successCount: number;
  failureCount: number;
  avgDuration?: number;
  lastUsed?: Date;
  commonErrors?: string[];
  successRate: number;
}

export interface ToolOutcome {
  toolName: string;
  success: boolean;
  duration?: number;
  error?: string;
  parameters?: Record<string, unknown>;
  result?: unknown;
}

/**
 * Record a tool execution outcome as a pattern memory.
 */
export async function recordToolOutcome(
  userId: string,
  outcome: ToolOutcome
): Promise<void> {
  const { toolName, success, duration, error, parameters, result } = outcome;

  // Create a content summary for embedding
  const statusStr = success ? 'succeeded' : 'failed';
  const durationStr = duration ? ` in ${duration}ms` : '';
  const errorStr = error ? ` Error: ${error}` : '';
  const content = `Tool ${toolName} ${statusStr}${durationStr}.${errorStr}`;

  await storeMemory({
    userId,
    type: 'pattern',
    content,
    metadata: {
      toolName,
      success,
      duration,
      error,
      parameters,
      resultSummary: result
        ? typeof result === 'string'
          ? result.slice(0, 200)
          : JSON.stringify(result).slice(0, 200)
        : null,
      recordedAt: new Date().toISOString(),
    },
  });
}

/**
 * Record multiple tool outcomes from an execution.
 */
export async function recordExecutionOutcomes(
  userId: string,
  outcomes: ToolOutcome[]
): Promise<void> {
  await Promise.all(outcomes.map((outcome) => recordToolOutcome(userId, outcome)));
}

/**
 * Get tool patterns for a user.
 * Aggregates success/failure counts from pattern memories.
 */
export async function getToolPatterns(
  userId: string,
  toolNames?: string[]
): Promise<ToolPattern[]> {
  const memories = await getRecentMemories(userId, {
    type: 'pattern',
    limit: 500, // Get last 500 pattern records for aggregation
  });

  // Aggregate by tool name
  const patternMap = new Map<
    string,
    {
      successCount: number;
      failureCount: number;
      totalDuration: number;
      durationCount: number;
      lastUsed: Date;
      errors: string[];
    }
  >();

  for (const memory of memories) {
    const meta = memory.metadata as {
      toolName: string;
      success: boolean;
      duration?: number;
      error?: string;
      recordedAt?: string;
    } | null;

    if (!meta?.toolName) continue;

    // Filter by tool names if specified
    if (toolNames && !toolNames.includes(meta.toolName)) continue;

    const existing = patternMap.get(meta.toolName) || {
      successCount: 0,
      failureCount: 0,
      totalDuration: 0,
      durationCount: 0,
      lastUsed: new Date(0),
      errors: [],
    };

    if (meta.success) {
      existing.successCount++;
    } else {
      existing.failureCount++;
      if (meta.error) {
        existing.errors.push(meta.error);
      }
    }

    if (meta.duration) {
      existing.totalDuration += meta.duration;
      existing.durationCount++;
    }

    const recordedAt = meta.recordedAt ? new Date(meta.recordedAt) : memory.createdAt;
    if (recordedAt > existing.lastUsed) {
      existing.lastUsed = recordedAt;
    }

    patternMap.set(meta.toolName, existing);
  }

  // Convert to ToolPattern array
  const patterns: ToolPattern[] = [];
  for (const [toolName, data] of patternMap) {
    const total = data.successCount + data.failureCount;
    patterns.push({
      toolName,
      successCount: data.successCount,
      failureCount: data.failureCount,
      avgDuration: data.durationCount > 0 ? data.totalDuration / data.durationCount : undefined,
      lastUsed: data.lastUsed.getTime() > 0 ? data.lastUsed : undefined,
      commonErrors: data.errors.length > 0 ? [...new Set(data.errors)].slice(0, 5) : undefined,
      successRate: total > 0 ? data.successCount / total : 0,
    });
  }

  // Sort by usage count (most used first)
  patterns.sort((a, b) => (b.successCount + b.failureCount) - (a.successCount + a.failureCount));

  return patterns;
}

/**
 * Get pattern-based suggestions for the AI.
 * Returns a formatted string describing tool patterns.
 */
export async function getPatternContext(userId: string): Promise<string> {
  const patterns = await getToolPatterns(userId);

  if (patterns.length === 0) {
    return '';
  }

  const lines: string[] = ['Tool usage patterns from your history:'];

  for (const pattern of patterns.slice(0, 10)) {
    const total = pattern.successCount + pattern.failureCount;
    const rateStr = (pattern.successRate * 100).toFixed(0);

    let line = `- ${pattern.toolName}: ${total} uses, ${rateStr}% success rate`;

    if (pattern.avgDuration) {
      line += `, avg ${Math.round(pattern.avgDuration)}ms`;
    }

    if (pattern.failureCount > 0 && pattern.commonErrors?.length) {
      line += `. Common errors: ${pattern.commonErrors[0]}`;
    }

    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Search for similar past tool executions.
 */
export async function findSimilarToolExecutions(
  userId: string,
  query: string,
  limit: number = 5
): Promise<MemoryRecord[]> {
  return searchMemory(userId, query, {
    type: 'pattern',
    limit,
    minSimilarity: 0.6,
  });
}
