import { prisma } from '../../lib/prisma';
import { generateEmbedding, toPgVector } from './embeddings';

export type MemoryType = 'execution' | 'tool_result' | 'conversation' | 'pattern';

export interface MemoryInput {
  userId: string;
  type: MemoryType;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryRecord {
  id: string;
  userId: string;
  type: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  similarity?: number;
}

/**
 * Store a memory with its embedding vector.
 */
export async function storeMemory(input: MemoryInput): Promise<MemoryRecord | null> {
  const { userId, type, content, metadata } = input;

  // Generate embedding for the content
  const embedding = await generateEmbedding(content);

  if (embedding) {
    // Use raw SQL to insert with vector
    const vectorStr = toPgVector(embedding);

    const result = await prisma.$queryRaw<MemoryRecord[]>`
      INSERT INTO "Memory" (id, "userId", type, content, embedding, metadata, "createdAt")
      VALUES (
        gen_random_uuid(),
        ${userId},
        ${type},
        ${content},
        ${vectorStr}::vector,
        ${metadata ? JSON.stringify(metadata) : null}::jsonb,
        NOW()
      )
      RETURNING id, "userId", type, content, metadata, "createdAt"
    `;

    return result[0] || null;
  } else {
    // Store without embedding (fallback for dev mode)
    const result = await prisma.$queryRaw<MemoryRecord[]>`
      INSERT INTO "Memory" (id, "userId", type, content, metadata, "createdAt")
      VALUES (
        gen_random_uuid(),
        ${userId},
        ${type},
        ${content},
        ${metadata ? JSON.stringify(metadata) : null}::jsonb,
        NOW()
      )
      RETURNING id, "userId", type, content, metadata, "createdAt"
    `;

    return result[0] || null;
  }
}

/**
 * Search memories using semantic similarity (cosine distance).
 * Returns the most similar memories to the query.
 */
export async function searchMemory(
  userId: string,
  query: string,
  options: {
    type?: MemoryType;
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<MemoryRecord[]> {
  const { type, limit = 5, minSimilarity = 0.5 } = options;

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  if (!queryEmbedding) {
    console.warn('[Memory] Could not generate query embedding, falling back to text search');
    return searchMemoryByText(userId, query, { type, limit });
  }

  const vectorStr = toPgVector(queryEmbedding);

  // Cosine similarity search using pgvector
  // 1 - cosine_distance gives similarity (1 = identical, 0 = orthogonal)
  if (type) {
    const results = await prisma.$queryRaw<MemoryRecord[]>`
      SELECT
        id,
        "userId",
        type,
        content,
        metadata,
        "createdAt",
        1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM "Memory"
      WHERE "userId" = ${userId}
        AND type = ${type}
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> ${vectorStr}::vector) >= ${minSimilarity}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;
    return results;
  } else {
    const results = await prisma.$queryRaw<MemoryRecord[]>`
      SELECT
        id,
        "userId",
        type,
        content,
        metadata,
        "createdAt",
        1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM "Memory"
      WHERE "userId" = ${userId}
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> ${vectorStr}::vector) >= ${minSimilarity}
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;
    return results;
  }
}

/**
 * Fallback text search when embeddings are not available.
 */
async function searchMemoryByText(
  userId: string,
  query: string,
  options: { type?: MemoryType; limit?: number } = {}
): Promise<MemoryRecord[]> {
  const { type, limit = 5 } = options;
  const searchPattern = `%${query}%`;

  // Use separate queries for type-filtered and unfiltered cases
  if (type) {
    const results = await prisma.$queryRaw<MemoryRecord[]>`
      SELECT id, "userId", type, content, metadata, "createdAt"
      FROM "Memory"
      WHERE "userId" = ${userId}
        AND type = ${type}
        AND content ILIKE ${searchPattern}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
    return results;
  } else {
    const results = await prisma.$queryRaw<MemoryRecord[]>`
      SELECT id, "userId", type, content, metadata, "createdAt"
      FROM "Memory"
      WHERE "userId" = ${userId}
        AND content ILIKE ${searchPattern}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
    return results;
  }
}

/**
 * Get recent memories for a user.
 */
export async function getRecentMemories(
  userId: string,
  options: { type?: MemoryType; limit?: number } = {}
): Promise<MemoryRecord[]> {
  const { type, limit = 10 } = options;

  if (type) {
    const results = await prisma.$queryRaw<MemoryRecord[]>`
      SELECT id, "userId", type, content, metadata, "createdAt"
      FROM "Memory"
      WHERE "userId" = ${userId} AND type = ${type}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
    return results;
  } else {
    const results = await prisma.$queryRaw<MemoryRecord[]>`
      SELECT id, "userId", type, content, metadata, "createdAt"
      FROM "Memory"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
    return results;
  }
}

/**
 * Delete a memory by ID.
 */
export async function deleteMemory(id: string, userId: string): Promise<boolean> {
  const result = await prisma.$queryRaw<{ count: number }[]>`
    DELETE FROM "Memory"
    WHERE id = ${id} AND "userId" = ${userId}
    RETURNING 1 as count
  `;

  return result.length > 0;
}

/**
 * Delete all memories of a specific type for a user.
 */
export async function clearMemoriesByType(userId: string, type: MemoryType): Promise<number> {
  const result = await prisma.$queryRaw<{ count: bigint }[]>`
    WITH deleted AS (
      DELETE FROM "Memory"
      WHERE "userId" = ${userId} AND type = ${type}
      RETURNING 1
    )
    SELECT COUNT(*) as count FROM deleted
  `;

  return Number(result[0]?.count || 0);
}
