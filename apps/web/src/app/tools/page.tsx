'use client';

import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { ToolCatalog } from '@/components/ToolCatalog';
import { Navigation } from '@/components/Navigation';

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />

      <div className="container mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/20">
              <Wrench className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Tool <span className="text-accent">Catalog</span>
            </h1>
          </div>
          <p className="text-text-secondary text-sm mb-8 max-w-xl">
            Browse and connect tools for your AI action chains. Local tools work out of the box.
            Composio tools require connecting your accounts via OAuth.
          </p>

          {/* Catalog */}
          <ToolCatalog />
        </motion.div>
      </div>
    </div>
  );
}
