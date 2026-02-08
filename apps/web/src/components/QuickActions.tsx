'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Download,
  FileSpreadsheet,
  Bug,
  Mail,
  Share2,
  X,
  Check,
  Loader2,
  Hash,
} from 'lucide-react';

export type ActionType = 'slack' | 'download' | 'export' | 'jira' | 'email' | 'share';

export interface QuickAction {
  type: ActionType;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

interface QuickActionsProps {
  context: 'diagram' | 'chart' | 'test' | 'deployment' | 'default';
  data?: {
    title?: string;
    content?: string;
    svgContent?: string;
    chartData?: Array<{ name: string; value: number }>;
  };
  onAction?: (type: ActionType, payload?: Record<string, unknown>) => void;
}

const actionsByContext: Record<string, QuickAction[]> = {
  diagram: [
    { type: 'slack', label: 'Share to Slack', icon: <MessageSquare className="w-4 h-4" />, description: 'Post diagram to a channel' },
    { type: 'jira', label: 'Create Ticket', icon: <Bug className="w-4 h-4" />, description: 'Create a Jira ticket with this diagram' },
    { type: 'email', label: 'Email Report', icon: <Mail className="w-4 h-4" />, description: 'Send via email' },
  ],
  chart: [
    { type: 'slack', label: 'Share to Slack', icon: <MessageSquare className="w-4 h-4" />, description: 'Post chart to a channel' },
    { type: 'export', label: 'Export CSV', icon: <FileSpreadsheet className="w-4 h-4" />, description: 'Download data as CSV' },
    { type: 'email', label: 'Email Report', icon: <Mail className="w-4 h-4" />, description: 'Send via email' },
  ],
  test: [
    { type: 'slack', label: 'Share Results', icon: <MessageSquare className="w-4 h-4" />, description: 'Post test results' },
    { type: 'jira', label: 'Create Bug', icon: <Bug className="w-4 h-4" />, description: 'Create a bug ticket' },
  ],
  deployment: [
    { type: 'slack', label: 'Notify Team', icon: <MessageSquare className="w-4 h-4" />, description: 'Notify about deployment' },
    { type: 'jira', label: 'Update Ticket', icon: <Bug className="w-4 h-4" />, description: 'Update related ticket' },
  ],
  default: [
    { type: 'slack', label: 'Share to Slack', icon: <MessageSquare className="w-4 h-4" />, description: 'Post to Slack' },
    { type: 'share', label: 'Copy Link', icon: <Share2 className="w-4 h-4" />, description: 'Copy shareable link' },
  ],
};

export function QuickActions({ context, data, onAction }: QuickActionsProps) {
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [actionStatus, setActionStatus] = useState<Record<ActionType, 'idle' | 'loading' | 'success' | 'error'>>({
    slack: 'idle',
    download: 'idle',
    export: 'idle',
    jira: 'idle',
    email: 'idle',
    share: 'idle',
  });

  const actions = actionsByContext[context] || actionsByContext.default;

  const handleAction = async (type: ActionType) => {
    if (type === 'slack') {
      setShowSlackModal(true);
      return;
    }

    setActionStatus((prev) => ({ ...prev, [type]: 'loading' }));

    try {
      switch (type) {
        case 'download':
          handleDownload();
          break;
        case 'export':
          handleExportCSV();
          break;
        case 'share':
          await handleCopyLink();
          break;
        case 'jira':
        case 'email':
          // These would trigger their own flows
          onAction?.(type, data);
          break;
      }
      setActionStatus((prev) => ({ ...prev, [type]: 'success' }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [type]: 'idle' })), 2000);
    } catch {
      setActionStatus((prev) => ({ ...prev, [type]: 'error' }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [type]: 'idle' })), 2000);
    }
  };

  const handleDownload = () => {
    if (!data?.svgContent) return;
    const blob = new Blob([data.svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title?.toLowerCase().replace(/\s+/g, '-') || 'diagram'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!data?.chartData) return;
    const csv = ['Name,Value', ...data.chartData.map((d) => `${d.name},${d.value}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title?.toLowerCase().replace(/\s+/g, '-') || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  const handleSlackSend = async (channel: string, message: string) => {
    setActionStatus((prev) => ({ ...prev, slack: 'loading' }));
    try {
      onAction?.('slack', { channel, message, ...data });
      setActionStatus((prev) => ({ ...prev, slack: 'success' }));
      setTimeout(() => {
        setActionStatus((prev) => ({ ...prev, slack: 'idle' }));
        setShowSlackModal(false);
      }, 1500);
    } catch {
      setActionStatus((prev) => ({ ...prev, slack: 'error' }));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border-subtle"
      >
        <span className="text-xs text-text-muted mr-1">Quick actions:</span>
        {actions.map((action) => {
          const status = actionStatus[action.type];
          return (
            <motion.button
              key={action.type}
              onClick={() => handleAction(action.type)}
              disabled={status === 'loading'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                         bg-bg-elevated hover:bg-bg-surface border border-border-subtle
                         hover:border-accent/30 text-text-secondary hover:text-accent
                         rounded-lg transition-all duration-200"
            >
              {status === 'loading' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : status === 'success' ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                action.icon
              )}
              <span>{status === 'success' ? 'Done!' : action.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Slack Modal */}
      <AnimatePresence>
        {showSlackModal && (
          <SlackShareModal
            title={data?.title || 'Result'}
            content={data?.content}
            onSend={handleSlackSend}
            onClose={() => setShowSlackModal(false)}
            isLoading={actionStatus.slack === 'loading'}
            isSuccess={actionStatus.slack === 'success'}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface SlackShareModalProps {
  title: string;
  content?: string;
  onSend: (channel: string, message: string) => void;
  onClose: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
}

function SlackShareModal({ title, content, onSend, onClose, isLoading, isSuccess }: SlackShareModalProps) {
  const [channel, setChannel] = useState('#general');
  const [message, setMessage] = useState(`📊 ${title}\n\n${content || 'Check out this result from Opsuna Tambo!'}`);

  const channels = ['#general', '#engineering', '#deployments', '#alerts', '#random'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-bg-surface rounded-xl border border-border-subtle shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4A154B] flex items-center justify-center">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Share to Slack</h3>
              <p className="text-xs text-text-muted">Send this result to a channel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Channel selector */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Channel</label>
            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    channel === ch
                      ? 'bg-accent/10 border-accent/30 text-accent'
                      : 'bg-bg-elevated border-border-subtle text-text-muted hover:border-border-highlight'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-bg-primary border border-border-subtle rounded-lg
                         text-sm text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50
                         resize-none"
              placeholder="Add a message..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border-subtle bg-bg-elevated/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary
                       rounded-lg hover:bg-bg-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(channel, message)}
            disabled={isLoading || isSuccess}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                       bg-accent hover:bg-accent-hover text-bg-primary
                       rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Sent!
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Send to {channel}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
