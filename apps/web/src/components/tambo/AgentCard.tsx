'use client';

import { motion } from 'framer-motion';
import { Bot, Wrench, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  name: string;
  description: string;
  icon?: string;
  toolCount: number;
  isBuiltin: boolean;
  onSelect?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  search: Sparkles,
  chart: Bot,
  server: Bot,
};

export function AgentCard({
  name,
  description,
  icon,
  toolCount,
  isBuiltin,
  onSelect,
}: AgentCardProps) {
  const IconComponent = icon && iconMap[icon] ? iconMap[icon] : Bot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'rounded-xl border bg-surface-elevated p-5 cursor-pointer transition-all',
        'border-border-subtle hover:border-accent-blue/50',
        'hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="p-3 rounded-xl bg-accent-blue/20"
        >
          <IconComponent className="w-6 h-6 text-accent-blue" />
        </motion.div>
        {isBuiltin && (
          <span className="px-2 py-1 text-xs font-medium bg-accent-gold/20 text-accent-gold rounded-full">
            Built-in
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="font-semibold text-text-primary mb-1">{name}</h3>
      <p className="text-sm text-text-muted mb-3 line-clamp-2">{description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-1 text-sm text-text-muted">
          <Wrench className="w-4 h-4" />
          <span>{toolCount} tools</span>
        </div>
        {onSelect && (
          <motion.div
            whileHover={{ x: 3 }}
            className="flex items-center gap-1 text-sm text-accent-blue"
          >
            <span>Use Agent</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
