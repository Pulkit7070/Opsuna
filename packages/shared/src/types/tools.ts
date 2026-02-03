import { RiskLevel } from './execution';

export interface Tool {
  name: string;
  displayName: string;
  description: string;
  category: ToolCategory;
  riskLevel: RiskLevel;
  parameters: ToolParameter[];
  rollbackSupported: boolean;
}

export type ToolCategory = 'deployment' | 'testing' | 'notification' | 'version_control' | 'database' | 'infrastructure';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
  enum?: string[];
}

export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  executionId: string;
  stepId: string;
}

export interface ToolResult {
  callId: string;
  toolName: string;
  success: boolean;
  data?: unknown;
  error?: ToolError;
  duration: number;
  logs: ToolLog[];
}

export interface ToolError {
  code: string;
  message: string;
  details?: unknown;
  recoverable: boolean;
}

export interface ToolLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface ToolRegistry {
  tools: Map<string, Tool>;
  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(): Tool[];
  listByCategory(category: ToolCategory): Tool[];
}
