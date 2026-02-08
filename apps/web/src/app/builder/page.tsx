'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Eye,
  Download,
  Save,
  PanelLeftClose,
  PanelLeft,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  GripVertical,
  X,
  Home,
  MessageSquare,
  Bot,
  Wrench
} from 'lucide-react';
import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';
import { BuilderChat } from '@/components/builder/BuilderChat';
import { CodePreview } from '@/components/builder/CodePreview';
import { CodeEditor } from '@/components/builder/CodeEditor';
import { FileTree } from '@/components/builder/FileTree';
import { ExportModal } from '@/components/builder/ExportModal';
import { ProjectSidebar } from '@/components/builder/ProjectSidebar';
import { ComponentPalette } from '@/components/builder/ComponentPalette';
import { TamboBuilder } from '@/components/builder/TamboBuilder';
import { useBuilderStore } from '@/store/builder';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type RightTab = 'preview' | 'code';
type BuilderMode = 'code' | 'tambo';

const DEVICE_SIZES = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

export default function BuilderPage() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [rightTab, setRightTab] = useState<RightTab>('preview');
  const [builderMode, setBuilderMode] = useState<BuilderMode>('tambo'); // Default to Tambo mode

  // Resizable chat panel
  const [chatWidth, setChatWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    currentProject,
    files,
    activeFile,
    isGenerating,
    previewKey
  } = useBuilderStore();

  // Handle panel resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const sidebarWidth = showSidebar ? 260 : 0;
      const newWidth = e.clientX - containerRect.left - sidebarWidth;

      // Clamp between 300 and 600
      setChatWidth(Math.max(300, Math.min(600, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, showSidebar]);

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

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-3 bg-zinc-900/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          {/* Navigation Links */}
          <div className="flex items-center gap-1 pr-3 border-r border-zinc-700">
            <Link
              href="/"
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Home"
            >
              <Home size={18} />
            </Link>
            <Link
              href="/chat"
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Chat"
            >
              <MessageSquare size={18} />
            </Link>
            <Link
              href="/agents"
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Agents"
            >
              <Bot size={18} />
            </Link>
            <Link
              href="/tools"
              className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Tools"
            >
              <Wrench size={18} />
            </Link>
          </div>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          <div className="flex items-center gap-2">
            <LogoIcon size="sm" />
            <span className="font-semibold text-sm">
              <span className="text-white">Opsuna</span>
              <span className="text-cyan-400">.</span>
              <span className="text-zinc-400 font-normal ml-1">Builder</span>
            </span>
          </div>

          {currentProject && (
            <div className="px-2.5 py-1 bg-zinc-800/80 rounded-md text-xs text-zinc-400 border border-zinc-700">
              {currentProject.name}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex items-center bg-zinc-800/50 rounded-lg p-0.5 ml-3">
            <button
              onClick={() => setBuilderMode('tambo')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                builderMode === 'tambo'
                  ? 'bg-cyan-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live UI
            </button>
            <button
              onClick={() => setBuilderMode('code')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                builderMode === 'code'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 size={12} />
              Code Gen
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Device Preview Buttons */}
          <div className="flex items-center bg-zinc-800/50 rounded-lg p-0.5 mr-2">
            {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((device) => {
              const Icon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
              return (
                <button
                  key={device}
                  onClick={() => setDeviceMode(device)}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceMode === device
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={DEVICE_SIZES[device].label}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-zinc-700" />

          {/* Action Buttons */}
          <button
            onClick={handleCopyCode}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Copy code"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>

          <button
            onClick={handleRefreshPreview}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Refresh preview"
          >
            <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setShowPalette(true)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="Component library"
          >
            <FileCode size={16} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <div className="w-px h-5 bg-zinc-700" />

          <button
            onClick={() => useBuilderStore.getState().saveProject()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white text-sm"
          >
            <Save size={14} />
            Save
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors font-medium text-sm"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </header>

      {/* Fullscreen Preview Mode */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((device) => {
                  const Icon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
                  return (
                    <button
                      key={device}
                      onClick={() => setDeviceMode(device)}
                      className={`p-2 rounded-md transition-colors ${
                        deviceMode === device ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-full flex items-center justify-center p-8 bg-zinc-900/50">
              <div
                className="h-full bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
                style={{ width: DEVICE_SIZES[deviceMode].width, maxWidth: '100%' }}
              >
                <CodePreview key={previewKey} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {builderMode === 'tambo' ? (
          /* Tambo Live UI Builder */
          <TamboBuilder deviceMode={deviceMode} />
        ) : (
          /* Code Generation Builder */
          <>
            {/* Project Sidebar */}
            <AnimatePresence>
              {showSidebar && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="border-r border-zinc-800 bg-zinc-900/50 overflow-hidden shrink-0"
                >
                  <ProjectSidebar />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Panel - Resizable */}
            <div
              className="border-r border-zinc-800 flex flex-col bg-zinc-900/30 shrink-0 relative"
              style={{ width: chatWidth }}
            >
              <BuilderChat />

              {/* Resize Handle */}
              <div
                onMouseDown={handleMouseDown}
                className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize transition-all group ${
                  isResizing ? 'bg-cyan-500' : 'bg-gradient-to-b from-transparent via-zinc-600/30 to-transparent hover:via-cyan-500/50'
                }`}
              >
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-1.5 rounded-md bg-zinc-800 border border-zinc-700/50 transition-all ${
                  isResizing ? 'opacity-100 border-cyan-500/50' : 'opacity-50 group-hover:opacity-100'
                }`}>
                  <GripVertical size={14} className={`${isResizing ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                </div>
              </div>
            </div>

            {/* Preview / Code Panel */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {/* Tab Header */}
              <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-3 bg-zinc-900/30 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRightTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      rightTab === 'preview'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={() => setRightTab('code')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      rightTab === 'code'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Code2 size={14} />
                    Code
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  {activeFile && (
                    <span className="px-2 py-0.5 bg-zinc-800 rounded">{activeFile}</span>
                  )}
                  <span>{Object.keys(files).length} files</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {rightTab === 'preview' ? (
                  <div className="h-full flex items-center justify-center p-4 bg-zinc-900/20">
                    <div
                      className="h-full bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-300"
                      style={{
                        width: DEVICE_SIZES[deviceMode].width,
                        maxWidth: '100%',
                        border: deviceMode !== 'desktop' ? '8px solid #27272a' : undefined,
                        borderRadius: deviceMode !== 'desktop' ? '20px' : '8px',
                      }}
                    >
                      <CodePreview key={previewKey} />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex">
                    <div className="w-44 border-r border-zinc-800 bg-zinc-900/50 shrink-0 overflow-auto">
                      <FileTree />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CodeEditor />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
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
            className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-600 rounded-full flex items-center gap-2 shadow-lg shadow-cyan-500/25 z-40"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Generating...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
