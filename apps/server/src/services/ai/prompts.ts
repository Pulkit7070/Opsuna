import { Tool } from '@opsuna/shared';
import { registry } from '../tools/registry';

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
6. ALWAYS respond with valid JSON only, no other text`;

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
  return `${getSystemPrompt(tools)}\n\nUser request: ${userPrompt}\n\nRespond with the execution plan JSON:`;
}

// Backward compat
export const SYSTEM_PROMPT = getSystemPrompt();
