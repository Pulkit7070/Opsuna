'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { docsNavigation } from '@/lib/docs-navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      {/* Mobile Header */}
      <div className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-subtle bg-bg-primary/80 px-6 backdrop-blur-md md:hidden">
        <Logo size="sm" />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-6 border-r border-border-subtle bg-bg-primary px-6 py-8 transition-transform duration-300 ease-in-out md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex flex-col gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold tracking-wide text-text-muted hover:text-accent transition-colors uppercase"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xs uppercase tracking-wider font-bold text-accent bg-accent/10 px-2 py-1 rounded">
              Docs
            </span>
          </div>
        </div>

        {/* Mobile Spacer */}
        <div className="h-16 md:hidden" />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2">
          {docsNavigation.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'block px-4 py-2 text-sm transition-all duration-200 rounded-lg border-l-2',
                          isActive
                            ? 'border-accent text-accent bg-accent/10 font-medium'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="mt-auto rounded-xl border border-border-subtle bg-bg-surface p-5">
          <h5 className="mb-2 text-sm font-bold text-accent">Built with Tambo</h5>
          <p className="mb-4 text-xs text-text-muted leading-relaxed">
            Generative UI SDK for React. The AI decides which components to render.
          </p>
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 w-full rounded-lg text-center py-2.5 text-xs font-bold text-bg-primary bg-accent hover:bg-accent-hover transition-colors"
          >
            Try It Now
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-72 pt-16 md:pt-0 min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-bg-primary/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
