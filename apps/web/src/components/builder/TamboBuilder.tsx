'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTamboThread, useTamboThreadInput } from '@tambo-ai/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  LayoutDashboard,
  LogIn,
  BarChart3,
  CreditCard,
  Globe,
  Maximize2,
  Minimize2,
  Search,
  FileText,
  Settings,
  Zap,
  Bot,
  ChevronDown,
  Database,
  LineChart,
  Shield,
  Workflow,
} from 'lucide-react';
import { useAgents, Agent } from '@/hooks/useAgents';

interface TamboBuilderProps {
  onClose?: () => void;
}

// Agent-specific quick prompts configuration
const agentPrompts: Record<string, Array<{ icon: React.ElementType; label: string; prompt: string }>> = {
  // Default prompts when no agent selected
  default: [
    { icon: LogIn, label: 'Login Form', prompt: 'Create a modern login form with email, password, and social login options' },
    { icon: LayoutDashboard, label: 'Dashboard Stats', prompt: 'Create stats cards showing key metrics like revenue, users, and growth' },
    { icon: BarChart3, label: 'Data Table', prompt: 'Create a data table with name, email, role, and status columns' },
    { icon: CreditCard, label: 'Pricing Cards', prompt: 'Create pricing cards for Basic, Pro, and Enterprise plans' },
    { icon: Globe, label: 'Hero Section', prompt: 'Create a hero section for a product launch page' },
  ],

  // Deep Research Agent
  'Deep Research': [
    { icon: Search, label: 'Research Dashboard', prompt: 'Create a research dashboard with search input, filters, and results cards' },
    { icon: FileText, label: 'Document Viewer', prompt: 'Create a document preview panel with title, summary, and key findings' },
    { icon: Database, label: 'Data Sources', prompt: 'Create a data sources table showing source name, type, status, and last updated' },
    { icon: LineChart, label: 'Trend Analysis', prompt: 'Create stats cards showing research trends: papers analyzed, insights found, accuracy rate' },
    { icon: BarChart3, label: 'Research Report', prompt: 'Create a research report layout with title, executive summary, and findings list' },
  ],

  // Data Analyst Agent
  'Data Analyst': [
    { icon: LineChart, label: 'Analytics Dashboard', prompt: 'Create stats cards for data analysis: total records, processed, anomalies, accuracy' },
    { icon: BarChart3, label: 'Data Overview', prompt: 'Create a data table showing dataset name, records count, status, and last analyzed date' },
    { icon: Database, label: 'Query Results', prompt: 'Create a results table with id, value, category, and trend columns' },
    { icon: LayoutDashboard, label: 'Metrics Cards', prompt: 'Create dashboard metrics showing conversion rate, avg value, growth, and predictions' },
    { icon: FileText, label: 'Report Builder', prompt: 'Create a data report layout with charts summary, key metrics, and export options' },
  ],

  // DevOps Engineer Agent
  'DevOps Engineer': [
    { icon: Shield, label: 'System Status', prompt: 'Create stats cards showing system health: uptime, response time, error rate, deployments' },
    { icon: Workflow, label: 'Pipeline Status', prompt: 'Create a table showing pipeline name, status, duration, and last run date' },
    { icon: Settings, label: 'Infrastructure', prompt: 'Create infrastructure cards showing servers, containers, memory usage, CPU load' },
    { icon: Zap, label: 'Deployment Panel', prompt: 'Create deployment cards with environment name, version, status, and deploy button' },
    { icon: BarChart3, label: 'Monitoring Table', prompt: 'Create a monitoring table with service name, status, response time, and uptime' },
  ],
};

// Get icon for agent
function getAgentIcon(name: string): React.ElementType {
  const iconMap: Record<string, React.ElementType> = {
    'Deep Research': Search,
    'Data Analyst': LineChart,
    'DevOps Engineer': Settings,
  };
  return iconMap[name] || Bot;
}

// Get color for agent
function getAgentColor(name: string): string {
  const colorMap: Record<string, string> = {
    'Deep Research': 'from-blue-500 to-cyan-500',
    'Data Analyst': 'from-emerald-500 to-teal-500',
    'DevOps Engineer': 'from-orange-500 to-red-500',
  };
  return colorMap[name] || 'from-violet-500 to-fuchsia-500';
}

