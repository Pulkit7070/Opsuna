"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNavigation } from "@/lib/docs-navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Menu, X, ExternalLink } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#050505] text-[#ededed] selection:bg-[#ccff00] selection:text-black font-sans">
      {/* Mobile Header */}
      <div className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1a1a1a] bg-[#050505]/80 px-6 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded bg-[#1a1a1a] border border-[#333]">
            <div className="w-3 h-3 bg-[#ccff00] rounded-sm transform rotate-45" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">Opsuna</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#888] hover:text-white"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Overlay) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-8 border-r border-[#1a1a1a] bg-[#050505] px-6 py-8 transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Desktop Header */}
        <div className="hidden md:flex flex-col gap-6">
           <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold tracking-wide text-[#666] hover:text-[#ccff00] transition-colors uppercase"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#1a1a1a] border border-[#333]">
              <div className="w-4 h-4 bg-[#ccff00] rounded-sm transform rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none text-white">
                Opsuna
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#ccff00] bg-[#ccff00]/10 px-1.5 py-0.5 rounded w-fit mt-1">
                DOCS_v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Spacer */}
        <div className="h-16 md:hidden" />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
          {docsNavigation.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#444]">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "block px-0 py-1.5 text-sm transition-all duration-200 border-l-2 pl-4",
                          isActive
                            ? "border-[#ccff00] text-white font-medium pl-5"
                            : "border-transparent text-[#888] hover:text-white hover:border-[#333]"
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

        {/* Bottom CTA */}
        <div className="mt-auto rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5">
          <h5 className="mb-2 text-sm font-bold text-[#ccff00] flex items-center gap-2">
            NEED HELP?
          </h5>
          <p className="mb-4 text-xs text-[#666] leading-relaxed">
            Join our Discord community for real-time support and discussions.
          </p>
          <a
            href="#"
            className="flex items-center justify-center gap-2 w-full rounded lg text-center py-2.5 text-xs font-bold text-black bg-[#ccff00] hover:bg-[#bbe600] transition-colors uppercase tracking-wide"
          >
            Join Discord <ExternalLink size={12} />
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-72 pt-16 md:pt-0 min-h-screen">
        <div className="mx-auto max-w-4xl px-6 py-12 md:px-12 md:py-20 lg:py-24">
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

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile decorative gradient */}
      <div className="pointer-events-none fixed inset-0 z-50 pointer-events-none mix-blend-overlay opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
}
