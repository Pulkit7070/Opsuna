import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BuilderProject {
  id: string;
  name: string;
  description: string;
  files: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  framework: 'react' | 'nextjs' | 'vue';
  styling: 'tailwind' | 'css' | 'styled-components';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeGenerated?: boolean;
  files?: string[];
}

interface BuilderState {
  // Current project
  currentProject: BuilderProject | null;
  files: Record<string, string>;
  activeFile: string | null;

  // Chat
  messages: ChatMessage[];
  isGenerating: boolean;

  // Preview
  previewKey: number;
  previewError: string | null;

  // Saved projects
  savedProjects: BuilderProject[];

  // Settings
  settings: {
    framework: 'react' | 'nextjs' | 'vue';
    styling: 'tailwind' | 'css' | 'styled-components';
    typescript: boolean;
  };

  // Actions
  createProject: (name: string, description?: string) => void;
  loadProject: (project: BuilderProject) => void;
  saveProject: () => void;
  deleteProject: (id: string) => void;

  setActiveFile: (filename: string) => void;
  updateFile: (filename: string, content: string) => void;
  addFile: (filename: string, content: string) => void;
  deleteFile: (filename: string) => void;
  renameFile: (oldName: string, newName: string) => void;

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setGenerating: (generating: boolean) => void;

  setGeneratedCode: (files: Record<string, string>) => void;
  refreshPreview: () => void;
  setPreviewError: (error: string | null) => void;

  updateSettings: (settings: Partial<BuilderState['settings']>) => void;
  reset: () => void;
}

const DEFAULT_FILES: Record<string, string> = {
  'App.tsx': `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Opsuna Builder
        </h1>
        <p className="text-slate-400 text-lg">
          Describe what you want to build in the chat
        </p>
      </div>
    </div>
  );
}
`,
  'index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}

body {
  @apply bg-background text-foreground;
}
`
};

const generateId = () => Math.random().toString(36).slice(2, 11);

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      files: { ...DEFAULT_FILES },
      activeFile: 'App.tsx',
      messages: [],
      isGenerating: false,
      previewKey: 0,
      previewError: null,
      savedProjects: [],
      settings: {
        framework: 'react',
        styling: 'tailwind',
        typescript: true,
      },

      createProject: (name, description = '') => {
        const project: BuilderProject = {
          id: generateId(),
          name,
          description,
          files: { ...DEFAULT_FILES },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          framework: get().settings.framework,
          styling: get().settings.styling,
        };

        set({
          currentProject: project,
          files: { ...DEFAULT_FILES },
          activeFile: 'App.tsx',
          messages: [],
          previewKey: get().previewKey + 1,
        });
      },

      loadProject: (project) => {
        set({
          currentProject: project,
          files: { ...project.files },
          activeFile: Object.keys(project.files)[0] || null,
          messages: [],
          previewKey: get().previewKey + 1,
        });
      },

      saveProject: () => {
        const { currentProject, files, savedProjects } = get();
        if (!currentProject) return;

        const updatedProject = {
          ...currentProject,
          files: { ...files },
          updatedAt: new Date().toISOString(),
        };

        const existingIndex = savedProjects.findIndex(p => p.id === currentProject.id);
        const newProjects = existingIndex >= 0
          ? savedProjects.map((p, i) => i === existingIndex ? updatedProject : p)
          : [...savedProjects, updatedProject];

        set({
          currentProject: updatedProject,
          savedProjects: newProjects,
        });
      },

      deleteProject: (id) => {
        const { savedProjects, currentProject } = get();
        set({
          savedProjects: savedProjects.filter(p => p.id !== id),
          ...(currentProject?.id === id ? {
            currentProject: null,
            files: { ...DEFAULT_FILES },
            activeFile: 'App.tsx',
          } : {}),
        });
      },

      setActiveFile: (filename) => set({ activeFile: filename }),

      updateFile: (filename, content) => {
        set(state => ({
          files: { ...state.files, [filename]: content },
          previewKey: state.previewKey + 1,
        }));
      },

      addFile: (filename, content) => {
        set(state => ({
          files: { ...state.files, [filename]: content },
          activeFile: filename,
        }));
      },

      deleteFile: (filename) => {
        const { files, activeFile } = get();
        const newFiles = { ...files };
        delete newFiles[filename];

        const remainingFiles = Object.keys(newFiles);
        set({
          files: newFiles,
          activeFile: activeFile === filename
            ? remainingFiles[0] || null
            : activeFile,
        });
      },

      renameFile: (oldName, newName) => {
        const { files, activeFile } = get();
        const newFiles = { ...files };
        newFiles[newName] = newFiles[oldName];
        delete newFiles[oldName];

        set({
          files: newFiles,
          activeFile: activeFile === oldName ? newName : activeFile,
        });
      },

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          messages: [...state.messages, newMessage],
        }));
      },

      clearMessages: () => set({ messages: [] }),

      setGenerating: (generating) => set({ isGenerating: generating }),

      setGeneratedCode: (newFiles) => {
        set(state => ({
          files: { ...state.files, ...newFiles },
          activeFile: Object.keys(newFiles)[0] || state.activeFile,
          previewKey: state.previewKey + 1,
        }));
      },

      refreshPreview: () => {
        set(state => ({ previewKey: state.previewKey + 1 }));
      },

      setPreviewError: (error) => set({ previewError: error }),

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      reset: () => {
        set({
          currentProject: null,
          files: { ...DEFAULT_FILES },
          activeFile: 'App.tsx',
          messages: [],
          isGenerating: false,
          previewKey: 0,
          previewError: null,
        });
      },
    }),
    {
      name: 'opsuna-builder-storage',
      partialize: (state) => ({
        savedProjects: state.savedProjects,
        settings: state.settings,
      }),
    }
  )
);
