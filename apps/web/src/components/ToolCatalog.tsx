'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTools } from '@/hooks/useTools';
import { ToolCard } from './ToolCard';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

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
    fetchConnections,
    connectApp,
    disconnectApp,
    checkConnection,
    isAppConnected,
  } = useTools();

  const [searchInput, setSearchInput] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);

  // Monitor popup window - if user closes it manually, clear connecting state
  useEffect(() => {
    if (!connecting || !popupRef.current) return;

    const checkPopup = setInterval(() => {
      if (popupRef.current?.closed) {
        console.log('[ToolCatalog] Popup closed, checking connection status...');
        // Popup was closed - refresh connections to see if it succeeded
        fetchConnections().then(() => {
          setConnecting(null);
        });
        clearInterval(checkPopup);
      }
    }, 500);

    return () => clearInterval(checkPopup);
  }, [connecting, fetchConnections]);

  // Listen for OAuth callback messages from popup window
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'composio-auth-complete') {
        console.log('[ToolCatalog] Received OAuth callback:', event.data);
        const appName = event.data.appName;

        if (event.data.success) {
          // Check connection status at Composio
          if (appName) {
            await checkConnection(appName);
          }
          // Refresh all connections to update UI
          await fetchConnections();
          setConnectSuccess(`Successfully connected to ${appName || 'app'}!`);
        } else {
          setConnectError(event.data.error || 'OAuth connection failed');
        }

        // Clear connecting state
        setConnecting(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [checkConnection, fetchConnections]);

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
        setConnectSuccess(result.message || `You're already connected to ${appName}!`);
        setConnecting(null); // Clear immediately for already connected
      } else if (result.redirectUrl) {
        // Open OAuth popup - keep connecting state until message callback
        popupRef.current = window.open(result.redirectUrl, 'composio-auth', 'width=600,height=700,popup=true');
        // Don't clear connecting here - will be cleared by message listener or popup monitor
        return;
      }
    } else {
      setConnectError(
        `Could not connect ${appName}. OAuth integration needs to be configured in the Composio dashboard (app.composio.dev). ` +
        `Local tools work without configuration.`
      );
    }
    setConnecting(null);
  };

  const handleDisconnect = async (appName: string) => {
    setDisconnecting(appName);
    setConnectError(null);
    setConnectSuccess(null);

    const success = await disconnectApp(appName);

    if (success) {
      setConnectSuccess(`Successfully disconnected from ${appName}`);
    } else {
      setConnectError(`Failed to disconnect from ${appName}`);
    }

    setDisconnecting(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tools..."
            className="input-base pl-10"
          />
        </form>

        <div className="flex gap-2">
          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <select
              value={filter.category || ''}
              onChange={(e) => setFilter({ category: e.target.value || undefined })}
              className="pl-10 pr-4 py-2.5 rounded-lg bg-bg-surface border border-border-subtle text-sm text-text-secondary
                         focus:outline-none focus:border-accent appearance-none cursor-pointer hover:border-border-highlight transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-bg-surface">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source filter */}
          <select
            value={filter.source || ''}
            onChange={(e) => setFilter({ source: e.target.value || undefined })}
            className="px-4 py-2.5 rounded-lg bg-bg-surface border border-border-subtle text-sm text-text-secondary
                       focus:outline-none focus:border-accent appearance-none cursor-pointer hover:border-border-highlight transition-colors"
          >
            {SOURCES.map((src) => (
              <option key={src.value} value={src.value} className="bg-bg-surface">
                {src.label}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchTools()}
            disabled={isLoading}
            className="p-2.5 rounded-lg bg-bg-surface border border-border-subtle hover:border-accent/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-text-secondary ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Connection Success */}
      {connectSuccess && (
        <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-sm text-success">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-sm text-warning">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">!</span>
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
          <Spinner size="lg" variant="primary" className="mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading tools...</p>
        </div>
      )}

      {/* Tools Grid */}
      {tools.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {tools.map((tool) => {
            const toolAppName = tool.appName || tool.name;
            return (
              <ToolCard
                key={tool.name}
                tool={tool}
                isConnected={isAppConnected(toolAppName)}
                isConnecting={connecting === toolAppName}
                isDisconnecting={disconnecting === toolAppName}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            );
          })}
        </motion.div>
      ) : (
        !isLoading && (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted">No tools found</p>
          </div>
        )
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-2">
        <span>{tools.length} tool{tools.length !== 1 ? 's' : ''}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-text-muted"></span>
            {tools.filter(t => t.source === 'local').length} local
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            {tools.filter(t => t.source === 'composio').length} composio
          </span>
        </div>
      </div>
    </div>
  );
}
