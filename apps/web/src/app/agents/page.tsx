'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bot, Plus, Sparkles } from 'lucide-react';
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
    router.push('/');
  };

  const filteredAgents = activeTab === 'builtin'
    ? builtinAgents
    : activeTab === 'custom'
    ? myAgents
    : agents;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/20 rounded-xl">
              <Bot className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">AI Agents</h1>
              <p className="text-sm text-text-secondary">
                Choose a specialized agent for your tasks
              </p>
            </div>
          </div>

          <Link
            href="/agents/new"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-bg-primary rounded-lg hover:bg-accent-hover transition-all font-medium hover:shadow-glow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create Agent
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border-subtle overflow-x-auto">
          {[
            { id: 'all', label: 'All Agents', count: agents.length },
            { id: 'builtin', label: 'Built-in', count: builtinAgents.length },
            { id: 'custom', label: 'My Agents', count: myAgents.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'builtin' | 'custom')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.id === 'builtin' && <Sparkles className="w-4 h-4" />}
              {tab.label}
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id
                  ? 'bg-accent/20 text-accent'
                  : 'bg-bg-elevated text-text-muted'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" variant="primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {activeTab === 'custom' ? 'No custom agents yet' : 'No agents available'}
            </h3>
            <p className="text-text-muted mb-6">
              {activeTab === 'custom'
                ? 'Create your first custom agent to get started'
                : 'Agents will appear here'}
            </p>
            {activeTab === 'custom' && (
              <Link
                href="/agents/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-bg-primary rounded-lg hover:bg-accent-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Agent
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onUse={handleUseAgent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
