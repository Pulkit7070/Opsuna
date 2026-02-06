import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

export interface MemoryRecord {
  id: string;
  userId: string;
  type: string;
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  similarity?: number;
}

export interface ConversationMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  executionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ToolPattern {
  toolName: string;
  successCount: number;
  failureCount: number;
  avgDuration?: number;
  lastUsed?: string;
  commonErrors?: string[];
  successRate: number;
}

export interface MemoryContext {
  patternContext: string;
  relevantMemories: string;
  hasContext: boolean;
}

export function useMemory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMemory = useCallback(async (
    query: string,
    options?: { type?: string; limit?: number }
  ): Promise<MemoryRecord[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query });
      if (options?.type) params.set('type', options.type);
      if (options?.limit) params.set('limit', String(options.limit));

      const result = await apiClient<MemoryRecord[]>(`/api/memory/search?${params}`);

      if (!result.success) {
        throw new Error(result.error?.message || 'Search failed');
      }

      return result.data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search memories';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (
    options?: { limit?: number; executionId?: string }
  ): Promise<ConversationMessage[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.executionId) params.set('executionId', options.executionId);

      const result = await apiClient<ConversationMessage[]>(`/api/memory/history?${params}`);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get history');
      }

      return result.data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get conversation history';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPatterns = useCallback(async (toolNames?: string[]): Promise<ToolPattern[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (toolNames?.length) params.set('tools', toolNames.join(','));

      const result = await apiClient<ToolPattern[]>(`/api/memory/patterns?${params}`);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get patterns');
      }

      return result.data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get tool patterns';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getContext = useCallback(async (query?: string): Promise<MemoryContext | null> => {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);

      const result = await apiClient<MemoryContext>(`/api/memory/context?${params}`);

      if (!result.success) {
        return null;
      }

      return result.data || null;
    } catch {
      return null;
    }
  }, []);

  const getRecentMemories = useCallback(async (
    options?: { type?: string; limit?: number }
  ): Promise<MemoryRecord[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.type) params.set('type', options.type);
      if (options?.limit) params.set('limit', String(options.limit));

      const result = await apiClient<MemoryRecord[]>(`/api/memory/recent?${params}`);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get recent memories');
      }

      return result.data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get recent memories';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async (): Promise<boolean> => {
    try {
      const result = await apiClient('/api/memory/history/clear', {
        method: 'DELETE',
      });
      return result.success;
    } catch {
      return false;
    }
  }, []);

  return {
    loading,
    error,
    searchMemory,
    getHistory,
    getPatterns,
    getContext,
    getRecentMemories,
    clearHistory,
  };
}
