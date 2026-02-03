'use client';

import { motion } from 'framer-motion';
import { useExecution } from '@/hooks/useExecution';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLogs } from '@/store/execution';
import { PromptInput } from '@/components/PromptInput';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { HistoryList } from '@/components/HistoryList';
import { ToastContainer } from '@/components/Toast';
import { Wifi, WifiOff } from 'lucide-react';

const NAV_ITEMS = ['Home', 'Components', 'Templates', 'Docs'];

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

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

  const handleCloseConfirmDialog = () => {
    // Just close dialog, don't cancel
  };

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-[#333333] sticky top-0 z-40 bg-black">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-xl font-extrabold text-white tracking-[-0.02em]">
              Opsuna
            </span>
          </motion.div>

          {/* Navigation */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden md:flex items-center gap-8"
          >
            {NAV_ITEMS.map((item, index) => (
              <a
                key={item}
                href="#"
                className={`nav-link ${index === 0 ? 'text-white' : ''}`}
              >
                {item}
              </a>
            ))}
          </motion.nav>

          {/* Connection Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {isConnected ? (
                <>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <Wifi className="h-3 w-3" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <WifiOff className="h-3 w-3" />
                  <span>Disconnected</span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Transform Ideas into
            <br />
            Executable Actions
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed">
            Describe your DevOps task in natural language. Preview, approve, and execute
            with comprehensive safety mechanisms.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 pb-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Panel */}
          <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={submitPrompt}
              isLoading={isLoading}
              disabled={status === 'executing'}
            />

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

            {/* Component Showcase Card */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Visibility Test
              </h3>
              <p className="text-[#A1A1AA] text-sm mb-4">
                This card uses a dark gray surface to stand out from the black page background.
              </p>
              <input
                type="email"
                placeholder="Enter email..."
                className="input-base w-full mb-4"
              />
              <button className="btn-primary w-full">
                Get Started
              </button>
            </div>

            {/* Available Tools */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Available Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                {['deploy_staging', 'run_smoke_tests', 'create_github_pr', 'post_slack_message', 'rollback_deploy'].map((tool) => (
                  <span key={tool} className="tag">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-[#333333] py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-[#71717A]">
            Built with the MCP Protocol
          </p>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer />
    </main>
  );
}
