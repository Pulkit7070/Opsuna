import { Tool } from '@opsuna/shared';
import { registry } from '../tools/registry';
import { searchMemory } from '../memory/store';
import { getRecentContext } from '../memory/conversation';
import { getPatternContext } from '../memory/patterns';
import { buildAgentContext } from '../agents/runner';
import { getAgent } from '../agents/registry';

/**
 * Build a dynamic tool description string from the registry.
 */
export function buildToolsDescription(tools?: Tool[]): string {
  const allTools = tools || registry.list();

  if (allTools.length === 0) {
    return 'No tools are currently available.';
  }

  return allTools.map((tool, i) => {
    const params = tool.parameters.map(p => {
      const req = p.required ? '' : '?';
      const enumStr = p.enum ? ` (one of: ${p.enum.join(', ')})` : '';
      return `     ${p.name}${req}: ${p.type} - ${p.description}${enumStr}`;
    }).join('\n');

    const source = tool.source === 'composio' ? ' [Composio]' : '';

    return `${i + 1}. ${tool.name}${source} - ${tool.description}
   - Risk: ${tool.riskLevel}
   - Parameters:\n${params}`;
  }).join('\n\n');
}

const BASE_SYSTEM_PROMPT = `You are an AI assistant that helps users automate tasks safely. Your job is to analyze user requests and create execution plans using available tools.

AVAILABLE TOOLS:
{TOOLS_DESCRIPTION}

RISK LEVELS:
- LOW: Safe operations with no side effects
- MEDIUM: Creates resources but doesn't modify existing ones
- HIGH: Modifies infrastructure or has irreversible effects

RESPONSE FORMAT:
You MUST respond with a valid JSON object in this exact format:
{
  "summary": "Brief description of what the plan will do",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskReason": "Explanation of why this risk level was assigned",
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "toolName": "tool_name",
      "description": "What this step does",
      "parameters": { ... },
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "rollbackSteps": [
    {
      "id": "rollback-1",
      "order": 1,
      "toolName": "tool_name",
      "description": "How to undo this step",
      "parameters": { ... },
      "triggeredByStepId": "step-1"
    }
  ]
}

RULES:
1. The overall risk level should be the highest risk of any individual step
2. Include rollback steps for HIGH risk operations when possible
3. Order steps logically - tests before notifications, deployments before PR updates
4. Be conservative with risk assessment - when in doubt, choose higher risk
5. ONLY use tools from the available list
6. ALWAYS respond with valid JSON only, no other text
7. PREFER tools marked with [Composio] over local tools when available - they execute real API calls to connected services like GitHub, Slack, etc.`;

export function getSystemPrompt(tools?: Tool[]): string {
  const toolsDescription = buildToolsDescription(tools);
  return BASE_SYSTEM_PROMPT.replace('{TOOLS_DESCRIPTION}', toolsDescription);
}

export const ERROR_PROMPT = `The user's request could not be processed. Respond with this JSON:
{
  "error": true,
  "message": "Description of why the request failed",
  "suggestion": "How the user can fix their request"
}`;

export function buildPrompt(userPrompt: string, tools?: Tool[]): string {
  // Note: userPrompt is included here for backwards compat but
  // the actual user message is passed separately to Gemini
  return `${getSystemPrompt(tools)}\n\nRespond with the execution plan JSON for the user's request.`;
}

/**
 * Build a memory-enhanced prompt with user context.
 * Injects relevant memories, conversation history, and tool patterns.
 */
export async function buildPromptWithMemory(
  userPrompt: string,
  userId: string,
  tools?: Tool[]
): Promise<string> {
  const parts: string[] = [getSystemPrompt(tools)];

  // Add memory context section (uses userPrompt for semantic search)
  const memoryContext = await buildMemoryContext(userId, userPrompt);
  if (memoryContext) {
    parts.push('\nCONTEXT FROM MEMORY:');
    parts.push(memoryContext);
  }

  // User request is passed separately to Gemini, not included in system prompt
  parts.push('\nRespond with the execution plan JSON for the user\'s request.');

  return parts.join('\n');
}

/**
 * Build memory context for prompt injection.
 */
