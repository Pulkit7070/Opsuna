'use client';

import { motion } from 'framer-motion';
import { Search, BarChart3, Server, Bot, Sparkles, Wrench } from 'lucide-react';
import { Agent } from '@/hooks/useAgents';
import { Badge } from '@/components/ui/badge';

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
          ? 'bg-accent/10 border-accent/50 shadow-lg shadow-accent/10'
          : 'bg-bg-surface border-border-subtle hover:border-border-highlight'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${
          isSelected ? 'bg-accent/20 text-accent' : 'bg-bg-elevated text-text-muted'
        }`}>
          {getIcon(agent.icon)}
        </div>
        {agent.isBuiltin && (
          <Badge variant="default" size="sm">
            <Sparkles className="w-3 h-3" />
            Built-in
          </Badge>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-medium text-text-primary mb-2">{agent.name}</h3>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">{agent.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" size="sm">
          <Wrench className="w-3 h-3" />
          {agent.toolNames.length || 'All'} tools
        </Badge>
        <Badge variant="secondary" size="sm">
          {getMemoryScopeLabel(agent.memoryScope)}
        </Badge>
      </div>

      {/* Action */}
      {onUse && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUse(agent);
          }}
          className="w-full py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20
                     transition-colors text-sm font-medium border border-accent/20 hover:border-accent/40"
        >
          Use Agent
        </button>
      )}
    </motion.div>
  );
}
