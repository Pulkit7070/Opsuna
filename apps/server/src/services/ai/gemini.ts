import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../lib/config';

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!config.geminiApiKey) {
    console.warn('[Gemini] No API key configured, using mock AI');
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }

  return genAI;
}

export async function generatePlan(prompt: string, systemPrompt: string): Promise<string> {
  const client = getGeminiClient();

  if (!client) {
    throw new Error('Gemini client not initialized');
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          { text: `User request: ${prompt}` },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });

  const response = await result.response;
  return response.text();
}
