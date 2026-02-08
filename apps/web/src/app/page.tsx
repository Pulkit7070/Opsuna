'use client';

import { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ToastContainer } from '@/components/Toast';
import { ChevronDown, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

const NAV_ITEMS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Components', href: '#components' },
  { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
  {
    title: 'Natural Language to UI',
    description: 'Describe what you want in plain English. Tambo\'s AI decides which components to render dynamically.',
    gradient: 'from-cyan-500/20 to-teal-500/20',
  },
  {
    title: 'Dynamic Component Rendering',
    description: 'Components are chosen and rendered in real-time based on conversation context and user intent.',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    title: 'Registered Components',
    description: 'Register your React components with Tambo. The AI learns when and how to use each one.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    title: 'Contextual Adaptation',
    description: 'The UI adapts to what users are trying to do. No more learning complex workflows.',
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
];

const COMPONENTS = [
  {
    name: 'ExecutionPlan',
    description: 'Renders step-by-step action plans with risk assessment and tool calls',
    trigger: '"Deploy staging and notify the team"',
  },
  {
    name: 'DataChart',
    description: 'Dynamically generates charts and visualizations from data queries',
    trigger: '"Show me a chart of monthly revenue"',
  },
  {
    name: 'MermaidDiagram',
    description: 'Creates architecture and flow diagrams from code analysis',
    trigger: '"Analyze the codebase architecture"',
  },
  {
    name: 'ToolResult',
    description: 'Displays tool execution results with status and output formatting',
    trigger: '"Run the smoke tests"',
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is Generative UI?',
    answer: 'Generative UI is a paradigm where AI decides which components to render based on natural language conversations. Instead of users navigating through static interfaces, the UI dynamically adapts to show the right components for what they\'re trying to accomplish.',
  },
  {
    question: 'How does Tambo work?',
    answer: 'You register your React components with Tambo, and the AI learns when to use each one. When users describe what they want in natural language, Tambo analyzes the intent and renders the appropriate components dynamically.',
  },
  {
    question: 'What components can I register?',
    answer: 'Any React component can be registered with Tambo. Charts, forms, data tables, modals, cards, visualizations—the AI will learn when each component is most appropriate based on the conversation context.',
  },
  {
    question: 'How is this different from chatbots?',
    answer: 'Traditional chatbots respond with text. Generative UI responds with actual UI components. Instead of describing what to do, the AI renders interactive elements that let users take action directly.',
  },
];

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
  const { isConnected } = useWebSocket();
  const { scrollYProgress } = useScroll();
  const headerBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(11, 15, 18, 0)', 'rgba(11, 15, 18, 0.95)']);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-bg-primary" />
        <div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[200px] opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #0FE3C2 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.08]"
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
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo size="md" />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-bg-surface/50"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-accent border border-border-subtle hover:border-accent/50 rounded-lg transition-all hover:bg-accent/5"
              >
                <BookOpen className="w-4 h-4" />
                Docs
              </a>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface/50 border border-border-subtle">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-text-muted'}`} />
                <span className="text-xs font-medium text-text-muted">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-accent text-bg-primary rounded-lg hover:bg-accent-hover transition-all"
              >
                Try It
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Built with Tambo Generative UI SDK
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-text-primary mb-8 leading-[1.05]"
              >
                UI that responds to
                <br />
                <span className="bg-gradient-to-r from-accent via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  what you say
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-text-secondary text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Describe your task in natural language. The AI decides which components to render.
                <span className="text-text-primary"> No more learning complex interfaces.</span>
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/chat"
                  className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-10 text-base font-semibold text-bg-primary transition-all duration-300 hover:bg-accent-hover hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(15,227,194,0.35)]"
                >
                  <span>Start Chatting</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border-subtle px-10 text-base font-medium text-text-primary hover:border-accent/50 hover:bg-accent/5 transition-all"
                >
                  <BookOpen className="h-5 w-5" />
                  Read the Docs
                </Link>
              </motion.div>

              {/* Demo Preview */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-20 relative"
              >
                <div className="relative rounded-2xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                  {/* Window Controls */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-elevated/50">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    <div className="ml-4 flex-1">
                      <span className="text-xs text-text-muted font-mono">opsuna — generative ui</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-text-muted'}`} />
                      <span className="text-xs text-text-muted">{isConnected ? 'Connected' : 'Offline'}</span>
                    </div>
                  </div>

                  {/* Chat Interface */}
                  <div className="p-6 md:p-8 space-y-6">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="max-w-md px-4 py-3 rounded-2xl rounded-br-md bg-accent/10 border border-accent/20">
                        <p className="text-text-primary text-sm md:text-base">
                          Deploy staging and show me the execution plan
                        </p>
                      </div>
                    </div>

                    {/* AI Response with Generative UI */}
                    <div className="flex justify-start">
                      <div className="max-w-xl space-y-4">
                        <div className="px-4 py-2">
                          <p className="text-text-secondary text-sm">
                            I'll create an execution plan for deploying staging.
                          </p>
                        </div>

                        {/* Generated Component */}
                        <div className="rounded-xl border border-accent/20 bg-bg-elevated/50 overflow-hidden">
                          <div className="px-4 py-2 border-b border-border-subtle bg-accent/5">
                            <span className="text-xs font-mono text-accent">ExecutionPlan</span>
                            <span className="text-xs text-text-muted ml-2">· rendered by AI</span>
                          </div>
                          <div className="p-4 space-y-3 font-mono text-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent">1</span>
                              <span className="text-text-primary">deploy_staging</span>
                              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">LOW</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent">2</span>
                              <span className="text-text-primary">run_health_check</span>
                              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">LOW</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent">3</span>
                              <span className="text-text-primary">notify_team</span>
                              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">LOW</span>
                            </div>
                          </div>
                          <div className="px-4 py-3 border-t border-border-subtle flex gap-3">
                            <button className="px-4 py-1.5 text-sm font-medium bg-accent text-bg-primary rounded-lg">
                              Confirm
                            </button>
                            <button className="px-4 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg border border-border-subtle">
                              Modify
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-accent/20 via-transparent to-transparent blur-2xl opacity-50" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Powered by Tambo */}
        <section className="border-y border-border-subtle/50 bg-bg-surface/30 backdrop-blur-sm py-12">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="text-center md:text-left">
                <p className="text-text-muted text-sm mb-2">Powered by</p>
                <p className="text-2xl font-bold text-text-primary">Tambo SDK</p>
              </div>
              <div className="h-px md:h-12 w-full md:w-px bg-border-subtle" />
              <div className="grid grid-cols-3 gap-8 md:gap-12 text-center">
                <div>
                  <p className="text-3xl font-bold text-accent">AI</p>
                  <p className="text-sm text-text-muted mt-1">Decides UI</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">React</p>
                  <p className="text-sm text-text-muted mt-1">Components</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-accent">NLP</p>
                  <p className="text-sm text-text-muted mt-1">Powered</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                Generative UI Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                The AI chooses the
                <br />
                <span className="text-accent">right component</span>
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Users shouldn't have to learn your app. The UI should adapt to what they're trying to do.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`group card p-8 hover:border-accent/30 transition-all duration-300 relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <h3 className="text-xl font-semibold text-text-primary mb-3 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 md:py-32 bg-bg-surface/30">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                How Tambo Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                From natural language
                <br />
                <span className="text-accent">to rendered components</span>
              </h2>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: '01',
                    title: 'Register Components',
                    description: 'Define your React components and register them with Tambo. Add descriptions so the AI knows when to use each one.',
                  },
                  {
                    step: '02',
                    title: 'User Describes Intent',
                    description: 'Users describe what they want in natural language. No need to navigate menus or learn the interface.',
                  },
                  {
                    step: '03',
                    title: 'AI Renders UI',
                    description: 'Tambo analyzes the intent and dynamically renders the appropriate components with the right data.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    className="relative"
                  >
                    {index < 2 && (
                      <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-accent/50 to-transparent" />
                    )}

                    <div className="card p-8 relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="text-5xl font-bold text-accent/20">{item.step}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-text-primary mb-3">
                        {item.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Components Showcase */}
        <section id="components" className="py-24 md:py-32">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                Registered Components
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                Components that render
                <br />
                <span className="text-accent">on demand</span>
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Each component is registered with Tambo. The AI decides when to render them based on the conversation.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {COMPONENTS.map((component, i) => (
                <motion.div
                  key={component.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group card p-6 hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 font-mono text-accent text-lg font-bold">
                      {'</>'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-text-primary mb-1 font-mono group-hover:text-accent transition-colors">
                        {component.name}
                      </h3>
                      <p className="text-text-secondary text-sm mb-3">
                        {component.description}
                      </p>
                      <div className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-subtle">
                        <p className="text-xs text-text-muted mb-1">Triggered by:</p>
                        <p className="text-sm text-text-primary font-medium italic">
                          {component.trigger}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-24 md:py-32 bg-bg-surface/30">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                  Simple Integration
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                  Register components
                  <br />
                  <span className="text-accent">in minutes</span>
                </h2>
              </div>

              <div className="card p-0 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-bg-elevated/50">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  <span className="ml-2 text-xs text-text-muted font-mono">tambo-setup.tsx</span>
                </div>
                <pre className="p-6 overflow-x-auto text-sm">
                  <code className="text-text-secondary font-mono">
{`import { TamboProvider, registerComponent } from '@tambo/react';

// Register your component with Tambo
registerComponent({
  name: 'ExecutionPlan',
  component: ExecutionPlanCard,
  description: 'Shows step-by-step execution plans with risk levels',
  triggers: ['deploy', 'execute', 'run workflow', 'show plan']
});

// Wrap your app with TamboProvider
function App() {
  return (
    <TamboProvider>
      <ChatInterface />
    </TamboProvider>
  );
}

// The AI now knows when to render ExecutionPlan!`}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 md:py-32">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                  FAQ
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-text-secondary">
                  Everything you need to know about Generative UI.
                </p>
              </div>
              <div className="card p-6 lg:p-8">
                {FAQ_ITEMS.map((item, index) => (
                  <FAQItem key={item.question} {...item} index={index} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl border border-border-subtle bg-bg-surface overflow-hidden"
            >
              {/* Background Effects */}
              <div className="absolute inset-0 -z-10">
                <div
                  className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
                  style={{ background: 'radial-gradient(circle, #0FE3C2 0%, transparent 70%)' }}
                />
                <div
                  className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-15"
                  style={{ background: 'radial-gradient(circle, #0FE3C2 0%, transparent 70%)' }}
                />
              </div>

              <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                  Experience Generative UI
                </h2>
                <p className="text-xl text-text-secondary max-w-xl mx-auto mb-10">
                  See how the AI dynamically renders components based on what you say.
                  <br />
                  Built with Tambo for the Generative UI Hackathon.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/chat"
                    className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-10 text-base font-semibold text-bg-primary transition-all duration-300 hover:bg-accent-hover hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(15,227,194,0.35)]"
                  >
                    <span>Try the Chat Interface</span>
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/builder"
                    className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border-subtle px-10 text-base font-medium text-text-primary hover:border-accent/50 hover:bg-accent/5 transition-all"
                  >
                    Explore UI Builder
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle/50 py-12">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <Logo size="sm" />

              <div className="flex items-center gap-6 text-sm text-text-muted">
                <Link href="/chat" className="hover:text-text-primary transition-colors">
                  Chat
                </Link>
                <Link href="/builder" className="hover:text-text-primary transition-colors">
                  Builder
                </Link>
                <Link href="/agents" className="hover:text-text-primary transition-colors">
                  Agents
                </Link>
                <Link href="/tools" className="hover:text-text-primary transition-colors">
                  Tools
                </Link>
                <Link href="/docs" className="hover:text-text-primary transition-colors">
                  Docs
                </Link>
              </div>

              <div className="text-center md:text-right">
                <p className="text-xs text-text-muted font-mono">
                  Built for The UI Strikes Back Hackathon
                </p>
                <p className="text-xs text-accent mt-1">
                  Powered by Tambo Generative UI SDK
                </p>
              </div>
            </div>
          </div>
        </footer>

        <ToastContainer />
      </div>
    </div>
  );
}
