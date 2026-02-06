'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bot, Plus, Sparkles, ArrowLeft } from 'lucide-react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { useAgentsStore } from '@/store/agents';
import { AgentCard } from '@/components/AgentCard';
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-100 flex items-center gap-3">
                <div className="p-3 bg-[#D4AF37]/20 rounded-xl">
                  <Bot className="w-8 h-8 text-[#D4AF37]" />
                </div>
                AI Agents
              </h1>
              <p className="text-neutral-400 mt-2">
                Choose a specialized agent to help with your tasks
              </p>
            </div>

            <Link
              href="/agents/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-neutral-900 rounded-lg hover:bg-[#D4AF37]/90 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Agent
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-800">
          {[
            { id: 'all', label: 'All Agents', count: agents.length },
            { id: 'builtin', label: 'Built-in', count: builtinAgents.length },
            { id: 'custom', label: 'My Agents', count: myAgents.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'builtin' | 'custom')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#D4AF37]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.id === 'builtin' && <Sparkles className="w-4 h-4" />}
              {tab.label}
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                  : 'bg-neutral-800 text-neutral-500'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500">
              {activeTab === 'custom'
                ? 'No custom agents yet. Create your first agent!'
                : 'No agents available'}
            </p>
            {activeTab === 'custom' && (
              <Link
                href="/agents/new"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Agent
              </Link>
            )}
          </div>
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
