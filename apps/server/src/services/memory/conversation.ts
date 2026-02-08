import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ConversationMessageInput {
  userId: string;
  role: MessageRole;
  content: string;
  executionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationMessageRecord {
  id: string;
  userId: string;
  role: string;
  content: string;
  executionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/**
 * Store a conversation message.
 */
export async function storeMessage(input: ConversationMessageInput): Promise<ConversationMessageRecord> {
  const message = await prisma.conversationMessage.create({
    data: {
      userId: input.userId,
      role: input.role,
      content: input.content,
      executionId: input.executionId,
      metadata: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });

  return message as ConversationMessageRecord;
}

/**
 * Get conversation history for a user.
 * Returns messages in chronological order.
 */
export async function getConversationHistory(
  userId: string,
  options: {
    limit?: number;
    beforeDate?: Date;
    executionId?: string;
  } = {}
): Promise<ConversationMessageRecord[]> {
  const { limit = 20, beforeDate, executionId } = options;

  const where: any = { userId };

  if (beforeDate) {
    where.createdAt = { lt: beforeDate };
  }

  if (executionId) {
    where.executionId = executionId;
  }

  const messages = await prisma.conversationMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  // Return in chronological order (oldest first)
  return (messages as ConversationMessageRecord[]).reverse();
}

/**
 * Get recent conversation context for AI prompt injection.
 * Returns the last N messages formatted for context.
 */
export async function getRecentContext(
  userId: string,
  limit: number = 10
): Promise<string> {
  const messages = await getConversationHistory(userId, { limit });

  if (messages.length === 0) {
    return '';
  }

  const contextLines = messages.map((msg) => {
    const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
    const content = msg.content.length > 500
      ? msg.content.slice(0, 500) + '...'
      : msg.content;
    return `${role}: ${content}`;
  });

  return contextLines.join('\n\n');
}

/**
 * Store a user prompt and AI response pair.
 */
export async function storePromptAndResponse(
  userId: string,
  prompt: string,
  response: string,
  executionId?: string
): Promise<void> {
  await Promise.all([
    storeMessage({
      userId,
      role: 'user',
      content: prompt,
      executionId,
    }),
    storeMessage({
      userId,
      role: 'assistant',
      content: response,
      executionId,
    }),
  ]);
}

/**
 * Get messages related to a specific execution.
 */
export async function getExecutionMessages(
  executionId: string
): Promise<ConversationMessageRecord[]> {
  const messages = await prisma.conversationMessage.findMany({
    where: { executionId },
    orderBy: { createdAt: 'asc' },
  });

  return messages as ConversationMessageRecord[];
}

/**
 * Delete old messages to prevent unbounded growth.
 * Keeps the most recent N messages per user.
 */
export async function pruneOldMessages(
  userId: string,
  keepCount: number = 100
): Promise<number> {
  // Get the cutoff message ID
  const cutoffMessages = await prisma.conversationMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: keepCount,
    take: 1,
    select: { createdAt: true },
  });

  if (cutoffMessages.length === 0) {
    return 0; // Nothing to prune
  }

  const cutoffDate = cutoffMessages[0].createdAt;

  const result = await prisma.conversationMessage.deleteMany({
    where: {
      userId,
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}

/**
 * Clear all conversation history for a user.
 */
export async function clearConversationHistory(userId: string): Promise<number> {
  const result = await prisma.conversationMessage.deleteMany({
    where: { userId },
  });

  return result.count;
}
