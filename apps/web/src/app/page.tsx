'use client';

import { motion } from 'framer-motion';
import { useExecution } from '@/hooks/useExecution';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLogs } from '@/store/execution';
import { PromptInput } from '@/components/PromptInput';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { HistoryList } from '@/components/HistoryList';
import { ToastContainer } from '@/components/Toast';
import { Zap, Wifi, WifiOff, Sparkles } from 'lucide-react';

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
    transition: { duration: 0.5, ease: 'easeOut' },
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
    <>
      {/* Analog Noise Gradient Background */}
      <div className="analog-background">
        <div className="warm-glow" />
        <div className="vignette" />
      </div>

      <main className="min-h-screen relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-surface-base/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-accent-orange to-accent-brown rounded-lg shadow-glow-orange">
                <Zap className="h-6 w-6 text-text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-medium tracking-tight text-text-primary">
                  Opsuna <span className="italic text-gradient">Tambo</span>
                </h1>
                <p className="text-xs font-mono text-text-muted">MCP Toolchain Composer</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-sm ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <Wifi className="h-3 w-3" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                    <WifiOff className="h-3 w-3" />
                    <span>Disconnected</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent-orange" />
              <span className="text-sm font-mono text-text-muted uppercase tracking-wider">
                Safe Action UI
              </span>
              <Sparkles className="h-5 w-5 text-accent-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-text-primary mb-4">
              Transform <span className="italic text-gradient">Ideas</span> into
              <br />
              Executable <span className="italic text-gradient-warm">Actions</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Describe your DevOps task in natural language. Preview, approve, and execute
              with comprehensive safety mechanisms.
            </p>
          </motion.div>
        </section>

        {/* Main content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 py-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main panel */}
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

              {/* Quick tips card */}
              <div className="glass-card glow-border p-5">
                <h3 className="text-lg font-serif font-medium text-text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent-orange" />
                  Quick <span className="italic text-gradient">Tips</span>
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-orange mt-1">•</span>
                    <span>Use natural language to describe your task</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-gold mt-1">•</span>
                    <span>Review the plan carefully before confirming</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-orange-bright mt-1">•</span>
                    <span>High-risk actions require typing a confirmation phrase</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-purple mt-1">•</span>
                    <span>Use rollback if something goes wrong</span>
                  </li>
                </ul>
              </div>

              {/* Available tools card */}
              <div className="glass-card p-5">
                <h3 className="text-lg font-serif font-medium text-text-primary mb-3">
                  Available <span className="italic text-gradient">Tools</span>
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
        <footer className="border-t border-white/5 mt-16 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-mono text-text-muted">
              Built with the MCP Protocol • Preview → Approve → Execute
            </p>
          </div>
        </footer>

        {/* Toast notifications */}
        <ToastContainer />
      </main>
    </>
  );
}
