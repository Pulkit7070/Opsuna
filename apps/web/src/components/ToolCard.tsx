'use client';

import { motion } from 'framer-motion';
import { Plug, Unplug, ExternalLink, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ToolItem } from '@/store/tools';

interface ToolCardProps {
  tool: ToolItem;
  isConnected: boolean;
  onConnect: (appName: string) => void;
  onDisconnect: (appName: string) => void;
}

const riskConfig = {
  LOW: { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Low Risk' },
  MEDIUM: { icon: Shield, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Medium Risk' },
  HIGH: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10', label: 'High Risk' },
};

export function ToolCard({ tool, isConnected, onConnect, onDisconnect }: ToolCardProps) {
  const risk = riskConfig[tool.riskLevel];
  const RiskIcon = risk.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 flex flex-col gap-3 group hover:border-[#D4AF37]/30 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {tool.logo ? (
            <img src={tool.logo} alt={tool.displayName} className="w-8 h-8 rounded" />
          ) : (
            <div className="w-8 h-8 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <span className="text-xs font-mono text-[#D4AF37] uppercase">
                {tool.displayName.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h4 className="font-serif text-sm text-[#F2F2F2] group-hover:text-[#D4AF37] transition-colors">
              {tool.displayName}
            </h4>
            {tool.appName && (
              <span className="text-xs font-mono text-[#71717A]">{tool.appName}</span>
            )}
          </div>
        </div>

        {/* Risk badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${risk.bg} ${risk.color}`}>
          <RiskIcon className="w-3 h-3" />
          {risk.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2">
        {tool.description}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-[#71717A] uppercase">
          {tool.category}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${
          tool.source === 'composio'
            ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
            : 'bg-white/5 text-[#71717A]'
        }`}>
          {tool.source}
        </span>
      </div>

      {/* Action */}
      {tool.source === 'composio' && (
        <div className="mt-auto pt-2 border-t border-white/5">
          {isConnected ? (
            <button
              onClick={() => onDisconnect(tool.appName || tool.name)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white/5 border border-white/10 hover:border-red-400/30 hover:bg-red-400/5 transition-all text-xs text-[#A1A1AA] hover:text-red-400"
            >
              <Unplug className="w-3 h-3" />
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => onConnect(tool.appName || tool.name)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/20 transition-all text-xs text-[#D4AF37]"
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
