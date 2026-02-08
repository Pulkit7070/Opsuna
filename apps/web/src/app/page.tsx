'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useExecution } from '@/hooks/useExecution';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLogs } from '@/store/execution';
import { PromptInput } from '@/components/PromptInput';
import { ExecutionPanel } from '@/components/ExecutionPanel';
import { HistoryList } from '@/components/HistoryList';
import { ToastContainer } from '@/components/Toast';
import {
  ChevronDown,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Terminal,
  GitBranch,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTools } from '@/hooks/useTools';
import { AgentSelector } from '@/components/AgentSelector';
import { Badge } from '@/components/ui/badge';
import { CTASection } from '@/components/ui/hero-dithering-card';
import { AnimatedBadge } from '@/components/ui/animated-badge';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Chat', href: '/chat' },
  { label: 'Builder', href: '/builder' },
  { label: 'Agents', href: '/agents' },
  { label: 'Tools', href: '/tools' },
];

const FEATURES = [
  {
    title: 'AI UI Builder',
    description: 'Generate beautiful UIs instantly with Tambo AI. Describe what you want, get production-ready components.',
    gradient: 'from-violet-500/20 to-transparent',
  },
  {
    title: 'Smart Agents',
    description: 'Specialized AI agents for research, data analysis, and DevOps. Each with tailored tools and memory.',
    gradient: 'from-accent/20 to-transparent',
  },
  {
    title: 'Tool Orchestration',
    description: 'Connect GitHub, Slack, and 300+ tools. Execute complex workflows with natural language commands.',
    gradient: 'from-success/20 to-transparent',
  },
  {
    title: 'Safe Execution',
    description: 'Preview every action before it runs. Full audit trails, intent tokens, and instant rollbacks.',
    gradient: 'from-warning/20 to-transparent',
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is Opsuna Tambo?',
    answer: 'Opsuna is an AI-powered toolchain composer that transforms natural language into executable action chains. Think of it as having a senior DevOps engineer who never sleeps, never makes typos, and always asks for confirmation before doing anything risky.',
  },
  {
    question: 'How does the preview system work?',
    answer: 'Every action is previewed before execution. You see exactly what will happen—which APIs will be called, what data will be sent, what the expected outcome is. You assess the risk level and approve or modify the plan before anything runs.',
  },
  {
    question: 'What can I automate?',
    answer: 'Deploy services, run tests, create pull requests, send notifications, manage infrastructure, query databases, generate reports—anything you can do with an API, Opsuna can orchestrate. Tools are extensible through the MCP protocol.',
  },
  {
    question: 'Is it safe for production use?',
    answer: 'Absolutely. High-risk actions require explicit typed confirmation. Every execution is logged with full audit trails. Actions are reversible where possible. Intent tokens expire in 5 minutes to prevent stale confirmations.',
  },
];

const STATS = [
  { value: '98%', label: 'Success Rate' },
  { value: '5min', label: 'Avg. Saved per Task' },
  { value: '300+', label: 'Tools Available' },
];


