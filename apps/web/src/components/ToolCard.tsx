'use client';

import { motion } from 'framer-motion';
import { Plug, Unplug, ExternalLink, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ToolItem } from '@/store/tools';
import { Badge } from '@/components/ui/badge';

interface ToolCardProps {
  tool: ToolItem;
  isConnected: boolean;
  onConnect: (appName: string) => void;
  onDisconnect: (appName: string) => void;
}

const riskConfig = {
  LOW: { icon: ShieldCheck, variant: 'success' as const, label: 'Low Risk' },
  MEDIUM: { icon: Shield, variant: 'warning' as const, label: 'Medium Risk' },
  HIGH: { icon: ShieldAlert, variant: 'destructive' as const, label: 'High Risk' },
};

export function ToolCard({ tool, isConnected, onConnect, onDisconnect }: ToolCardProps) {
  const risk = riskConfig[tool.riskLevel];
  const RiskIcon = risk.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 flex flex-col gap-3 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {tool.logo ? (
            <img src={tool.logo} alt={tool.displayName} className="w-8 h-8 rounded" />
          ) : (
            <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
              <span className="text-xs font-mono text-accent uppercase">
                {tool.displayName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h4 className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors">
              {tool.displayName}
            </h4>
            {tool.appName && (
              <span className="text-xs font-mono text-text-muted">{tool.appName}</span>
            )}
          </div>
        </div>

        {/* Risk badge */}
        <Badge variant={risk.variant} size="sm">
          <RiskIcon className="w-3 h-3" />
          {risk.label}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
        {tool.description}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" size="sm">
          {tool.category}
        </Badge>
        <Badge
          variant={tool.source === 'composio' ? 'default' : 'secondary'}
          size="sm"
        >
          {tool.source}
        </Badge>
      </div>

      {/* Action */}
      {tool.source === 'composio' && (
        <div className="mt-auto pt-3 border-t border-border-subtle">
          {isConnected ? (
            <button
              onClick={() => onDisconnect(tool.appName || tool.name)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md
                         bg-bg-elevated border border-border-subtle
                         hover:border-destructive/30 hover:bg-destructive/5
                         transition-all text-xs text-text-secondary hover:text-destructive"
            >
              <Unplug className="w-3 h-3" />
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => onConnect(tool.appName || tool.name)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md
                         bg-accent/10 border border-accent/20
                         hover:border-accent/40 hover:bg-accent/20
                         transition-all text-xs text-accent"
            >
              <Plug className="w-3 h-3" />
              Connect
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
