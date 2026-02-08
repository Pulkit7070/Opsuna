'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bot, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { useAgentsStore } from '@/store/agents';
import { AgentCard } from '@/components/AgentCard';
import { Spinner } from '@/components/ui/spinner';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

export default function AgentsPage() {
  const router = useRouter();
  const { agents, builtinAgents, myAgents, loading, error } = useAgents();
  const { setSelectedAgent } = useAgentsStore();
  const [activeTab, setActiveTab] = useState<'all' | 'builtin' | 'custom'>('all');

  const handleUseAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    router.push('/chat');
  };

  const filteredAgents = activeTab === 'builtin'
    ? builtinAgents
    : activeTab === 'custom'
    ? myAgents
    : agents;

  return (
    <div className="min-h-screen bg-bg-primary relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      <Navigation />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl border border-accent/20"
            >
              <Bot className="w-8 h-8 text-accent" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                AI <span className="text-accent">Agents</span>
              </h1>
              <p className="text-text-secondary mt-1">
                Specialized agents for your tasks
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/agents/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-bg-primary rounded-xl hover:bg-accent-hover transition-all font-medium hover:shadow-glow active:scale-95 group"
            >
              <Plus className="w-5 h-5" />
              Create Agent
              <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1 mb-8 p-1 bg-bg-surface/50 rounded-xl border border-border-subtle w-fit"
        >
          {[
            { id: 'all', label: 'All Agents', count: agents.length },
            { id: 'builtin', label: 'Built-in', count: builtinAgents.length, icon: Sparkles },
            { id: 'custom', label: 'My Agents', count: myAgents.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'builtin' | 'custom')}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'text-bg-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeAgentTab"
                    className="absolute inset-0 bg-accent rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {tab.label}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-bg-primary/20 text-bg-primary'
                      : 'bg-bg-elevated text-text-muted'
                  }`}>
                    {tab.count}
                  </span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" variant="primary" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          </motion.div>
        ) : filteredAgents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto mb-6 border border-accent/20">
              <Bot className="w-12 h-12 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-3">
              {activeTab === 'custom' ? 'No custom agents yet' : 'No agents available'}
            </h3>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              {activeTab === 'custom'
                ? 'Create your first custom agent to get started. Agents can be specialized for specific tasks.'
                : 'Agents will appear here when available.'}
            </p>
            {activeTab === 'custom' && (
              <Link
                href="/agents/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-bg-primary rounded-xl hover:bg-accent-hover transition-all font-medium hover:shadow-glow"
              >
                <Plus className="w-5 h-5" />
                Create Your First Agent
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AgentCard
                    agent={agent}
                    onUse={handleUseAgent}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
