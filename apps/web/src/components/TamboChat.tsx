'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Zap,
  History,
  Bot,
  Loader2,
  ArrowLeft,
  Wrench,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'execution';
  content: string;
  component?: React.ReactNode;
  executionId?: string;
  status?: 'pending' | 'success' | 'error';
}

interface ExamplePrompt {
  icon: React.ElementType;
  label: string;
  prompt: string;
}

const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    icon: Zap,
    label: 'Deploy to staging',
    prompt: 'Deploy the main branch to staging and run smoke tests',
  },
  {
    icon: Sparkles,
    label: 'Create a PR',
    prompt: 'Create a pull request from feature-auth to main',
  },
  {
    icon: History,
    label: 'Check status',
    prompt: 'What was my last deployment and did it succeed?',
  },
  {
    icon: Wrench,
    label: 'Connect tools',
    prompt: 'Show me available tools I can connect',
  },
];

export default function TamboChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call our backend API to generate execution plan
      interface ExecuteResponse {
        executionId: string;
        status: string;
        plan: {
          goal: string;
          summary: string;
          steps: Array<{ id: string; toolName: string; description: string; parameters: Record<string, unknown> }>;
        };
        intentToken: string;
      }
      const response = await apiClient<ExecuteResponse>('/api/execute', {
        method: 'POST',
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      if (response.success && response.data) {
        const execution = response.data;
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I've created an execution plan for: "${userMessage.content}"`,
          executionId: execution.executionId,
          component: (
            <ExecutionPlanCard
              plan={{
                goal: execution.plan.summary,
                steps: execution.plan.steps.map(s => ({
                  id: s.id,
                  tool: s.toolName,
                  action: s.description,
                  params: s.parameters,
                })),
              }}
              executionId={execution.executionId}
              intentToken={execution.intentToken}
              onConfirm={handleConfirmExecution}
            />
          ),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading]);

  const handleConfirmExecution = useCallback(async (executionId: string, intentToken: string) => {
    setIsLoading(true);
    try {
      interface ConfirmResponse {
        executionId: string;
        status: string;
      }
      const response = await apiClient<ConfirmResponse>(`/api/confirm/${executionId}`, {
        method: 'POST',
        body: JSON.stringify({ confirmed: true, intentToken }),
      });

      if (response.success && response.data) {
        const resultMessage: Message = {
          id: crypto.randomUUID(),
          role: 'execution',
          content: `Execution ${response.data.status}!`,
          status: response.data.status === 'executing' || response.data.status === 'completed' ? 'success' : 'error',
          executionId: response.data.executionId,
        };
        setMessages(prev => [...prev, resultMessage]);
      } else if (response.error) {
        throw new Error(response.error.message);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'execution',
        content: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExampleClick = useCallback((prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="flex flex-col h-screen bg-surface-base">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-elevated">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-lg hover:bg-surface-base transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-accent-orange/20 to-accent-gold/20">
              <Sparkles className="w-6 h-6 text-accent-orange" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">Tambo AI Chat</h1>
              <p className="text-xs text-text-muted">Generative UI powered by Opsuna Tambo</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tools" className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-surface-base rounded-lg transition-colors">
            <Wrench className="w-4 h-4" />
            <span>Tools</span>
          </Link>
          <Link href="/agents" className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-surface-base rounded-lg transition-colors">
            <Bot className="w-4 h-4" />
            <span>Agents</span>
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <EmptyState onExampleClick={handleExampleClick} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-text-muted"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border-subtle bg-surface-elevated p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to deploy, create PRs, run tests, or anything else..."
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border bg-surface-base p-4 pr-12',
                'text-text-primary placeholder:text-text-muted',
                'border-border-subtle focus:border-accent-blue focus:ring-1 focus:ring-accent-blue',
                'transition-all outline-none'
              )}
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-2 rounded-lg transition-all',
                input.trim() && !isLoading
                  ? 'bg-accent-orange text-white hover:bg-accent-orange/80'
                  : 'bg-surface-elevated text-text-muted cursor-not-allowed'
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ onExampleClick }: { onExampleClick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent-orange/20 to-accent-gold/20 mb-4">
          <Sparkles className="w-12 h-12 text-accent-orange" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to Tambo AI</h2>
        <p className="text-text-muted">
          I can help you deploy, create PRs, run tests, and more.
          <br />
          Tell me what you need and I&apos;ll show you a plan.
        </p>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {EXAMPLE_PROMPTS.map((example, index) => {
          const IconComponent = example.icon;
          return (
            <motion.button
              key={example.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onExampleClick(example.prompt)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl text-left',
                'bg-surface-elevated border border-border-subtle',
                'hover:border-accent-blue/50 hover:bg-surface-base',
                'transition-all group'
              )}
            >
              <div className="p-2 rounded-lg bg-accent-blue/10 group-hover:bg-accent-blue/20 transition-colors">
                <IconComponent className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <div className="font-medium text-text-primary text-sm">{example.label}</div>
                <div className="text-xs text-text-muted truncate">{example.prompt}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isExecution = message.role === 'execution';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex gap-3 p-4 rounded-xl',
        isUser ? 'bg-accent-orange/10 ml-12' : 'bg-surface-elevated mr-12'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-accent-orange/20' : isExecution ? 'bg-accent-green/20' : 'bg-accent-blue/20'
        )}
      >
        {isUser ? (
          <span className="text-accent-orange font-bold text-sm">U</span>
        ) : isExecution ? (
          message.status === 'success' ? (
            <CheckCircle className="w-4 h-4 text-accent-green" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )
        ) : (
          <Bot className="w-4 h-4 text-accent-blue" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-text-primary text-sm">
            {isUser ? 'You' : isExecution ? 'Execution' : 'Tambo'}
          </span>
        </div>
        {message.component || (
          <div className="text-text-secondary text-sm whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </motion.div>
  );
}

interface ExecutionPlanCardProps {
  plan: {
    goal: string;
    steps: Array<{ id: string; tool: string; action: string; params: Record<string, unknown> }>;
  };
  executionId: string;
  intentToken: string;
  onConfirm: (executionId: string, intentToken: string) => void;
}

function ExecutionPlanCard({ plan, executionId, intentToken, onConfirm }: ExecutionPlanCardProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm(executionId, intentToken);
  };

  return (
    <div className="bg-surface-base rounded-lg border border-border-subtle p-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-accent-orange" />
        <h3 className="font-semibold text-text-primary">Execution Plan</h3>
      </div>
      <p className="text-sm text-text-secondary mb-4">{plan.goal}</p>
      <div className="space-y-2 mb-4">
        {plan.steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3 p-2 bg-surface-elevated rounded-lg">
            <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-accent-blue">{index + 1}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">{step.action}</div>
              <div className="text-xs text-text-muted">Tool: {step.tool}</div>
            </div>
          </div>
        ))}
      </div>
      {!confirmed ? (
        <button
          onClick={handleConfirm}
          className="w-full py-2 px-4 bg-accent-orange text-white rounded-lg font-medium hover:bg-accent-orange/80 transition-colors"
        >
          Confirm & Execute
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 py-2 text-text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Executing...</span>
        </div>
      )}
    </div>
  );
}

function ExecutionResultCard({ result }: { result: { execution?: { status: string }; results?: Array<{ tool: string; success: boolean; output: unknown }> } }) {
  return (
    <div className="bg-surface-base rounded-lg border border-accent-green/30 p-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-accent-green" />
        <h3 className="font-semibold text-text-primary">Execution Complete</h3>
      </div>
      {result.results?.map((r, i) => (
        <div key={i} className="p-2 bg-surface-elevated rounded-lg mb-2">
          <div className="flex items-center gap-2">
            {r.success ? (
              <CheckCircle className="w-4 h-4 text-accent-green" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium text-text-primary">{r.tool}</span>
          </div>
          <pre className="text-xs text-text-muted mt-1 overflow-auto max-h-32">
            {JSON.stringify(r.output, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}
