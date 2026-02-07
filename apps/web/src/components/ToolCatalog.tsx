'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { useTools } from '@/hooks/useTools';
import { ToolCard } from './ToolCard';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'deployment', label: 'Deployment' },
  { value: 'testing', label: 'Testing' },
  { value: 'version_control', label: 'Version Control' },
  { value: 'communication', label: 'Communication' },
  { value: 'notification', label: 'Notification' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'database', label: 'Database' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'other', label: 'Other' },
];

const SOURCES = [
  { value: '', label: 'All Sources' },
  { value: 'local', label: 'Local' },
  { value: 'composio', label: 'Composio' },
];

export function ToolCatalog() {
  const {
    tools,
    isLoading,
    error,
    filter,
    setFilter,
    fetchTools,
    connectApp,
    disconnectApp,
    isAppConnected,
  } = useTools();

  const [searchInput, setSearchInput] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ search: searchInput || undefined });
  };

  const handleConnect = async (appName: string) => {
    setConnecting(appName);
    setConnectError(null);
    setConnectSuccess(null);

    const result = await connectApp(appName);

    if (result) {
      if (result.alreadyConnected) {
        // User is already connected - show success message
        setConnectSuccess(result.message || `You're already connected to ${appName}!`);
      } else if (result.redirectUrl) {
        // Open OAuth flow in popup
        window.open(result.redirectUrl, 'composio-auth', 'width=600,height=700,popup=true');
      }
    } else {
      // Connection failed - show helpful message
      setConnectError(
        `Could not connect ${appName}. OAuth integration needs to be configured in the Composio dashboard (app.composio.dev). ` +
        `Local tools work without configuration.`
      );
    }
    setConnecting(null);
  };

  const handleDisconnect = async (appName: string) => {
    await disconnectApp(appName);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-[#F2F2F2] placeholder:text-[#71717A] focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
        </form>

        <div className="flex gap-2">
          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none" />
            <select
              value={filter.category || ''}
              onChange={(e) => setFilter({ category: e.target.value || undefined })}
              className="pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-[#A1A1AA] focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-[#121212]">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source filter */}
          <select
            value={filter.source || ''}
            onChange={(e) => setFilter({ source: e.target.value || undefined })}
            className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-[#A1A1AA] focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
          >
            {SOURCES.map((src) => (
              <option key={src.value} value={src.value} className="bg-[#121212]">
                {src.label}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchTools()}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#A1A1AA] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-400/10 border border-red-400/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Connection Success */}
      {connectSuccess && (
        <div className="p-4 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-sm text-emerald-400">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">✓</span>
            <p>{connectSuccess}</p>
          </div>
          <button
            onClick={() => setConnectSuccess(null)}
            className="mt-2 text-xs underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connection Error */}
      {connectError && (
        <div className="p-4 rounded-lg bg-amber-400/10 border border-amber-400/20 text-sm text-amber-400">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">⚠️</span>
            <div>
              <p>{connectError}</p>
              <p className="mt-2 text-xs opacity-75">
                For demo purposes, local mock tools are fully functional without any setup.
              </p>
            </div>
          </div>
          <button
            onClick={() => setConnectError(null)}
            className="mt-2 text-xs underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && tools.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#71717A]">Loading tools...</p>
        </div>
      )}

      {/* Tools Grid */}
      {tools.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {tools.map((tool) => (
            <ToolCard
              key={tool.name}
              tool={tool}
              isConnected={isAppConnected(tool.appName || tool.name)}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </motion.div>
      ) : (
        !isLoading && (
          <div className="text-center py-12">
            <p className="text-sm text-[#71717A]">No tools found</p>
          </div>
        )
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-[#71717A] pt-2">
        <span>{tools.length} tool{tools.length !== 1 ? 's' : ''}</span>
        <div className="flex gap-4">
          <span>{tools.filter(t => t.source === 'local').length} local</span>
          <span>{tools.filter(t => t.source === 'composio').length} composio</span>
        </div>
      </div>
    </div>
  );
}
