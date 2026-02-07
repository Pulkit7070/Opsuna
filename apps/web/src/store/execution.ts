import { create } from 'zustand';
import {
  Execution,
  ExecutionPlan,
  ExecutionStatus,
  MCPUIMessage,
  LogEntry,
  ToolCallResult,
  RiskLevel,
} from '@opsuna/shared';

interface ExecutionState {
  // Current execution
  currentExecutionId: string | null;
  prompt: string;
  status: ExecutionStatus | null;
  plan: ExecutionPlan | null;
  results: ToolCallResult[];
  logs: LogEntry[];
  uiMessages: MCPUIMessage[];
  error: string | null;
  progress: { currentStep: number; totalSteps: number } | null;
  intentToken: string | null; // Security token for confirmation

  // UI state
  isLoading: boolean;
  showConfirmDialog: boolean;

  // Actions
  setPrompt: (prompt: string) => void;
  startExecution: (executionId: string, plan: ExecutionPlan, intentToken?: string) => void;
  updateStatus: (status: ExecutionStatus, progress?: { currentStep: number; totalSteps: number }) => void;
  addLog: (log: LogEntry) => void;
  addUIMessage: (message: MCPUIMessage) => void;
  updateStepResult: (stepId: string, result: ToolCallResult) => void;
  setError: (error: string | null) => void;
  setShowConfirmDialog: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentExecutionId: null,
  prompt: '',
  status: null,
  plan: null,
  results: [],
  logs: [],
  uiMessages: [],
  error: null,
  progress: null,
  intentToken: null,
  isLoading: false,
  showConfirmDialog: false,
};

export const useExecutionStore = create<ExecutionState>((set) => ({
  ...initialState,

  setPrompt: (prompt) => set({ prompt }),

  startExecution: (executionId, plan, intentToken) =>
    set({
      currentExecutionId: executionId,
      plan,
      status: 'awaiting_confirmation',
      showConfirmDialog: true,
      logs: [],
      results: [],
      uiMessages: [],
      error: null,
      progress: null,
      intentToken: intentToken || null,
    }),

  updateStatus: (status, progress) =>
    set((state) => ({
      status,
      progress: progress ?? state.progress,
    })),

  addLog: (log) =>
    set((state) => ({
      logs: [...state.logs, log],
    })),

  addUIMessage: (message) =>
    set((state) => ({
      uiMessages: [...state.uiMessages, message],
    })),

  updateStepResult: (stepId, result) =>
    set((state) => {
      const existingIndex = state.results.findIndex((r) => r.stepId === stepId);
      if (existingIndex >= 0) {
        const newResults = [...state.results];
        newResults[existingIndex] = result;
        return { results: newResults };
      }
      return { results: [...state.results, result] };
    }),

  setError: (error) => set({ error }),

  setShowConfirmDialog: (show) => set({ showConfirmDialog: show }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  reset: () => set(initialState),
}));

// Selector hooks
export const useCurrentExecution = () =>
  useExecutionStore((state) => ({
    id: state.currentExecutionId,
    prompt: state.prompt,
    status: state.status,
    plan: state.plan,
    results: state.results,
    error: state.error,
    progress: state.progress,
  }));

export const useLogs = () => useExecutionStore((state) => state.logs);
export const useUIMessages = () => useExecutionStore((state) => state.uiMessages);
export const useIsLoading = () => useExecutionStore((state) => state.isLoading);
export const useShowConfirmDialog = () => useExecutionStore((state) => state.showConfirmDialog);

// Helper to get risk level badge variant
export function getRiskBadgeVariant(risk: RiskLevel): 'default' | 'warning' | 'destructive' {
  switch (risk) {
    case 'LOW':
      return 'default';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
      return 'destructive';
  }
}
