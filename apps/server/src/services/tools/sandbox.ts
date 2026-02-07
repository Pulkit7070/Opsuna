/**
 * Tool sandbox - Timeout wrapper and output size limits
 * Protects against runaway tool executions
 */

// Default timeout: 30 seconds
const DEFAULT_TIMEOUT_MS = 30 * 1000;

// Maximum output size: 1MB
const MAX_OUTPUT_SIZE = 1024 * 1024;

// Per-tool timeout overrides (some tools may need more time)
const TOOL_TIMEOUTS: Record<string, number> = {
  deploy_staging: 60 * 1000,     // 60s for deployments
  run_smoke_tests: 120 * 1000,   // 2 min for tests
  deploy_production: 90 * 1000,  // 90s for production deploys
};

export class ToolTimeoutError extends Error {
  constructor(toolName: string, timeoutMs: number) {
    super(`Tool "${toolName}" timed out after ${timeoutMs / 1000} seconds`);
    this.name = 'ToolTimeoutError';
  }
}

export class ToolOutputSizeError extends Error {
  constructor(toolName: string, size: number) {
    super(`Tool "${toolName}" output exceeds maximum size (${(size / 1024).toFixed(1)}KB > ${MAX_OUTPUT_SIZE / 1024}KB)`);
    this.name = 'ToolOutputSizeError';
  }
}

/**
 * Get timeout for a specific tool
 */
export function getToolTimeout(toolName: string): number {
  return TOOL_TIMEOUTS[toolName] || DEFAULT_TIMEOUT_MS;
}

/**
 * Wrap a promise with a timeout
 * Uses Promise.race to enforce the timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  toolName: string,
  timeoutMs?: number
): Promise<T> {
  const effectiveTimeout = timeoutMs ?? getToolTimeout(toolName);

  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new ToolTimeoutError(toolName, effectiveTimeout));
    }, effectiveTimeout);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Validate and potentially truncate tool output
 */
export function validateOutput<T>(toolName: string, output: T): T {
  if (output === null || output === undefined) {
    return output;
  }

  // For objects, check serialized size
  if (typeof output === 'object') {
    const serialized = JSON.stringify(output);
    const size = Buffer.byteLength(serialized, 'utf8');

    if (size > MAX_OUTPUT_SIZE) {
      console.warn(`[Sandbox] Tool "${toolName}" output truncated: ${(size / 1024).toFixed(1)}KB`);

      // Try to preserve partial data with truncation notice
      return {
        _truncated: true,
        _originalSize: size,
        _message: `Output truncated. Original size: ${(size / 1024).toFixed(1)}KB`,
        data: serialized.substring(0, MAX_OUTPUT_SIZE / 2) + '... [TRUNCATED]',
      } as T;
    }
  }

  // For strings, check length
  if (typeof output === 'string') {
    const size = Buffer.byteLength(output, 'utf8');
    if (size > MAX_OUTPUT_SIZE) {
      console.warn(`[Sandbox] Tool "${toolName}" string output truncated: ${(size / 1024).toFixed(1)}KB`);
      return (output.substring(0, MAX_OUTPUT_SIZE / 2) + '... [TRUNCATED]') as T;
    }
  }

  return output;
}

/**
 * Execute a tool with full sandbox protection
 * Applies timeout and output validation
 */
export async function sandboxExecute<T>(
  toolName: string,
  executor: () => Promise<T>,
  options?: {
    timeoutMs?: number;
    maxOutputSize?: number;
  }
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? getToolTimeout(toolName);

  // Execute with timeout
  const result = await withTimeout(executor(), toolName, timeoutMs);

  // Validate and potentially truncate output
  return validateOutput(toolName, result);
}

/**
 * Create a sandboxed version of a tool executor function
 */
export function createSandboxedExecutor<TParams, TResult>(
  toolName: string,
  executor: (params: TParams) => Promise<TResult>
): (params: TParams) => Promise<TResult> {
  return async (params: TParams) => {
    return sandboxExecute(toolName, () => executor(params));
  };
}
