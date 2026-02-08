'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Eye,
  Download,
  Github,
  Save,
  FolderOpen,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Copy,
  Check,
  Play,
  RefreshCw,
  Layers,
  FileCode,
  Settings,
  Share2
} from 'lucide-react';
import { BuilderChat } from '@/components/builder/BuilderChat';
import { CodePreview } from '@/components/builder/CodePreview';
import { CodeEditor } from '@/components/builder/CodeEditor';
import { FileTree } from '@/components/builder/FileTree';
import { ExportModal } from '@/components/builder/ExportModal';
import { ProjectSidebar } from '@/components/builder/ProjectSidebar';
import { ComponentPalette } from '@/components/builder/ComponentPalette';
import { useBuilderStore } from '@/store/builder';

type ViewMode = 'preview' | 'code' | 'split';

export default function BuilderPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    currentProject,
    files,
    activeFile,
    isGenerating,
    previewKey
  } = useBuilderStore();

  const handleCopyCode = useCallback(() => {
    if (activeFile && files[activeFile]) {
      navigator.clipboard.writeText(files[activeFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [activeFile, files]);

  const handleRefreshPreview = useCallback(() => {
    useBuilderStore.getState().refreshPreview();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Opsuna Builder</h1>
              <p className="text-[10px] text-zinc-500">AI-Powered UI Generator</p>
            </div>
          </div>

          {currentProject && (
            <div className="ml-4 px-3 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">
              {currentProject.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'preview' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Preview Only"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'split' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Split View"
            >
              <Layers size={16} />
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'code' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Code Only"
            >
              <Code2 size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-zinc-700" />

          {/* Action Buttons */}
          <button
            onClick={handleCopyCode}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Copy Code"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>

          <button
            onClick={handleRefreshPreview}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Refresh Preview"
          >
            <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setShowPalette(true)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Component Library"
          >
            <FileCode size={18} />
          </button>

          <div className="w-px h-6 bg-zinc-700" />

          <button
            onClick={() => useBuilderStore.getState().saveProject()}
            className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <Save size={16} />
            <span className="text-sm">Save</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg transition-colors font-medium text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-zinc-800 bg-zinc-900/30 overflow-hidden"
            >
              <ProjectSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Panel */}
        <div className="w-[400px] border-r border-zinc-800 flex flex-col bg-zinc-900/20">
          <BuilderChat />
        </div>

        {/* Preview / Code Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'split' ? (
            <div className="flex-1 flex">
              {/* File Tree + Code Editor */}
              <div className="w-1/2 flex border-r border-zinc-800">
                <div className="w-48 border-r border-zinc-800 bg-zinc-900/30">
                  <FileTree />
                </div>
                <div className="flex-1">
                  <CodeEditor />
                </div>
              </div>
              {/* Preview */}
              <div className="w-1/2">
                <CodePreview key={previewKey} />
              </div>
            </div>
          ) : viewMode === 'code' ? (
            <div className="flex-1 flex">
              <div className="w-48 border-r border-zinc-800 bg-zinc-900/30">
                <FileTree />
              </div>
              <div className="flex-1">
                <CodeEditor />
              </div>
            </div>
          ) : (
            <CodePreview key={previewKey} />
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Component Palette */}
      <ComponentPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
      />

      {/* Generation Indicator */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-violet-600 rounded-full flex items-center gap-2 shadow-lg shadow-violet-500/20"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">AI is generating your UI...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
