'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Copy, Check, Clock, ExternalLink } from 'lucide-react';
import { useArtifacts, SharedReport } from '@/hooks/useArtifacts';

interface ShareDialogProps {
  executionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ executionId, isOpen, onClose }: ShareDialogProps) {
  const { createShareLink, loading } = useArtifacts();
  const [sharedReport, setSharedReport] = useState<SharedReport | null>(null);
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [copied, setCopied] = useState(false);

  const handleCreateLink = async () => {
    const result = await createShareLink(executionId, expiresInHours);
    if (result) {
      setSharedReport(result);
    }
  };

  const handleCopy = async () => {
    if (!sharedReport) return;
    await navigator.clipboard.writeText(sharedReport.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSharedReport(null);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#D4AF37]/20 rounded-lg">
                    <Link className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <h2 className="text-lg font-medium text-neutral-200">Share Execution</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {!sharedReport ? (
                  <>
                    <p className="text-sm text-neutral-400">
                      Create a shareable link to view this execution report. Anyone with the link can view the report.
                    </p>

                    {/* Expiration Setting */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-neutral-300">
                        <Clock className="w-4 h-4" />
                        Link expires in
                      </label>
                      <select
                        value={expiresInHours}
                        onChange={(e) => setExpiresInHours(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-[#D4AF37]/50"
                      >
                        <option value={1}>1 hour</option>
                        <option value={24}>24 hours</option>
                        <option value={72}>3 days</option>
                        <option value={168}>7 days</option>
                        <option value={720}>30 days</option>
                        <option value={0}>Never</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCreateLink}
                      disabled={loading}
                      className="w-full py-2.5 bg-[#D4AF37] text-neutral-900 font-medium rounded-lg hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </span>
                      ) : (
                        'Create Share Link'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-400 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Share link created successfully!
                      </p>
                    </div>

                    {/* Share URL */}
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-400">Share URL</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={sharedReport.shareUrl}
                          className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm truncate"
                        />
                        <button
                          onClick={handleCopy}
                          className="p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-400 hover:text-[#D4AF37] transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={sharedReport.shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-400 hover:text-[#D4AF37] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Expiration Info */}
                    {sharedReport.expiresAt && (
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires: {new Date(sharedReport.expiresAt).toLocaleString()}
                      </p>
                    )}

                    <button
                      onClick={handleClose}
                      className="w-full py-2.5 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
