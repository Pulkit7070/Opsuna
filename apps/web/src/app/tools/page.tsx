'use client';

import { motion } from 'framer-motion';
import { Command, Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ToolCatalog } from '@/components/ToolCatalog';

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden vignette">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 sticky top-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-[#A1A1AA]" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                  <Command className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <span className="text-xl font-serif font-medium text-[#F2F2F2]">Opsuna</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title */}
            <div className="flex items-center gap-3 mb-2">
              <Wrench className="h-5 w-5 text-[#D4AF37]" />
              <h1 className="text-3xl font-serif font-medium text-[#F2F2F2]">
                Tool <em className="gold-text">Catalog</em>
              </h1>
            </div>
            <p className="text-[#A1A1AA] text-sm mb-8 max-w-xl">
              Browse and connect tools for your AI action chains. Local tools work out of the box.
              Composio tools require connecting your accounts via OAuth.
            </p>

            {/* Catalog */}
            <ToolCatalog />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
