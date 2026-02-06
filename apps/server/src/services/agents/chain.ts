/**
 * Agent chaining - Execute agents in sequence, passing outputs between them
 */

import { AgentChain, AgentChainStep } from './types';
import { getAgent } from './registry';

export interface ChainExecutionResult {
  stepResults: Array<{
    agentId: string;
    agentName: string;
    output: string;
    success: boolean;
    error?: string;
  }>;
  finalOutput: string;
  success: boolean;
}

export interface ChainContext {
  [key: string]: string;
}

/**
 * Validate a chain definition.
 */
export async function validateChain(chain: AgentChain): Promise<string[]> {
  const errors: string[] = [];

  if (!chain.name || chain.name.trim() === '') {
    errors.push('Chain name is required');
  }

  if (!chain.steps || chain.steps.length === 0) {
    errors.push('Chain must have at least one step');
  }

  // Validate each step
  for (let i = 0; i < chain.steps.length; i++) {
    const step = chain.steps[i];

    if (!step.agentId) {
      errors.push(`Step ${i + 1}: Agent ID is required`);
      continue;
    }

    const agent = await getAgent(step.agentId);
    if (!agent) {
      errors.push(`Step ${i + 1}: Agent not found (${step.agentId})`);
    }

    if (!step.promptTemplate) {
      errors.push(`Step ${i + 1}: Prompt template is required`);
    }

    if (!step.outputKey) {
      errors.push(`Step ${i + 1}: Output key is required`);
    }

    // Check for duplicate output keys
    const outputKeys = chain.steps.slice(0, i).map((s) => s.outputKey);
    if (outputKeys.includes(step.outputKey)) {
      errors.push(`Step ${i + 1}: Duplicate output key "${step.outputKey}"`);
    }
  }

  return errors;
}

/**
 * Resolve prompt template with context variables.
 */
export function resolvePromptTemplate(
  template: string,
  context: ChainContext
): string {
  let resolved = template;

  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{{${key}}}`;
    resolved = resolved.split(placeholder).join(value);
  }

  // Check for unresolved placeholders
  const unresolvedMatch = resolved.match(/\{\{(\w+)\}\}/);
  if (unresolvedMatch) {
    console.warn(`[Chain] Unresolved placeholder: ${unresolvedMatch[0]}`);
  }

  return resolved;
}

/**
 * Example chain definitions for demonstration.
 */
export const exampleChains: AgentChain[] = [
  {
    id: 'research-and-analyze',
    name: 'Research & Analyze',
    description: 'Research a topic and then analyze the findings',
    steps: [
      {
        agentId: '', // Will be filled with Deep Research agent ID
        promptTemplate: 'Research the following topic comprehensively: {{topic}}',
        outputKey: 'research',
      },
      {
        agentId: '', // Will be filled with Data Analyst agent ID
        promptTemplate: 'Analyze the following research findings and extract key metrics and trends:\n\n{{research}}',
        outputKey: 'analysis',
      },
    ],
  },
  {
    id: 'research-and-deploy',
    name: 'Research Best Practices & Deploy',
    description: 'Research deployment best practices and execute deployment',
    steps: [
      {
        agentId: '', // Will be filled with Deep Research agent ID
        promptTemplate: 'Research current best practices for: {{task}}',
        outputKey: 'bestPractices',
      },
      {
        agentId: '', // Will be filled with DevOps agent ID
        promptTemplate: 'Following these best practices:\n{{bestPractices}}\n\nExecute: {{task}}',
        outputKey: 'deploymentResult',
      },
    ],
  },
];

/**
 * Get a chain by ID.
 */
export function getChainById(id: string): AgentChain | undefined {
  return exampleChains.find((c) => c.id === id);
}

/**
 * Get all available chains.
 */
export function getAllChains(): AgentChain[] {
  return exampleChains;
}
