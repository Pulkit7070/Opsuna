'use client';

import { useCallback } from 'react';
import { useExecutionStore } from '@/store/execution';
import { useUIStore } from '@/store/ui';
import { executePrompt, confirmExecution } from './useApi';
import { useWebSocket } from './useWebSocket';
import { useAgentsStore } from '@/store/agents';

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
    intentToken,
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
  const { selectedAgent } = useAgentsStore();

  const submitPrompt = useCallback(async () => {
    if (!prompt.trim()) {
      addToast({ type: 'error', title: 'Prompt is required' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await executePrompt(prompt, selectedAgent?.id) as { success: boolean; data?: { executionId: string; plan: import('@opsuna/shared').ExecutionPlan; intentToken?: string }; error?: { message: string } };

      if (response.success && response.data) {
        const { executionId, plan, intentToken: token } = response.data;
        startExecution(executionId, plan, token);
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
  }, [prompt, selectedAgent, setIsLoading, setError, startExecution, subscribe, addToast]);

  const confirm = useCallback(async (confirmPhrase?: string) => {
    if (!currentExecutionId || !intentToken) {
      addToast({ type: 'error', title: 'Missing intent token', message: 'Please regenerate the plan' });
      return;
    }

    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      const response = await confirmExecution(currentExecutionId, true, intentToken, confirmPhrase);

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
  }, [currentExecutionId, intentToken, setIsLoading, setShowConfirmDialog, updateStatus, setError, addToast]);

  const cancel = useCallback(async () => {
    if (!currentExecutionId || !intentToken) return;

    setShowConfirmDialog(false);

    try {
      const response = await confirmExecution(currentExecutionId, false, intentToken);

      if (response.success) {
        updateStatus('cancelled');
        unsubscribe(currentExecutionId);
        addToast({ type: 'info', title: 'Execution cancelled' });
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  }, [currentExecutionId, intentToken, setShowConfirmDialog, updateStatus, unsubscribe, addToast]);

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
