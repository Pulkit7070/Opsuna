import { getGeminiClient } from '../ai/gemini';

const EMBEDDING_MODEL = 'text-embedding-004';
const EMBEDDING_DIMENSIONS = 768;

/**
 * Generate embeddings using Gemini text-embedding-004 model.
 * Returns a 768-dimensional vector for semantic search.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getGeminiClient();

  if (!client) {
    console.warn('[Embeddings] Gemini client not available, skipping embedding');
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });

    // Use the simpler string-based API
    const result = await model.embedContent(text);

    const embedding = result.embedding.values;

    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      console.warn(
        `[Embeddings] Unexpected dimension: ${embedding.length}, expected ${EMBEDDING_DIMENSIONS}`
      );
    }

    return embedding;
  } catch (error) {
    console.error('[Embeddings] Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Generate embeddings for multiple texts in batch.
 * More efficient than calling generateEmbedding multiple times.
 */
export async function generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
  const client = getGeminiClient();

  if (!client) {
    console.warn('[Embeddings] Gemini client not available, skipping embeddings');
    return texts.map(() => null);
  }

  try {
    const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });

    const results = await Promise.all(
      texts.map(async (text) => {
        try {
          // Use the simpler string-based API
          const result = await model.embedContent(text);
          return result.embedding.values;
        } catch {
          return null;
        }
      })
    );

    return results;
  } catch (error) {
    console.error('[Embeddings] Failed to generate batch embeddings:', error);
    return texts.map(() => null);
  }
}

/**
 * Convert embedding array to pgvector format string.
 * e.g., [1, 2, 3] => '[1,2,3]'
 */
export function toPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Get the expected embedding dimension.
 */
export function getEmbeddingDimension(): number {
  return EMBEDDING_DIMENSIONS;
}
