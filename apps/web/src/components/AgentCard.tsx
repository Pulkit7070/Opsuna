'use client';

import { motion } from 'framer-motion';
import { Search, BarChart3, Server, Bot, Sparkles, Wrench } from 'lucide-react';
import { Agent } from '@/hooks/useAgents';

interface AgentCardProps {
  agent: Agent;
  isSelected?: boolean;
  onSelect?: (agent: Agent) => void;
  onUse?: (agent: Agent) => void;
}

export function AgentCard({ agent, isSelected, onSelect, onUse }: AgentCardProps) {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'search':
        return <Search className="w-6 h-6" />;
      case 'bar-chart':
        return <BarChart3 className="w-6 h-6" />;
      case 'server':
        return <Server className="w-6 h-6" />;
      default:
        return <Bot className="w-6 h-6" />;
    }
  };

  const getMemoryScopeLabel = (scope: string) => {
    switch (scope) {
      case 'shared':
        return 'Shared Memory';
      case 'isolated':
        return 'Isolated Memory';
      case 'none':
        return 'No Memory';
      default:
        return scope;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect?.(agent)}
      className={`p-5 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10'
          : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          isSelected ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-neutral-800 text-neutral-400'
        }`}>
          {getIcon(agent.icon)}
        </div>
        {agent.isBuiltin && (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-[#D4AF37]/20 text-[#D4AF37] rounded-full">
            <Sparkles className="w-3 h-3" />
            Built-in
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-medium text-neutral-200 mb-2">{agent.name}</h3>
      <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{agent.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-neutral-800 text-neutral-400 rounded-full">
          <Wrench className="w-3 h-3" />
          {agent.toolNames.length || 'All'} tools
        </span>
        <span className="px-2 py-1 text-xs bg-neutral-800 text-neutral-400 rounded-full">
          {getMemoryScopeLabel(agent.memoryScope)}
        </span>
      </div>

      {/* Action */}
      {onUse && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUse(agent);
          }}
          className="w-full py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors text-sm font-medium"
        >
          Use Agent
        </button>
      )}
    </motion.div>
  );
}
