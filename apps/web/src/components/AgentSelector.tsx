'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, X, Search, BarChart3, Server, Sparkles } from 'lucide-react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { useAgentsStore } from '@/store/agents';
import { Spinner } from '@/components/ui/spinner';

interface AgentSelectorProps {
  onAgentChange?: (agent: Agent | null) => void;
}

export function AgentSelector({ onAgentChange }: AgentSelectorProps) {
  const { agents, loading } = useAgents();
  const { selectedAgent, setSelectedAgent, clearSelection } = useAgentsStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (agent: Agent | null) => {
    if (agent) {
      setSelectedAgent(agent);
    } else {
      clearSelection();
    }
    onAgentChange?.(agent);
    setIsOpen(false);
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'search':
        return <Search className="w-4 h-4" />;
      case 'bar-chart':
        return <BarChart3 className="w-4 h-4" />;
      case 'server':
        return <Server className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          selectedAgent
            ? 'bg-accent/10 border-accent/30 text-accent'
            : 'bg-bg-elevated border-border-subtle text-text-secondary hover:border-border-highlight'
        }`}
      >
        {selectedAgent ? (
          <>
            {getIcon(selectedAgent.icon)}
            <span className="text-sm font-medium max-w-[120px] truncate">
              {selectedAgent.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null);
              }}
              className="p-0.5 hover:bg-accent/20 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <>
            <Bot className="w-4 h-4" />
            <span className="text-sm">Select Agent</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-72 bg-bg-surface border border-border-subtle rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* No Agent Option */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors ${
                !selectedAgent ? 'bg-bg-elevated' : ''
              }`}
            >
              <div className="p-2 bg-bg-elevated rounded-lg text-text-muted">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm text-text-primary">No Agent</p>
                <p className="text-xs text-text-muted">Use default assistant</p>
              </div>
            </button>

            <div className="border-t border-border-subtle" />

            {/* Agent List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" variant="primary" />
              </div>
            ) : agents.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-sm">
                No agents available
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelect(agent)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors ${
                      selectedAgent?.id === agent.id ? 'bg-accent/10' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedAgent?.id === agent.id
                        ? 'bg-accent/20 text-accent'
                        : 'bg-bg-elevated text-text-muted'
                    }`}>
                      {getIcon(agent.icon)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${
                          selectedAgent?.id === agent.id ? 'text-accent' : 'text-text-primary'
                        }`}>
                          {agent.name}
                        </p>
                        {agent.isBuiltin && (
                          <Sparkles className="w-3 h-3 text-accent flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-text-muted truncate">
                        {agent.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
