'use client';

import { useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useToolsStore, ToolItem, ComposioConnection } from '@/store/tools';

export function useTools() {
  const {
    tools,
    connections,
    isLoading,
    error,
    filter,
    setTools,
    setConnections,
    setLoading,
    setError,
    setFilter,
    isAppConnected,
  } = useToolsStore();

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (filter.category) params.category = filter.category;
      if (filter.source) params.source = filter.source;
      if (filter.search) params.search = filter.search;

      const res = await apiClient<ToolItem[]>('/api/tools', { params });
      if (res.success && res.data) {
        setTools(res.data);
      } else {
        setError(res.error?.message || 'Failed to load tools');
      }
    } catch {
      setError('Failed to load tools');
    } finally {
      setLoading(false);
    }
  }, [filter, setTools, setLoading, setError]);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await apiClient<ComposioConnection[]>('/api/tools/composio/connections');
      if (res.success && res.data) {
        setConnections(res.data);
      }
    } catch {
      // Non-critical, don't show error
    }
  }, [setConnections]);

  const connectApp = useCallback(async (appName: string): Promise<string | null> => {
    try {
      const res = await apiClient<{ redirectUrl: string; connectionId: string }>(
        '/api/tools/composio/connect',
        {
          method: 'POST',
          body: JSON.stringify({ appName }),
        }
      );

      if (res.success && res.data?.redirectUrl) {
        return res.data.redirectUrl;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const disconnectApp = useCallback(async (appName: string) => {
    try {
      await apiClient(`/api/tools/composio/connections/${appName}`, {
        method: 'DELETE',
      });
      await fetchConnections();
    } catch {
      // Ignore
    }
  }, [fetchConnections]);

  const checkConnection = useCallback(async (appName: string) => {
    try {
      const res = await apiClient<ComposioConnection>(
        `/api/tools/composio/connections/${appName}/check`,
        { method: 'POST' }
      );
      if (res.success) {
        await fetchConnections();
      }
      return res.data;
    } catch {
      return null;
    }
  }, [fetchConnections]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Filter tools client-side for display
  const filteredTools = tools.filter((t) => {
    if (filter.category && t.category !== filter.category) return false;
    if (filter.source && t.source !== filter.source) return false;
    return true;
  });

  return {
    tools: filteredTools,
    allTools: tools,
    connections,
    isLoading,
    error,
    filter,
    setFilter,
    fetchTools,
    fetchConnections,
    connectApp,
    disconnectApp,
    checkConnection,
    isAppConnected,
  };
}
