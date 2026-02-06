/**
 * Agent type definitions
 */

export type MemoryScope = 'shared' | 'isolated' | 'none';

export interface AgentConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
  customInstructions?: string;
}

export interface AgentDefinition {
  id?: string;
  name: string;
  description: string;
  icon?: string;
  systemPrompt: string;
  toolNames: string[];
  memoryScope: MemoryScope;
  isBuiltin: boolean;
  isPublic: boolean;
  config?: AgentConfig;
}

export interface Agent extends AgentDefinition {
  id: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentCreateInput {
  name: string;
  description: string;
  icon?: string;
  systemPrompt: string;
  toolNames: string[];
  memoryScope?: MemoryScope;
  isPublic?: boolean;
  config?: AgentConfig;
}

export interface AgentUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  systemPrompt?: string;
  toolNames?: string[];
  memoryScope?: MemoryScope;
  isPublic?: boolean;
  config?: AgentConfig;
}

export interface AgentExecutionContext {
  agentId: string;
  userId: string;
  prompt: string;
  memoryContext?: string;
  toolDescriptions?: string;
}

export interface AgentChainStep {
  agentId: string;
  promptTemplate: string;
  outputKey: string;
}

export interface AgentChain {
  id: string;
  name: string;
  description: string;
  steps: AgentChainStep[];
}
