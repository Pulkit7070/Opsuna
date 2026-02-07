'use client';

import dynamic from 'next/dynamic';
import { Loader2, Sparkles } from 'lucide-react';

// Dynamically import the Tambo chat component to avoid SSR issues
const TamboChat = dynamic(() => import('@/components/TamboChat'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-screen bg-surface-base">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-orange/20 to-accent-gold/20 mb-4">
        <Sparkles className="w-12 h-12 text-accent-orange animate-pulse" />
      </div>
      <div className="flex items-center gap-2 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading Tambo AI...</span>
      </div>
    </div>
  ),
});

export default function TamboPage() {
  return <TamboChat />;
}
