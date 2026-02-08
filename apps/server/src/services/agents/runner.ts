/**
 * Agent runner - Resolves agent config and executes with scoped context
 */

import { Tool } from '@opsuna/shared';
import { Agent } from './types';
import { getAgent } from './registry';
import { registry } from '../tools/registry';
import { searchMemory } from '../memory/store';
import { getConversationHistory } from '../memory/conversation';
import { getToolPatterns } from '../memory/patterns';

export interface AgentPromptContext {
  systemPrompt: string;
  toolsDescription: string;
  memoryContext: string;
  conversationHistory: string;
  toolPatterns: string;
}

/**
 * Build the full prompt context for an agent execution.
 */
export async function buildAgentContext(
  agentId: string,
  userId: string,
  userPrompt: string
): Promise<AgentPromptContext | null> {
  const agent = await getAgent(agentId);
  if (!agent) {
    return null;
  }

  // Get agent-scoped tools
  const toolsDescription = buildAgentToolsDescription(agent);

  // Get memory context based on scope
  const memoryContext = await buildAgentMemoryContext(
    agent,
    userId,
    userPrompt
  );

  // Get conversation history based on scope
  const conversationHistory = await buildAgentConversationHistory(
    agent,
    userId
  );

  // Get tool patterns
  const toolPatterns = await buildAgentToolPatterns(agent, userId);

  return {
    systemPrompt: agent.systemPrompt,
    toolsDescription,
    memoryContext,
    conversationHistory,
    toolPatterns,
  };
}

/**
 * Build tools description for agent (filtered by allowed tools).
 * Uses detailed format with full parameter descriptions.
 */
function buildAgentToolsDescription(agent: Agent): string {
  const allTools = registry.list();
  const allowedTools = allTools.filter((tool: Tool) =>
    agent.toolNames.length === 0 || agent.toolNames.includes(tool.name)
  );

  if (allowedTools.length === 0) {
    return 'No tools available for this agent.';
  }

  // Use detailed format matching the base prompt
  const toolDescriptions = allowedTools.map((tool: Tool, i: number) => {
    const params = tool.parameters.map(p => {
      const req = p.required ? ' (required)' : ' (optional)';
      const enumStr = p.enum ? ` [options: ${p.enum.join(', ')}]` : '';
      return `     - ${p.name}: ${p.type}${req} - ${p.description}${enumStr}`;
    }).join('\n');

    return `${i + 1}. ${tool.name} - ${tool.description}
   Risk: ${tool.riskLevel}
   Parameters:
${params}`;
  }).join('\n\n');

  // Emphasize the PRIMARY tool for this agent
  const primaryTool = agent.toolNames[0];
  const primaryNote = primaryTool
    ? `\n\nPRIMARY TOOL: "${primaryTool}" - Use this as your default choice for the agent's main purpose.\n`
    : '';

  return `AVAILABLE TOOLS FOR THIS AGENT:
${primaryNote}
${toolDescriptions}

IMPORTANT: Only use tools from this list. Select the most appropriate tool based on the user's request.`;
}

/**
 * Build memory context for agent based on memory scope.
 */
async function buildAgentMemoryContext(
  agent: Agent,
  userId: string,
  userPrompt: string
): Promise<string> {
  if (agent.memoryScope === 'none') {
    return '';
  }

  try {
    // For isolated scope, filter by agent ID
    const memories = await searchMemory(userId, userPrompt, { limit: 5 });

    if (agent.memoryScope === 'isolated') {
      // Filter memories to only those from this agent's executions
      const agentMemories = memories.filter((m) => {
        const metadata = m.metadata as { agentId?: string } | null;
        return metadata?.agentId === agent.id;
      });

      if (agentMemories.length === 0) {
        return '';
      }

      return `\n## Relevant Context from Previous ${agent.name} Sessions:\n${agentMemories
        .map((m) => `- ${m.content}`)
        .join('\n')}`;
    }

    // Shared scope - use all memories
    if (memories.length === 0) {
      return '';
    }

    return `\n## Relevant Context from Previous Sessions:\n${memories
      .map((m) => `- ${m.content}`)
      .join('\n')}`;
  } catch (error) {
    console.warn('[AgentRunner] Failed to get memory context:', error);
    return '';
  }
}

/**
 * Build conversation history for agent.
 */
async function buildAgentConversationHistory(
  agent: Agent,
  userId: string
): Promise<string> {
  if (agent.memoryScope === 'none') {
    return '';
  }

  try {
    const messages = await getConversationHistory(userId, { limit: 10 });

    if (agent.memoryScope === 'isolated') {
      // Filter to agent-specific conversations
      const agentMessages = messages.filter((m) => {
        const metadata = m.metadata as { agentId?: string } | null;
        return metadata?.agentId === agent.id;
      });

      if (agentMessages.length === 0) {
        return '';
      }

      return `\n## Recent ${agent.name} Conversation:\n${agentMessages
        .map((m) => `[${m.role}]: ${m.content.slice(0, 200)}${m.content.length > 200 ? '...' : ''}`)
        .join('\n')}`;
    }

    if (messages.length === 0) {
      return '';
    }

    return `\n## Recent Conversation:\n${messages
      .map((m) => `[${m.role}]: ${m.content.slice(0, 200)}${m.content.length > 200 ? '...' : ''}`)
      .join('\n')}`;
  } catch (error) {
    console.warn('[AgentRunner] Failed to get conversation history:', error);
    return '';
  }
}

/**
 * Build tool patterns for agent.
 */
async function buildAgentToolPatterns(
  agent: Agent,
  userId: string
): Promise<string> {
  if (agent.memoryScope === 'none') {
    return '';
  }

  try {
    const patterns = await getToolPatterns(userId, agent.toolNames.length > 0 ? agent.toolNames : undefined);

    if (patterns.length === 0) {
      return '';
    }

    const patternLines = patterns
      .filter((p) => p.successCount + p.failureCount > 0)
      .map((p) => {
        const total = p.successCount + p.failureCount;
        const rate = ((p.successCount / total) * 100).toFixed(0);
        return `- ${p.toolName}: ${rate}% success rate (${total} uses)`;
      });

    if (patternLines.length === 0) {
      return '';
    }

    return `\n## Tool Performance:\n${patternLines.join('\n')}`;
  } catch (error) {
    console.warn('[AgentRunner] Failed to get tool patterns:', error);
    return '';
  }
}

/**
 * Get the full system prompt for an agent with all context.
 */
export async function getAgentSystemPrompt(
  agentId: string,
  userId: string,
  userPrompt: string
): Promise<string | null> {
  const context = await buildAgentContext(agentId, userId, userPrompt);
  if (!context) {
    return null;
  }

  const parts = [
    context.systemPrompt,
    context.toolsDescription,
    context.memoryContext,
    context.conversationHistory,
    context.toolPatterns,
  ].filter(Boolean);

  return parts.join('\n\n');
}

/**
 * Get allowed tool names for an agent.
 */
export async function getAgentToolNames(agentId: string): Promise<string[]> {
  const agent = await getAgent(agentId);
  if (!agent) {
    return [];
  }

  // If no specific tools defined, return all tool names
  if (agent.toolNames.length === 0) {
    return registry.list().map((t: Tool) => t.name);
  }

  return agent.toolNames;
}

/**
 * Validate that a tool is allowed for an agent.
 */
export async function isToolAllowedForAgent(
  agentId: string,
  toolName: string
): Promise<boolean> {
  const allowedTools = await getAgentToolNames(agentId);
  return allowedTools.length === 0 || allowedTools.includes(toolName);
}
