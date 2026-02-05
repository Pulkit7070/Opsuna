import { create } from 'zustand';

export interface ToolItem {
  name: string;
  displayName: string;
  description: string;
  category: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  source: 'local' | 'composio';
  appName?: string;
  logo?: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
}

export interface ComposioConnection {
  id: string;
  appName: string;
  status: string;
}

interface ToolsState {
  tools: ToolItem[];
  connections: ComposioConnection[];
  isLoading: boolean;
  error: string | null;
  filter: { category?: string; source?: string; search?: string };

  setTools: (tools: ToolItem[]) => void;
  setConnections: (connections: ComposioConnection[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<ToolsState['filter']>) => void;
  isAppConnected: (appName: string) => boolean;
}

export const useToolsStore = create<ToolsState>((set, get) => ({
  tools: [],
  connections: [],
  isLoading: false,
  error: null,
  filter: {},

  setTools: (tools) => set({ tools }),
  setConnections: (connections) => set({ connections }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
  isAppConnected: (appName) => {
    return get().connections.some(
      (c) => c.appName === appName.toLowerCase() && c.status === 'active'
    );
  },
}));
