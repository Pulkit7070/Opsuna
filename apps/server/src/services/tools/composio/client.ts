import { Composio } from '@composio/core';
import { config } from '../../../lib/config';

let composioClient: Composio | null = null;

export function getComposioClient(): Composio | null {
  if (!config.composioApiKey) {
    return null;
  }

  if (!composioClient) {
    composioClient = new Composio({ apiKey: config.composioApiKey });
    console.log('[Composio] Client initialized');
  }

  return composioClient;
}
