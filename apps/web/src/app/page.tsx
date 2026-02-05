'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useExecution } from '@/hooks/useExecution';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLogs } from '@/store/execution';
import { PromptInput } from '@/components/PromptInput';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { HistoryList } from '@/components/HistoryList';
import { ToastContainer } from '@/components/Toast';
import { Zap, Command, ChevronDown, ChevronUp, Terminal, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTools } from '@/hooks/useTools';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Workflows', href: '#' },
  { label: 'Tools', href: '/tools' },
  { label: 'Settings', href: '#' },
];

const FAQ_ITEMS = [
  {
    question: 'What is Opsuna?',
    answer: 'Opsuna is an AI-powered toolchain composer that transforms natural language into executable action chains with comprehensive safety mechanisms.',
  },
  {
    question: 'How does the preview system work?',
    answer: 'Every action is previewed before execution. You see exactly what will happen, assess the risk level, and approve or modify the plan before anything runs.',
  },
  {
    question: 'What tools can I orchestrate?',
    answer: 'Deploy services, run tests, create PRs, send notifications, manage infrastructure, and more. Tools are extensible through the MCP protocol.',
  },
  {
    question: 'Is it safe for production?',
    answer: 'Yes. All high-risk actions require explicit confirmation. Every execution is logged, auditable, and reversible where possible.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className="font-serif text-[#F2F2F2] group-hover:text-[#D4AF37] transition-colors">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-[#A1A1AA]" />
        ) : (
          <ChevronDown className="h-5 w-5 text-[#A1A1AA]" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-5"
        >
          <p className="text-[#A1A1AA] text-sm leading-relaxed font-light">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function Home() {
  const {
    executionId,
    prompt,
    status,
    plan,
    results,
    error,
    progress,
    isLoading,
    showConfirmDialog,
    setPrompt,
    submitPrompt,
    confirm,
    cancel,
    reset,
  } = useExecution();

  const { isConnected } = useWebSocket();
  const logs = useLogs();
  const { allTools } = useTools();

  const handleCloseConfirmDialog = () => {};

  return (
    <div className="min-h-screen bg-black relative overflow-hidden vignette">
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 sticky top-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <Command className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <span className="text-xl font-serif font-medium text-[#F2F2F2]">Opsuna</span>
            </motion.div>

            {/* Navigation */}
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:flex items-center gap-8"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-[#A1A1AA] hover:text-[#F2F2F2] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </motion.nav>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                <span className="text-xs font-mono text-[#71717A]">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-20 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
                AI-Powered Automation
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-medium text-[#F2F2F2] mb-6 leading-tight tracking-tighter">
              Compose Actions with{' '}
              <em className="gold-text">Natural Language</em>
            </h1>
            <p className="text-[#A1A1AA] text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto font-light">
              Transform prompts into safe, reviewable action chains. Preview before you execute.
            </p>
          </motion.div>
        </section>

        {/* Main Content - Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-6 pb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Panel */}
            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
              {/* Prompt Card */}
              <div className="card p-6">
                <PromptInput
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={submitPrompt}
                  isLoading={isLoading}
                  disabled={status === 'executing'}
                />
              </div>

              <ExecutionPanel
                executionId={executionId}
                status={status}
                plan={plan}
                results={results}
                logs={logs}
                error={error}
                progress={progress}
                showConfirmDialog={showConfirmDialog}
                isLoading={isLoading}
                onConfirm={confirm}
                onCancel={cancel}
                onCloseConfirmDialog={handleCloseConfirmDialog}
                onReset={reset}
              />
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
              <HistoryList />

              {/* Stats Card */}
              <div className="card p-6">
                <h3 className="font-serif text-lg text-[#F2F2F2] mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#D4AF37]" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A1A1AA]">Executions Today</span>
                    <span className="font-mono text-sm text-[#F2F2F2]">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A1A1AA]">Success Rate</span>
                    <span className="font-mono text-sm text-emerald-400">98.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A1A1AA]">Active Tools</span>
                    <span className="font-mono text-sm text-[#F2F2F2]">12</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg text-[#F2F2F2] flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[#D4AF37]" />
                    Available Tools
                  </h3>
                  <Link href="/tools" className="text-xs text-[#D4AF37] hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {(allTools.length > 0 ? allTools.slice(0, 6) : [
                    { name: 'deploy_staging', source: 'local' },
                    { name: 'run_smoke_tests', source: 'local' },
                    { name: 'create_github_pr', source: 'local' },
                    { name: 'post_slack_message', source: 'local' },
                  ]).map((tool) => (
                    <div
                      key={tool.name}
                      className="px-3 py-2 rounded-md bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition-colors flex items-center justify-between"
                    >
                      <span className="font-mono text-xs text-[#A1A1AA]">{tool.name}</span>
                      <span className={`text-[10px] font-mono uppercase ${
                        tool.source === 'composio' ? 'text-[#D4AF37]' : 'text-[#71717A]'
                      }`}>
                        {tool.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-serif font-medium text-[#F2F2F2] text-center mb-10">
              Frequently Asked <em className="gold-text">Questions</em>
            </h2>
            <div className="card px-6">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.question} {...item} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-[#A1A1AA] text-sm font-light">
              Safe action orchestration with AI-powered intelligence
            </p>
            <p className="text-[#71717A] text-xs mt-2 font-mono">
              Opsuna Tambo v0.1.0
            </p>
          </div>
        </footer>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}
