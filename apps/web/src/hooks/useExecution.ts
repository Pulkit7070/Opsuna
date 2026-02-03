'use client';

import { useCallback } from 'react';
import { useExecutionStore } from '@/store/execution';
import { useUIStore } from '@/store/ui';
import { executePrompt, confirmExecution } from './useApi';
import { useWebSocket } from './useWebSocket';

export function useExecution() {
  const {
    currentExecutionId,
    prompt,
    status,
    plan,
    results,
    error,
    progress,
    isLoading,
    showConfirmDialog,
    setPrompt,
    startExecution,
    updateStatus,
    setError,
    setShowConfirmDialog,
    setIsLoading,
    reset,
  } = useExecutionStore();

  const { addToast } = useUIStore();
  const { subscribe, unsubscribe } = useWebSocket();

  const submitPrompt = useCallback(async () => {
    if (!prompt.trim()) {
      addToast({ type: 'error', title: 'Prompt is required' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await executePrompt(prompt);

      if (response.success) {
        const { executionId, plan } = response.data;
        startExecution(executionId, plan);
        subscribe(executionId);
        addToast({ type: 'info', title: 'Plan generated', message: 'Review and confirm to execute' });
      } else {
        setError(response.error?.message || 'Failed to generate plan');
        addToast({ type: 'error', title: 'Error', message: response.error?.message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit prompt';
      setError(message);
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, setIsLoading, setError, startExecution, subscribe, addToast]);

  const confirm = useCallback(async (confirmPhrase?: string) => {
    if (!currentExecutionId) return;

    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      const response = await confirmExecution(currentExecutionId, true, confirmPhrase);

      if (response.success) {
        updateStatus('executing');
        addToast({ type: 'info', title: 'Execution started' });
      } else {
        setError(response.error?.message || 'Failed to confirm execution');
        addToast({ type: 'error', title: 'Confirmation failed', message: response.error?.message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to confirm';
      setError(message);
      addToast({ type: 'error', title: 'Error', message });
    } finally {
      setIsLoading(false);
    }
  }, [currentExecutionId, setIsLoading, setShowConfirmDialog, updateStatus, setError, addToast]);

  const cancel = useCallback(async () => {
    if (!currentExecutionId) return;

    setShowConfirmDialog(false);

    try {
      const response = await confirmExecution(currentExecutionId, false);

      if (response.success) {
        updateStatus('cancelled');
        unsubscribe(currentExecutionId);
        addToast({ type: 'info', title: 'Execution cancelled' });
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  }, [currentExecutionId, setShowConfirmDialog, updateStatus, unsubscribe, addToast]);

  const resetExecution = useCallback(() => {
    if (currentExecutionId) {
      unsubscribe(currentExecutionId);
    }
    reset();
  }, [currentExecutionId, unsubscribe, reset]);

  return {
    // State
    executionId: currentExecutionId,
    prompt,
    status,
    plan,
    results,
    error,
    progress,
    isLoading,
    showConfirmDialog,

    // Actions
    setPrompt,
    submitPrompt,
    confirm,
    cancel,
    reset: resetExecution,
  };
}
