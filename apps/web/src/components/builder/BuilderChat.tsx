'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, LayoutDashboard, Globe, Table2, LogIn } from 'lucide-react';
import { useBuilderStore } from '@/store/builder';
import { apiClient } from '@/lib/api/client';

const QUICK_PROMPTS = [
  { label: 'Dashboard', prompt: 'Create a modern analytics dashboard with sidebar navigation, stats cards, and a chart section', icon: LayoutDashboard },
  { label: 'Landing Page', prompt: 'Build a landing page with hero section, features grid, and call-to-action', icon: Globe },
  { label: 'Data Table', prompt: 'Create a sortable, filterable data table with pagination and row selection', icon: Table2 },
  { label: 'Login Form', prompt: 'Build a login form with email, password, remember me, and social login buttons', icon: LogIn },
];

interface ApiResponse {
  success?: boolean;
  message?: string;
  files?: Record<string, string>;
  error?: string | { code?: string; message?: string };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }
  return 'Unknown error';
}

export function BuilderChat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isGenerating,
    addMessage,
    setGenerating,
    setGeneratedCode,
    currentProject,
    createProject,
    settings
  } = useBuilderStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async (promptText?: string) => {
    const text = promptText || input.trim();
    if (!text || isGenerating) return;

    if (!currentProject) {
      createProject('Untitled Project');
    }

    addMessage({ role: 'user', content: text });
    setInput('');
    setGenerating(true);

    try {
      const response = await apiClient('/api/builder/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt: text,
          framework: settings.framework,
          styling: settings.styling,
          typescript: settings.typescript,
          existingFiles: useBuilderStore.getState().files,
        }),
      }) as ApiResponse;

      if (response.error) {
        addMessage({
          role: 'assistant',
          content: `Error: ${getErrorMessage(response.error)}`,
        });
      } else if (response.files && Object.keys(response.files).length > 0) {
        addMessage({
          role: 'assistant',
          content: response.message || 'Code generated! Check the preview.',
          codeGenerated: true,
          files: Object.keys(response.files),
        });
        setGeneratedCode(response.files);
      } else {
        addMessage({
          role: 'assistant',
          content: 'No code was generated. Please try a different prompt.',
        });
      }
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: `Error: ${getErrorMessage(error)}`,
      });
    } finally {
      setGenerating(false);
    }
  }, [input, isGenerating, currentProject, createProject, addMessage, setGenerating, setGeneratedCode, settings]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-zinc-900/50 to-zinc-900/80">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm">
        <h2 className="font-semibold text-zinc-100">AI Chat</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Describe what you want to build</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-zinc-400 text-sm mb-4">Quick start:</p>
            {QUICK_PROMPTS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  onClick={() => handleSubmit(item.prompt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/50 hover:border-violet-500/50 rounded-xl transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/10 rounded-lg group-hover:bg-violet-500/20 transition-colors">
                      <Icon size={18} className="text-violet-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-200">{item.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-4 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 shadow-md shadow-black/20'
                }`}>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
                  {message.codeGenerated && message.files && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-zinc-300/80 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      {message.files.length} file{message.files.length > 1 ? 's' : ''} generated
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-4 flex items-center gap-3 shadow-md shadow-black/20">
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                    <Loader2 size={16} className="animate-spin text-violet-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Generating code...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your UI..."
            rows={2}
            className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 pr-12 text-[15px] resize-none focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 placeholder-zinc-500 transition-all"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isGenerating}
            className="absolute right-3 bottom-3 p-2 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg shadow-violet-500/20 disabled:shadow-none"
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
