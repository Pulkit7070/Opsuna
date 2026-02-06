import { ExecutionPlan } from '@opsuna/shared';
import { getGeminiClient, generatePlan } from './gemini';
import { buildPrompt, buildPromptWithMemory, buildAgentPrompt } from './prompts';
import { parseAIResponse } from './parser';
import { generateMockPlan } from './mock';

export interface GeneratePlanOptions {
  userId?: string;
  useMemory?: boolean;
  agentId?: string;
}

export async function generateExecutionPlan(
  prompt: string,
  options: GeneratePlanOptions = {}
): Promise<ExecutionPlan> {
  const { userId, useMemory = true, agentId } = options;
  const client = getGeminiClient();

  // Use mock if no Gemini API key configured
  if (!client) {
    console.log('[Orchestrator] Using mock plan generator');
    return generateMockPlan(prompt);
  }

  try {
    // Build prompt based on context
    let systemPrompt: string;

    if (agentId && userId) {
      // Use agent-specific prompt with scoped tools and memory
      console.log(`[Orchestrator] Building prompt for agent: ${agentId}`);
      const agentPrompt = await buildAgentPrompt(agentId, userId, prompt);
      if (agentPrompt) {
        systemPrompt = agentPrompt;
      } else {
        console.warn('[Orchestrator] Agent not found, falling back to default prompt');
        systemPrompt = userId && useMemory
          ? await buildPromptWithMemory(prompt, userId)
          : buildPrompt(prompt);
      }
    } else if (userId && useMemory) {
      // Use memory-enhanced prompt
      console.log('[Orchestrator] Building prompt with memory context');
      systemPrompt = await buildPromptWithMemory(prompt, userId);
    } else {
      // Use basic prompt
      systemPrompt = buildPrompt(prompt);
    }

    const response = await generatePlan(prompt, systemPrompt);
    return parseAIResponse(response);
  } catch (error) {
    console.error('[Orchestrator] AI generation failed, falling back to mock:', error);
    return generateMockPlan(prompt);
  }
}
