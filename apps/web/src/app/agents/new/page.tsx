'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Save, Wrench, Brain, Eye, EyeOff } from 'lucide-react';
import { useAgents, AgentCreateInput, MemoryScope } from '@/hooks/useAgents';
import { useTools } from '@/hooks/useTools';
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/agents"
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </Link>

          <h1 className="text-3xl font-bold text-neutral-100 flex items-center gap-3">
            <div className="p-3 bg-[#D4AF37]/20 rounded-xl">
              <Bot className="w-8 h-8 text-[#D4AF37]" />
            </div>
            Create Agent
          </h1>
          <p className="text-neutral-400 mt-2">
            Design a custom AI agent with specific capabilities
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-neutral-200 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#D4AF37]" />
              Basic Information
            </h2>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Assistant"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this agent does..."
                rows={3}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                required
              />
            </div>
          </div>

          {/* System Prompt */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-neutral-200 flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#D4AF37]" />
                System Prompt
              </h2>
              <button
                type="button"
                onClick={() => setShowPrompt(!showPrompt)}
                className="text-neutral-400 hover:text-neutral-200"
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
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]/50 resize-none font-mono text-sm"
                  required
                />
                <p className="text-xs text-neutral-500 mt-2">
                  This prompt defines how the agent behaves and responds.
                </p>
              </motion.div>
            )}
          </div>

          {/* Tools */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-neutral-200 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#D4AF37]" />
              Available Tools
              <span className="text-sm text-neutral-500 font-normal">
                ({formData.toolNames.length || 'All'} selected)
              </span>
            </h2>

            <p className="text-sm text-neutral-400">
              Select which tools this agent can use. Leave empty for all tools.
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {allTools.map((tool) => (
                <label
                  key={tool.name}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    formData.toolNames.includes(tool.name)
                      ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                      : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.toolNames.includes(tool.name)}
                    onChange={() => handleToolToggle(tool.name)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    formData.toolNames.includes(tool.name)
                      ? 'bg-[#D4AF37] border-[#D4AF37]'
                      : 'border-neutral-600'
                  }`}>
                    {formData.toolNames.includes(tool.name) && (
                      <svg className="w-3 h-3 text-neutral-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-neutral-300 truncate">{tool.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-medium text-neutral-200">Settings</h2>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Memory Scope
              </label>
              <select
                value={formData.memoryScope}
                onChange={(e) => setFormData({ ...formData, memoryScope: e.target.value as MemoryScope })}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-[#D4AF37]/50"
              >
                <option value="shared">Shared - Access all memories</option>
                <option value="isolated">Isolated - Only agent-specific memories</option>
                <option value="none">None - No memory access</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                formData.isPublic
                  ? 'bg-[#D4AF37] border-[#D4AF37]'
                  : 'border-neutral-600'
              }`}>
                {formData.isPublic && (
                  <svg className="w-3 h-3 text-neutral-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-neutral-300">Make this agent public</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/agents"
              className="px-6 py-3 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.description || !formData.systemPrompt}
              className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-neutral-900 rounded-lg hover:bg-[#D4AF37]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
