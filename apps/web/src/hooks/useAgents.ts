import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type MemoryScope = 'shared' | 'isolated' | 'none';

export interface Agent {
  id: string;
  userId: string | null;
  name: string;
  description: string;
  icon?: string;
  systemPrompt: string;
  toolNames: string[];
  memoryScope: MemoryScope;
  isBuiltin: boolean;
  isPublic: boolean;
  config?: {
    maxTokens?: number;
    temperature?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentCreateInput {
  name: string;
  description: string;
  icon?: string;
  systemPrompt: string;
  toolNames: string[];
  memoryScope?: MemoryScope;
  isPublic?: boolean;
}

export interface AgentUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  systemPrompt?: string;
  toolNames?: string[];
  memoryScope?: MemoryScope;
  isPublic?: boolean;
}

export function useAgents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [builtinAgents, setBuiltinAgents] = useState<Agent[]>([]);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient<Agent[]>('/api/agents');

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get agents');
      }

      const data = result.data || [];
      setAgents(data);
      setBuiltinAgents(data.filter(a => a.isBuiltin));
      setMyAgents(data.filter(a => !a.isBuiltin && a.userId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get agents';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAgent = useCallback(async (id: string): Promise<Agent | null> => {
    try {
      const result = await apiClient<Agent>(`/api/agents/${id}`);

      if (!result.success) {
        return null;
      }

      return result.data || null;
    } catch {
      return null;
    }
  }, []);

  const createAgent = useCallback(async (input: AgentCreateInput): Promise<Agent | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient<Agent>('/api/agents', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create agent');
      }

      const newAgent = result.data;
      if (newAgent) {
        setAgents(prev => [newAgent, ...prev]);
        setMyAgents(prev => [newAgent, ...prev]);
      }

      return newAgent || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create agent';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAgent = useCallback(async (id: string, input: AgentUpdateInput): Promise<Agent | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient<Agent>(`/api/agents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update agent');
      }

      const updatedAgent = result.data;
      if (updatedAgent) {
        setAgents(prev => prev.map(a => a.id === id ? updatedAgent : a));
        setMyAgents(prev => prev.map(a => a.id === id ? updatedAgent : a));
      }

      return updatedAgent || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update agent';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAgent = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete agent');
      }

      setAgents(prev => prev.filter(a => a.id !== id));
      setMyAgents(prev => prev.filter(a => a.id !== id));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load agents on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    loading,
    error,
    agents,
    builtinAgents,
    myAgents,
    fetchAgents,
    getAgent,
    createAgent,
    updateAgent,
    deleteAgent,
  };
}
