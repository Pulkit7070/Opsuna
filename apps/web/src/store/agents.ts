import { create } from 'zustand';
import { Agent } from '@/hooks/useAgents';

interface AgentsState {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  clearSelection: () => void;
}

export const useAgentsStore = create<AgentsState>((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  clearSelection: () => set({ selectedAgent: null }),
}));
