export default function APIPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">REST API Reference</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Complete API documentation for the Opsuna backend.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Authentication</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        All API requests require a Bearer token from Supabase Auth.
      </p>
      <div className="p-4 rounded-xl border border-border-subtle bg-bg-surface mb-8 font-mono text-sm">
        <span className="text-text-muted">Authorization:</span>{' '}
        <span className="text-accent">Bearer YOUR_SUPABASE_TOKEN</span>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Executions</h2>
      <div className="space-y-4 mb-8">
        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-400">POST</span>
            <code className="text-text-primary font-mono">/api/execute</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm mb-3">Generate an execution plan from natural language.</p>
            <pre className="p-3 rounded-lg bg-bg-elevated text-sm overflow-x-auto">
              <code className="text-text-muted font-mono">{`// Request
{ "prompt": "Deploy staging", "agentId": "optional" }

// Response
{ "executionId": "...", "plan": {...}, "intentToken": "..." }`}</code>
            </pre>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-400">POST</span>
            <code className="text-text-primary font-mono">/api/confirm/:id</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm mb-3">Confirm and start execution.</p>
            <pre className="p-3 rounded-lg bg-bg-elevated text-sm overflow-x-auto">
              <code className="text-text-muted font-mono">{`// Request
{ "confirmed": true, "intentToken": "..." }

// Response
{ "message": "Execution started" }`}</code>
            </pre>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-400">GET</span>
            <code className="text-text-primary font-mono">/api/executions</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm">List execution history for the current user.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Agents</h2>
      <div className="space-y-4 mb-8">
        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-400">GET</span>
            <code className="text-text-primary font-mono">/api/agents</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm">List all agents (built-in + custom).</p>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-400">POST</span>
            <code className="text-text-primary font-mono">/api/agents</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm mb-3">Create a custom agent.</p>
            <pre className="p-3 rounded-lg bg-bg-elevated text-sm overflow-x-auto">
              <code className="text-text-muted font-mono">{`{
  "name": "My Agent",
  "description": "...",
  "toolNames": ["tool1", "tool2"],
  "systemPrompt": "...",
  "memoryScope": "custom"
}`}</code>
            </pre>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Tools</h2>
      <div className="space-y-4 mb-8">
        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-400">GET</span>
            <code className="text-text-primary font-mono">/api/tools</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm">List all available tools.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-400">POST</span>
            <code className="text-text-primary font-mono">/api/tools/composio/connect</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm">Initiate OAuth connection for Composio tool.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Memory</h2>
      <div className="space-y-4">
        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-400">GET</span>
            <code className="text-text-primary font-mono">/api/memory/search?query=...</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm">Semantic search across past executions.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-400">GET</span>
            <code className="text-text-primary font-mono">/api/memory/history</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm">Get conversation history.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border-subtle">
            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-500/10 text-blue-400">GET</span>
            <code className="text-text-primary font-mono">/api/memory/patterns</code>
          </div>
          <div className="p-4">
            <p className="text-text-secondary text-sm">Get tool usage patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
