'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Loader2, Wand2, Layout, BarChart3, Table2, FormInput } from 'lucide-react';
import { useBuilderStore } from '@/store/builder';
import { apiClient } from '@/lib/api/client';

const QUICK_PROMPTS = [
  { icon: Layout, label: 'Dashboard', prompt: 'Create a modern analytics dashboard with sidebar navigation, stats cards, and a chart section' },
  { icon: BarChart3, label: 'Charts', prompt: 'Build a data visualization page with multiple chart types (line, bar, pie) using sample data' },
  { icon: Table2, label: 'Data Table', prompt: 'Create a sortable, filterable data table with pagination and row selection' },
  { icon: FormInput, label: 'Form', prompt: 'Build a multi-step form with validation, progress indicator, and success state' },
];

export function BuilderChat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

    // Create project if not exists
    if (!currentProject) {
      createProject('Untitled Project');
    }

    // Add user message
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
      }) as { message?: string; files?: Record<string, string>; error?: string };

      if (response.error) {
        addMessage({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${response.error}`,
        });
      } else {
        // Add assistant message
        addMessage({
          role: 'assistant',
          content: response.message || 'I\'ve generated the code for you! Check the preview on the right.',
          codeGenerated: true,
          files: Object.keys(response.files || {}),
        });

        // Update files
        if (response.files) {
          setGeneratedCode(response.files);
        }
      }
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
            <Wand2 size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Assistant</h2>
            <p className="text-[10px] text-zinc-500">Describe your UI to generate code</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">What would you like to build?</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Describe your UI and I'll generate the React code with Tailwind CSS
            </p>

            {/* Quick Prompts */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSubmit(item.prompt)}
                  className="flex items-center gap-2 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                >
                  <item.icon size={16} className="text-violet-400 shrink-0" />
                  <span className="text-sm truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  message.role === 'user'
                    ? 'bg-violet-600'
                    : 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                }`}>
                  {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-xl max-w-[90%] ${
                    message.role === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-800 text-zinc-100'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.codeGenerated && message.files && (
                      <div className="mt-2 pt-2 border-t border-zinc-700">
                        <p className="text-xs text-zinc-400">
                          Generated {message.files.length} file{message.files.length > 1 ? 's' : ''}:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {message.files.map(file => (
                            <span
                              key={file}
                              className="text-xs px-2 py-0.5 bg-zinc-700 rounded-full text-violet-300"
                            >
                              {file}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Bot size={14} />
                </div>
                <div className="bg-zinc-800 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-violet-400" />
                    <span className="text-sm text-zinc-400">Generating code...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 placeholder-zinc-500"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isGenerating}
            className="absolute right-3 bottom-3 p-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isGenerating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