export async function buildMemoryContext(
  userId: string,
  query: string
): Promise<string | null> {
  const contextParts: string[] = [];

  try {
    // Get recent conversation context (last 5 messages)
    const conversationContext = await getRecentContext(userId, 5);
    if (conversationContext) {
      contextParts.push('Recent conversation:');
      contextParts.push(conversationContext);
    }

    // Get tool usage patterns
    const patternContext = await getPatternContext(userId);
    if (patternContext) {
      contextParts.push('');
      contextParts.push(patternContext);
    }

    // Search for relevant past memories
    const relevantMemories = await searchMemory(userId, query, {
      type: 'execution',
      limit: 3,
      minSimilarity: 0.6,
    });

    if (relevantMemories.length > 0) {
      contextParts.push('');
      contextParts.push('Relevant past executions:');
      for (const memory of relevantMemories) {
        const summary = memory.content.length > 300
          ? memory.content.slice(0, 300) + '...'
          : memory.content;
        const similarity = memory.similarity
          ? ` (${(memory.similarity * 100).toFixed(0)}% relevant)`
          : '';
        contextParts.push(`- ${summary}${similarity}`);
      }
    }

    if (contextParts.length === 0) {
      return null;
    }

    return contextParts.join('\n');
  } catch (error) {
    console.warn('[Prompts] Failed to build memory context:', error);
    return null;
  }
}

/**
 * Get memory context preview (for frontend display).
 */
export async function getMemoryContextPreview(
  userId: string,
  query: string
): Promise<{
  hasContext: boolean;
  conversationCount: number;
  relevantMemoryCount: number;
  patternSummary: string | null;
}> {
  try {
    const conversationContext = await getRecentContext(userId, 5);
    const patternContext = await getPatternContext(userId);
    const relevantMemories = await searchMemory(userId, query, {
      type: 'execution',
      limit: 3,
      minSimilarity: 0.6,
    });

    const conversationCount = conversationContext
      ? conversationContext.split('\n\n').filter((s) => s.trim()).length
      : 0;

    return {
      hasContext: !!(conversationContext || patternContext || relevantMemories.length > 0),
      conversationCount,
      relevantMemoryCount: relevantMemories.length,
      patternSummary: patternContext
        ? patternContext.split('\n').slice(0, 3).join('\n')
        : null,
    };
  } catch (error) {
    console.warn('[Prompts] Failed to get memory preview:', error);
    return {
      hasContext: false,
      conversationCount: 0,
      relevantMemoryCount: 0,
      patternSummary: null,
    };
  }
}

// Backward compat
export const SYSTEM_PROMPT = getSystemPrompt();

/**
 * Build a prompt for an agent with scoped tools and memory.
 */
export async function buildAgentPrompt(
  agentId: string,
  userId: string,
  userPrompt: string
): Promise<string | null> {
  try {
    const agent = await getAgent(agentId);
    if (!agent) {
      return null;
    }

    const context = await buildAgentContext(agentId, userId, userPrompt);
    if (!context) {
      return null;
    }

    const parts: string[] = [];

    // Agent identity and system prompt
    parts.push(`You are the "${agent.name}" agent.`);
    parts.push(context.systemPrompt);

    // Response format instructions (same as base)
    parts.push(`
RESPONSE FORMAT:
You MUST respond with a valid JSON object in this exact format:
{
  "summary": "Brief description of what the plan will do",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskReason": "Explanation of why this risk level was assigned",
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "toolName": "tool_name",
      "description": "What this step does",
      "parameters": { ... },
      "riskLevel": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "rollbackSteps": [
    {
      "id": "rollback-1",
      "order": 1,
      "toolName": "tool_name",
      "description": "How to undo this step",
      "parameters": { ... },
      "triggeredByStepId": "step-1"
    }
  ]
}

RULES:
1. The overall risk level should be the highest risk of any individual step
2. Include rollback steps for HIGH risk operations when possible
3. Order steps logically
4. Be conservative with risk assessment
5. ONLY use tools from your allowed list
6. ALWAYS respond with valid JSON only
7. PREFER tools marked with [Composio] over local tools when available - they execute real API calls`);

    // Add scoped tools
    parts.push('\n' + context.toolsDescription);

    // Add memory context if available
    if (context.memoryContext) {
      parts.push('\n' + context.memoryContext);
    }

    // Add conversation history if available
    if (context.conversationHistory) {
      parts.push('\n' + context.conversationHistory);
    }

    // Add tool patterns if available
    if (context.toolPatterns) {
      parts.push('\n' + context.toolPatterns);
    }

    // User request is passed separately to Gemini as the user message
    // Just add the instruction to respond
    parts.push('\nAnalyze the user\'s request and respond with the execution plan JSON. Select tools based on the TOOL SELECTION GUIDE above.');

    return parts.join('\n');
  } catch (error) {
    console.error('[Prompts] Failed to build agent prompt:', error);
    return null;
  }
}
