import { ExecutionPlan } from '@opsuna/shared';
import { getGeminiClient, generatePlan } from './gemini';
import { buildPrompt, buildPromptWithMemory } from './prompts';
import { parseAIResponse } from './parser';
import { generateMockPlan } from './mock';

export interface GeneratePlanOptions {
  userId?: string;
  useMemory?: boolean;
}

export async function generateExecutionPlan(
  prompt: string,
  options: GeneratePlanOptions = {}
): Promise<ExecutionPlan> {
  const { userId, useMemory = true } = options;
  const client = getGeminiClient();

  // Use mock if no Gemini API key configured
  if (!client) {
    console.log('[Orchestrator] Using mock plan generator');
    return generateMockPlan(prompt);
  }

  try {
    // Build prompt with or without memory context
    let systemPrompt: string;
    if (userId && useMemory) {
      console.log('[Orchestrator] Building prompt with memory context');
      systemPrompt = await buildPromptWithMemory(prompt, userId);
    } else {
      systemPrompt = buildPrompt(prompt);
    }

    const response = await generatePlan(prompt, systemPrompt);
    return parseAIResponse(response);
  } catch (error) {
    console.error('[Orchestrator] AI generation failed, falling back to mock:', error);
    return generateMockPlan(prompt);
  }
}
