'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bot, Save, Wrench, Brain, Eye, EyeOff } from 'lucide-react';
import { useAgents, AgentCreateInput, MemoryScope } from '@/hooks/useAgents';
import { useTools } from '@/hooks/useTools';
import { Spinner } from '@/components/ui/spinner';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

export default function NewAgentPage() {
  const router = useRouter();
  const { createAgent, loading, error } = useAgents();
  const { allTools } = useTools();

  const [formData, setFormData] = useState<AgentCreateInput>({
    name: '',
    description: '',
    systemPrompt: '',
    toolNames: [],
    memoryScope: 'shared',
    isPublic: false,
  });

  const [showPrompt, setShowPrompt] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.systemPrompt) {
      return;
    }

    const agent = await createAgent(formData);
    if (agent) {
      router.push('/agents');
    }
  };

  const handleToolToggle = (toolName: string) => {
    setFormData((prev) => ({
      ...prev,
      toolNames: prev.toolNames.includes(toolName)
        ? prev.toolNames.filter((t) => t !== toolName)
        : [...prev.toolNames, toolName],
    }));
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-accent/20 rounded-xl">
            <Bot className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Create Agent</h1>
            <p className="text-sm text-text-secondary">
              Design a custom AI agent with specific capabilities
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 space-y-4"
          >
            <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" />
              Basic Information
            </h2>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Agent Name <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Assistant"
                className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Description <span className="text-accent">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this agent does..."
                rows={3}
                className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none transition-all"
                required
              />
            </div>
          </motion.div>

          {/* System Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                System Prompt
              </h2>
              <button
                type="button"
                onClick={() => setShowPrompt(!showPrompt)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                {showPrompt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="Define the agent's personality, capabilities, and behavior..."
                  rows={10}
                  className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none font-mono text-sm transition-all"
                  required
                />
                <p className="text-xs text-text-muted mt-2">
                  This prompt defines how the agent behaves and responds.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 space-y-4"
          >
            <h2 className="text-lg font-medium text-text-primary flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent" />
              Available Tools
              <span className="text-sm text-text-muted font-normal ml-2">
                ({formData.toolNames.length || 'All'} selected)
              </span>
            </h2>

            <p className="text-sm text-text-secondary">
              Select which tools this agent can use. Leave empty for all tools.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {allTools.map((tool) => (
                <label
                  key={tool.name}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    formData.toolNames.includes(tool.name)
                      ? 'bg-accent/10 border border-accent/30'
                      : 'bg-bg-elevated border border-transparent hover:bg-bg-surface hover:border-border-subtle'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.toolNames.includes(tool.name)}
                    onChange={() => handleToolToggle(tool.name)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    formData.toolNames.includes(tool.name)
                      ? 'bg-accent border-accent'
                      : 'border-border-subtle'
                  }`}>
                    {formData.toolNames.includes(tool.name) && (
                      <svg className="w-2.5 h-2.5 text-bg-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-text-secondary truncate">{tool.name}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 space-y-4"
          >
            <h2 className="text-lg font-medium text-text-primary">Settings</h2>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Memory Scope
              </label>
              <select
                value={formData.memoryScope}
                onChange={(e) => setFormData({ ...formData, memoryScope: e.target.value as MemoryScope })}
                className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              >
                <option value="shared">Shared - Access all memories</option>
                <option value="isolated">Isolated - Only agent-specific memories</option>
                <option value="none">None - No memory access</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-bg-elevated transition-colors">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                formData.isPublic
                  ? 'bg-accent border-accent'
                  : 'border-border-subtle'
              }`}>
                {formData.isPublic && (
                  <svg className="w-3 h-3 text-bg-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-text-secondary">Make this agent public</span>
            </label>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-end gap-4 pt-4"
          >
            <Link
              href="/agents"
              className="px-6 py-3 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-elevated"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.description || !formData.systemPrompt}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-bg-primary rounded-lg hover:bg-accent-hover transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow active:scale-95"
            >
              {loading ? (
                <>
                  <Spinner size="sm" variant="default" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Agent
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
