'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async <T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const { method = 'GET', body, headers = {} } = options;

      const data = await apiClient<T>(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!data.success && data.error) {
        setError(data.error.message);
      }

      return data as ApiResponse<T>;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message },
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { request, isLoading, error, setError };
}

// Typed API functions (use apiClient which auto-injects auth)
export async function executePrompt(prompt: string) {
  return apiClient('/api/execute', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

export async function confirmExecution(
  executionId: string,
  confirmed: boolean,
  confirmPhrase?: string
) {
  return apiClient(`/api/confirm/${executionId}`, {
    method: 'POST',
    body: JSON.stringify({ confirmed, confirmPhrase }),
  });
}

export async function getExecution(executionId: string) {
  return apiClient(`/api/executions/${executionId}`);
}

export async function getExecutions(page = 1, pageSize = 20) {
  return apiClient(`/api/executions`, {
    params: { page, pageSize },
  });
}

export async function rollbackExecution(executionId: string, reason?: string) {
  return apiClient(`/api/rollback/${executionId}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
