'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-8xl font-bold accent-text">404</div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
          <p className="text-text-muted">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary rounded-lg font-medium hover:bg-accent-hover transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border border-border-subtle text-text-primary rounded-lg font-medium hover:bg-bg-elevated transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
