'use client';

import { useState, useCallback } from 'react';

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

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data: ApiResponse<T> = await response.json();

      if (!data.success && data.error) {
        setError(data.error.message);
      }

      return data;
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

// Typed API functions
export async function executePrompt(prompt: string) {
  const response = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  return response.json();
}

export async function confirmExecution(
  executionId: string,
  confirmed: boolean,
  confirmPhrase?: string
) {
  const response = await fetch(`/api/confirm/${executionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmed, confirmPhrase }),
  });
  return response.json();
}

export async function getExecution(executionId: string) {
  const response = await fetch(`/api/executions/${executionId}`);
  return response.json();
}

export async function getExecutions(page = 1, pageSize = 20) {
  const response = await fetch(`/api/executions?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

export async function rollbackExecution(executionId: string, reason?: string) {
  const response = await fetch(`/api/rollback/${executionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  return response.json();
}