function HeroSection({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="py-8 md:py-12 w-full flex justify-center items-center px-4 md:px-6">
      <div className="w-full max-w-7xl relative group">
        <div className="relative overflow-hidden rounded-[32px] md:rounded-[48px] border border-border-subtle bg-bg-surface shadow-lg min-h-[550px] md:min-h-[650px] flex flex-col items-center justify-center">
          {/* Animated gradient background - CSS only, no shader */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Primary glow */}
            <motion.div
              className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full blur-[100px] opacity-30"
              style={{ background: 'radial-gradient(circle, #0FE3C2 0%, transparent 70%)' }}
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Secondary glow */}
            <motion.div
              className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-[100px] opacity-20"
              style={{ background: 'radial-gradient(circle, #0FE3C2 0%, transparent 70%)' }}
              animate={{
                x: [0, -40, 0],
                y: [0, -20, 0],
                scale: [1.1, 1, 1.1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(15, 227, 194, 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(15, 227, 194, 0.5) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-bg-surface via-transparent to-bg-surface/50 pointer-events-none" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-bg-surface/80 via-transparent to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 px-6 md:px-12 max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Animated Badge */}
            <div className="mb-8">
              <AnimatedBadge
                text="AI-Powered DevOps Automation"
                color="#0FE3C2"
                href="/chat"
              />
            </div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary mb-6 leading-[1.08]"
            >
              Describe your task.
              <br />
              <span className="text-text-primary/70">We execute it safely.</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-secondary text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
            >
              Transform natural language into reviewable, reversible action chains.
              Every command previewed. Every action auditable.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/chat"
                className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-10 md:px-12 text-base font-semibold text-bg-primary transition-all duration-300 hover:bg-accent-hover hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(15,227,194,0.4)]"
              >
                <span className="relative z-10">Start Automating</span>
                <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-8 md:gap-16 mt-12 pt-8 border-t border-border-subtle/30"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-text-primary font-mono">
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-border-subtle last:border-0"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-text-primary group-hover:text-accent transition-colors duration-200">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="ml-4 flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-text-secondary text-base leading-relaxed pb-6 pr-8">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const headerBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(11, 15, 18, 0)', 'rgba(11, 15, 18, 0.95)']);

  const handleExecutionSelect = (executionId: string) => {
    router.push(`/executions/${executionId}`);
  };

  return (
    <div className="min-h-screen relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-bg-primary" />
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #0FE3C2 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #0FE3C2 0%, transparent 70%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          style={{ backgroundColor: headerBg }}
          className="border-b border-border-subtle/30 sticky top-0 z-40 backdrop-blur-xl"
        >
          <div className="container mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-text-primary">Opsuna</span>
                <span className="text-accent ml-0.5">.</span>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-surface/50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface/50 border border-border-subtle">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-text-muted'}`}>
                  {isConnected && (
                    <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  )}
                </div>
                <span className="text-xs font-medium text-text-muted">
                  {isConnected ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section with Dithering Effect */}
        <HeroSection stats={STATS} />

        {/* Features Strip */}
        <section className="border-y border-border-subtle/50 bg-bg-surface/20 backdrop-blur-sm">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle/50">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group py-8 px-6 relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Panel */}
            <div className="lg:col-span-8 space-y-6">
              {/* Prompt Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card p-6 lg:p-8"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-text-primary mb-2">
                    What would you like to do?
                  </h2>
                  <p className="text-base text-text-secondary">
                    Describe your task in plain English. Be specific or broad—Opsuna adapts.
                  </p>
                </div>

                <AgentSelector />

                <div className="mt-4">
                  <PromptInput
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={submitPrompt}
                    isLoading={isLoading}
                    disabled={status === 'executing'}
                  />
                </div>

                {/* Quick Examples */}
                <div className="mt-6 pt-6 border-t border-border-subtle">
                  <p className="text-sm text-text-muted mb-3">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Deploy staging and run smoke tests',
                      'Create a PR for the current branch',
                      'Notify the team about the release',
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => setPrompt(example)}
                        className="text-sm px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

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
                onCloseConfirmDialog={() => {}}
                onReset={reset}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <HistoryList onSelect={handleExecutionSelect} />
              </motion.div>

              {/* Tools Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Connected Tools
                  </h3>
                  <Link
                    href="/tools"
                    className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1 group"
                  >
                    View all
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {(allTools.length > 0 ? allTools.slice(0, 5) : [
                    { name: 'deploy_staging', source: 'local' },
                    { name: 'run_smoke_tests', source: 'local' },
                    { name: 'create_github_pr', source: 'local' },
                    { name: 'post_slack_message', source: 'local' },
                  ]).map((tool) => (
                    <div
                      key={tool.name}
                      className="px-3 py-2.5 rounded-lg bg-bg-elevated/50 border border-border-subtle hover:border-accent/30 transition-all flex items-center justify-between group"
                    >
                      <span className="font-mono text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        {tool.name}
                      </span>
                      <Badge
                        variant={tool.source === 'composio' ? 'default' : 'secondary'}
                        size="sm"
                      >
                        {tool.source}
                      </Badge>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-text-primary mb-5">
                  How it works
                </h3>
                <div className="space-y-4">
                  {[
                    { step: '01', text: 'Describe your task in natural language', icon: Terminal },
                    { step: '02', text: 'Review the generated execution plan', icon: GitBranch },
                    { step: '03', text: 'Confirm to execute with full control', icon: Shield },
                    { step: '04', text: 'Monitor progress with real-time logs', icon: MessageSquare },
                  ].map((item, i) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-accent" />
                      </div>
                      <div className="pt-1">
                        <span className="text-sm text-text-secondary">{item.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                Built for teams who <span className="text-accent">ship with confidence</span>
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Every action is auditable. Every change is reversible. Every deployment is stress-free.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: 'Full Audit Trail',
                  description: 'Complete execution logs with timestamps, user attribution, and outcome tracking.',
                },
                {
                  icon: RotateCcw,
                  title: 'Instant Rollbacks',
                  description: 'One-click rollback to any previous state. No manual cleanup required.',
                },
                {
                  icon: Shield,
                  title: 'Production Safe',
                  description: 'High-risk actions need typed confirmation. Intent tokens expire in 5 minutes.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="card p-6 hover:border-accent/20 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-text-secondary">
                Everything you need to know about Opsuna.
              </p>
            </div>
            <div className="card p-6 lg:p-8">
              {FAQ_ITEMS.map((item, index) => (
                <FAQItem key={item.question} {...item} index={index} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section with Dithering Effect */}
        <CTASection />

        {/* Footer */}
        <footer className="border-t border-border-subtle/50 py-10">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-accent" />
                </div>
                <span className="text-lg font-semibold">
                  <span className="text-text-primary">Opsuna</span>
                  <span className="text-accent">.</span>
                </span>
              </div>
              <p className="text-sm text-text-muted">
                Safe action orchestration for modern development teams
              </p>
              <p className="text-xs text-text-muted font-mono">
                v0.1.0 · Built with Tambo
              </p>
            </div>
          </div>
        </footer>

        {/* Toast Notifications */}
        <ToastContainer />
      </div>
    </div>
  );
}
