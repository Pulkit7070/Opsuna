import { ExecutionPlan } from '@opsuna/shared';
import { getGeminiClient, generatePlan } from './gemini';
import { buildPrompt } from './prompts';
import { parseAIResponse } from './parser';
import { generateMockPlan } from './mock';

export async function generateExecutionPlan(prompt: string): Promise<ExecutionPlan> {
  const client = getGeminiClient();

  // Use mock if no Gemini API key configured
  if (!client) {
    console.log('[Orchestrator] Using mock plan generator');
    return generateMockPlan(prompt);
  }

  try {
    const systemPrompt = buildPrompt(prompt);
    const response = await generatePlan(prompt, systemPrompt);
    return parseAIResponse(response);
  } catch (error) {
    console.error('[Orchestrator] AI generation failed, falling back to mock:', error);
    return generateMockPlan(prompt);
  }
}