export function TamboBuilder({ onClose }: TamboBuilderProps) {
  const { thread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Store the last generated component to prevent it from disappearing
  const [lastGeneratedUI, setLastGeneratedUI] = useState<React.ReactNode | null>(null);

  const { builtinAgents } = useAgents();

  // Get quick prompts based on selected agent
  const quickPrompts = useMemo(() => {
    if (!selectedAgent) return agentPrompts.default;
    return agentPrompts[selectedAgent.name] || agentPrompts.default;
  }, [selectedAgent]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAgentDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track the latest generated component
  useEffect(() => {
    const lastMessage = thread?.messages?.[thread.messages.length - 1];
    if (lastMessage?.renderedComponent) {
      setLastGeneratedUI(lastMessage.renderedComponent);
    }
  }, [thread?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isPending) {
      submit();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setValue(prompt);
    setTimeout(() => submit(), 100);
  };

  const handleAgentSelect = (agent: Agent | null) => {
    setSelectedAgent(agent);
    setShowAgentDropdown(false);
  };

  // Get the current generated component
  const lastMessage = thread?.messages?.[thread.messages.length - 1];
  const generatedComponent = lastMessage?.renderedComponent || lastGeneratedUI;

  const AgentIcon = selectedAgent ? getAgentIcon(selectedAgent.name) : Bot;
  const agentGradient = selectedAgent ? getAgentColor(selectedAgent.name) : 'from-violet-500 to-fuchsia-500';

  return (
    <div className={`flex flex-col bg-zinc-950 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 bg-gradient-to-br ${agentGradient} rounded-lg flex items-center justify-center`}>
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Tambo AI Builder</h2>
            <p className="text-xs text-zinc-500">
              {selectedAgent ? `${selectedAgent.name} Mode` : 'Describe your UI, get it instantly'}
            </p>
          </div>

          {/* Agent Selector */}
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={() => setShowAgentDropdown(!showAgentDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
            >
              <AgentIcon size={14} className="text-zinc-400" />
              <span className="text-sm text-zinc-300">
                {selectedAgent?.name || 'Select Agent'}
              </span>
              <ChevronDown size={14} className={`text-zinc-500 transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAgentDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-56 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <button
                    onClick={() => handleAgentSelect(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-700 transition-colors text-left ${
                      !selectedAgent ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-300'
                    }`}
                  >
                    <Sparkles size={14} />
                    <div>
                      <div className="text-sm font-medium">General Builder</div>
                      <div className="text-xs text-zinc-500">All-purpose UI generation</div>
                    </div>
                  </button>

                  <div className="border-t border-zinc-700">
                    <div className="px-3 py-1.5 text-xs text-zinc-500 font-medium">AI Agents</div>
                    {builtinAgents.map((agent) => {
                      const Icon = getAgentIcon(agent.name);
                      const isSelected = selectedAgent?.id === agent.id;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => handleAgentSelect(agent)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-700 transition-colors text-left ${
                            isSelected ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-300'
                          }`}
                        >
                          <Icon size={14} />
                          <div>
                            <div className="text-sm font-medium">{agent.name}</div>
                            <div className="text-xs text-zinc-500 truncate">{agent.description.slice(0, 40)}...</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 size={16} className="text-zinc-400" />
          ) : (
            <Maximize2 size={16} className="text-zinc-400" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat/Input Panel */}
        <div className="w-80 border-r border-zinc-800 flex flex-col shrink-0">
          {/* Agent Context Banner */}
          {selectedAgent && (
            <div className={`px-4 py-2.5 bg-gradient-to-r ${agentGradient} bg-opacity-10 border-b border-zinc-800`}>
              <div className="flex items-center gap-2">
                <AgentIcon size={14} className="text-white" />
                <span className="text-sm font-medium text-white">{selectedAgent.name}</span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5 opacity-80">{selectedAgent.description.slice(0, 60)}...</p>
            </div>
          )}

          {/* Quick Prompts */}
          <div className="p-4 border-b border-zinc-800">
            <p className="text-xs text-zinc-500 mb-3">
              {selectedAgent ? `${selectedAgent.name} Templates` : 'Quick Start'}
            </p>
            <div className="space-y-2">
              {quickPrompts.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleQuickPrompt(item.prompt)}
                  disabled={isPending}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-500/50 rounded-lg transition-all text-left disabled:opacity-50 group"
                >
                  <item.icon size={14} className="text-violet-400 group-hover:text-violet-300" />
                  <span className="text-sm text-zinc-300 group-hover:text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {thread?.messages?.map((msg, idx) => {
              const textContent = typeof msg.content === 'string'
                ? msg.content
                : Array.isArray(msg.content)
                  ? msg.content
                      .filter((part): part is { type: 'text'; text: string } =>
                        typeof part === 'object' && part !== null && 'type' in part && part.type === 'text')
                      .map(part => part.text)
                      .join('')
                  : '';

              return (
                <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg max-w-[90%] ${
                    msg.role === 'user'
                      ? `bg-gradient-to-r ${agentGradient} text-white`
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {textContent || (msg.renderedComponent ? 'UI Generated' : '...')}
                  </div>
                </div>
              );
            })}
            {isPending && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                <span>Generating {selectedAgent ? `${selectedAgent.name} ` : ''}UI...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={selectedAgent
                  ? `Ask ${selectedAgent.name} to build...`
                  : 'Describe the UI you want...'
                }
                disabled={isPending}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-violet-500 text-white placeholder-zinc-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isPending || !value.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r ${agentGradient} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-opacity`}
              >
                {isPending ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-auto bg-zinc-900/50">
          <AnimatePresence mode="wait">
            {generatedComponent ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                {generatedComponent}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center max-w-md p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${agentGradient} opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    {selectedAgent ? (
                      <AgentIcon className="text-white opacity-100" size={32} />
                    ) : (
                      <Sparkles className="text-violet-400" size={32} />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedAgent ? `${selectedAgent.name} Builder` : 'AI-Powered UI Generation'}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-6">
                    {selectedAgent
                      ? `Use ${selectedAgent.name}'s specialized templates or describe your own UI needs.`
                      : 'Describe what you want to build and watch Tambo generate it instantly. Try the quick prompts or write your own!'
                    }
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickPrompts.slice(0, 4).map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleQuickPrompt(item.prompt)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs rounded-full transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
