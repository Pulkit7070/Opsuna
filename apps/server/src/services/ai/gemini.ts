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

  // Use system instruction for better prompt following
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2, // Lower temperature for more predictable tool selection
      topK: 20,
      topP: 0.9,
      maxOutputTokens: 4096,
    },
  });

  const response = await result.response;
  return response.text();
}
