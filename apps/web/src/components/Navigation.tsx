'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  LayoutDashboard,
  MessageSquare,
  Bot,
  Wrench,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebSocket } from '@/hooks/useWebSocket';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Builder', href: '/builder', icon: Sparkles },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Agents', href: '/agents', icon: Bot },
  { label: 'Tools', href: '/tools', icon: Wrench },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected } = useWebSocket();

  return (
    <>
      <header className="border-b border-border-subtle/30 sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              <span className="text-text-primary">Opsuna</span>
              <span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-accent bg-accent/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side - Status + Mobile menu */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface/50 border border-border-subtle">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-text-muted'}`}>
                {isConnected && (
                  <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                )}
              </div>
              <span className="text-xs font-medium text-text-muted">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-bg-primary/80 backdrop-blur-sm md:hidden"
            />
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-0 right-0 z-40 bg-bg-surface border-b border-border-subtle md:hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all',
                        isActive
                          ? 'text-accent bg-accent/10'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
