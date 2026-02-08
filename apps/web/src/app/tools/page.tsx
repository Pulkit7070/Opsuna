'use client';

import { motion } from 'framer-motion';
import { Wrench, Plug, Zap } from 'lucide-react';
import { ToolCatalog } from '@/components/ToolCatalog';
import { Navigation } from '@/components/Navigation';

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-bg-primary relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-orange-500/3 rounded-full blur-3xl" />
      </div>

      <Navigation />

      <div className="container mx-auto px-4 md:px-6 py-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl border border-accent/20"
              >
                <Wrench className="w-8 h-8 text-accent" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Tool <span className="text-accent">Catalog</span>
                </h1>
                <p className="text-text-secondary mt-1">
                  Connect and manage integrations for your AI agents
                </p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4 mb-8"
          >
            <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface/50 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-1">Local Tools</h3>
                <p className="text-sm text-text-muted">
                  Built-in tools work instantly. No setup required.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface/50 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Plug className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-1">Composio Integrations</h3>
                <p className="text-sm text-text-muted">
                  Connect your accounts via OAuth to enable 300+ tools.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Catalog */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ToolCatalog />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
