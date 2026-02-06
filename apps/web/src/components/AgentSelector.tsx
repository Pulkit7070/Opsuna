'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, X, Search, BarChart3, Server, Sparkles } from 'lucide-react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { useAgentsStore } from '@/store/agents';

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
            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]'
            : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-600'
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
              className="p-0.5 hover:bg-[#D4AF37]/20 rounded"
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
            className="absolute top-full left-0 mt-2 w-72 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* No Agent Option */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors ${
                !selectedAgent ? 'bg-neutral-800/30' : ''
              }`}
            >
              <div className="p-2 bg-neutral-800 rounded-lg text-neutral-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm text-neutral-200">No Agent</p>
                <p className="text-xs text-neutral-500">Use default assistant</p>
              </div>
            </button>

            <div className="border-t border-neutral-800" />

            {/* Agent List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : agents.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-sm">
                No agents available
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelect(agent)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/50 transition-colors ${
                      selectedAgent?.id === agent.id ? 'bg-[#D4AF37]/10' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedAgent?.id === agent.id
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {getIcon(agent.icon)}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${
                          selectedAgent?.id === agent.id ? 'text-[#D4AF37]' : 'text-neutral-200'
                        }`}>
                          {agent.name}
                        </p>
                        {agent.isBuiltin && (
                          <Sparkles className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
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
