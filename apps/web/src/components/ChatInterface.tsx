'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, RefreshCw } from 'lucide-react';
import { ChatMessage, ChatMessageData } from './ChatMessage';
import { useExecution } from '@/hooks/useExecution';
import { useAgentsStore } from '@/store/agents';
import { AgentSelector } from './AgentSelector';

// Simple ID generator
function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    executionId,
    status,
    plan,
    results,
    isLoading,
    error,
    setPrompt,
    submitPrompt,
    confirm,
    cancel,
    reset,
  } = useExecution();

  const { selectedAgent } = useAgentsStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages when execution state changes
  useEffect(() => {
    if (!executionId) return;

    setMessages((prev) => {
      const updated = [...prev];

      // Update the last assistant message with plan
      const lastAssistantIndex = prev.findLastIndex((m) => m.role === 'assistant');
      if (lastAssistantIndex !== -1 && plan) {
        updated[lastAssistantIndex] = {
          ...updated[lastAssistantIndex],
          plan: plan,
          status: status || undefined,
          isLoading: false,
        };
      }

      // Update the last execution message with results and final status
      const lastExecutionIndex = prev.findLastIndex((m) => m.role === 'execution');
      if (lastExecutionIndex !== -1 && status) {
        const statusMessages: Record<string, string> = {
          executing: 'Execution in progress...',
          completed: 'Execution completed successfully!',
          failed: 'Execution failed.',
          cancelled: 'Execution was cancelled.',
        };

        updated[lastExecutionIndex] = {
          ...updated[lastExecutionIndex],
          content: statusMessages[status] || updated[lastExecutionIndex].content,
          results: results.length > 0 ? results : updated[lastExecutionIndex].results,
          status: status,
        };
      }

      return updated;
    });
  }, [executionId, plan, results, status]);

  // Handle error state - update loading message or add error message
  useEffect(() => {
    if (!error) return;

    setMessages((prev) => {
      if (prev.length === 0) return prev;

      const lastMessage = prev[prev.length - 1];

      // If last message is a loading assistant message, update it with error
      if (lastMessage.role === 'assistant' && lastMessage.isLoading) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `Error: ${error}`,
          isLoading: false,
        };
        return updated;
      }

      // Otherwise add a new error message
      return [
        ...prev,
        {
          id: generateId(),
          role: 'assistant' as const,
          content: `Error: ${error}`,
          timestamp: new Date(),
          isLoading: false,
        },
      ];
    });
  }, [error]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessageData = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessageData = {
      id: generateId(),
      role: 'assistant',
      content: selectedAgent
        ? `Using ${selectedAgent.name} agent to process your request...`
        : 'Analyzing your request and generating an execution plan...',
      timestamp: new Date(),
      isLoading: true,
    };

    const promptText = input.trim();
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setPrompt(promptText);
    setInput('');

    // Focus back on input
    inputRef.current?.focus();

    // Submit with the prompt directly (don't rely on store update timing)
    submitPrompt(promptText);
  }, [input, isLoading, selectedAgent, setPrompt, submitPrompt]);

  const handleConfirm = useCallback(() => {
    // Add execution started message
    const execMessage: ChatMessageData = {
      id: generateId(),
      role: 'execution',
      content: 'Execution started. Running tools...',
      timestamp: new Date(),
      status: 'executing',
    };
    setMessages((prev) => [...prev, execMessage]);
    confirm();
  }, [confirm]);

  const handleCancel = useCallback(() => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastAssistant = updated.findLastIndex((m) => m.role === 'assistant');
      if (lastAssistant !== -1) {
        updated[lastAssistant] = {
          ...updated[lastAssistant],
          status: 'cancelled',
        };
      }
      return updated;
    });
    cancel();
  }, [cancel]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    reset();
    setInput('');
    inputRef.current?.focus();
  }, [reset]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Compact Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-surface/30">
        <AgentSelector />
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all active:scale-95"
            title="New chat"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <EmptyState onExampleClick={(text) => setInput(text)} />
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border-subtle bg-bg-elevated">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to do..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-xl
                         text-text-primary placeholder:text-text-muted resize-none
                         focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
                         disabled:opacity-50 disabled:cursor-not-allowed
                         min-h-[48px] max-h-[200px] transition-all"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-accent hover:bg-accent-hover disabled:opacity-50
                       rounded-xl text-bg-primary transition-all disabled:cursor-not-allowed
                       hover:shadow-glow active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-text-muted mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  const examples = [
    'Deploy the latest code to staging and run smoke tests',
    'Create a GitHub PR for the feature branch and notify the team on Slack',
    'Run database migrations and verify the schema changes',
    'Send a deployment notification to #engineering channel',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-accent" />
      </div>
      <h2 className="font-semibold text-xl text-text-primary mb-2">
        What would you like to do?
      </h2>
      <p className="text-text-muted text-sm mb-8 max-w-md">
        Describe your task in natural language. I'll create an execution plan,
        show you what will happen, and wait for your approval before running anything.
      </p>
      <div className="grid gap-2 w-full max-w-lg">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(example)}
            className="text-left px-4 py-3 bg-bg-elevated hover:bg-bg-surface
                       border border-border-subtle hover:border-accent/30
                       rounded-lg text-sm text-text-secondary hover:text-text-primary
                       transition-all"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
