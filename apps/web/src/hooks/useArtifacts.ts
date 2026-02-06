import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

export interface Artifact {
  id: string;
  executionId: string;
  type: string;
  name: string;
  mimeType: string;
  size: number;
  storagePath: string;
  publicUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ReplayEvent {
  id: string;
  timestamp: string;
  type: string;
  details: Record<string, unknown> | null;
}

export interface ReplayStep {
  id: string;
  toolName: string;
  description: string;
}

export interface ReplayData {
  execution: {
    id: string;
    status: string;
    prompt: string;
    createdAt: string;
    completedAt: string | null;
  };
  plan: {
    summary: string;
    riskLevel: string;
    steps: ReplayStep[];
  };
  results: Array<{
    stepId: string;
    toolName: string;
    status: string;
    result?: unknown;
    error?: string;
  }>;
  events: ReplayEvent[];
  artifacts: Artifact[];
}

export interface SharedReport {
  id: string;
  token: string;
  expiresAt: string | null;
  viewCount: number;
  shareUrl: string;
}

export function useArtifacts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getArtifacts = useCallback(async (executionId: string): Promise<Artifact[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient<Artifact[]>(`/api/executions/${executionId}/artifacts`);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get artifacts');
      }

      return result.data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get artifacts';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getReplayData = useCallback(async (executionId: string): Promise<ReplayData | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient<ReplayData>(`/api/executions/${executionId}/replay`);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to get replay data');
      }

      return result.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get replay data';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (executionId: string): Promise<Artifact | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient<Artifact>(`/api/executions/${executionId}/report`, {
        method: 'POST',
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate report');
      }

      return result.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createShareLink = useCallback(async (
    executionId: string,
    expiresInHours?: number
  ): Promise<SharedReport | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient<SharedReport>(`/api/executions/${executionId}/share`, {
        method: 'POST',
        body: JSON.stringify({ expiresInHours }),
      });

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create share link');
      }

      return result.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create share link';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSharedReport = useCallback(async (token: string): Promise<ReplayData | null> => {
    try {
      const result = await apiClient<ReplayData>(`/api/shared/${token}`);

      if (!result.success) {
        return null;
      }

      return result.data || null;
    } catch {
      return null;
    }
  }, []);

  const downloadArtifact = useCallback(async (artifactId: string): Promise<Blob | null> => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/artifacts/${artifactId}/download`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return await response.blob();
    } catch {
      return null;
    }
  }, []);

  const deleteArtifact = useCallback(async (artifactId: string): Promise<boolean> => {
    try {
      const result = await apiClient(`/api/artifacts/${artifactId}`, {
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
    getArtifacts,
    getReplayData,
    generateReport,
    createShareLink,
    getSharedReport,
    downloadArtifact,
    deleteArtifact,
  };
}
