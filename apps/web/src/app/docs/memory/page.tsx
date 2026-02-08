export default function MemoryPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Semantic Memory</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        AI learns from past executions using vector embeddings for smarter suggestions.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">How Memory Works</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Opsuna uses <strong className="text-text-primary">pgvector</strong> in Supabase to store
        semantic embeddings of conversations and tool outcomes. This enables:
      </p>
      <ul className="space-y-2 text-text-secondary mb-8">
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Similarity search across past executions</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Context-aware suggestions based on previous actions</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Learning from successful and failed patterns</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Memory Types</h2>
      <div className="space-y-4 mb-8">
        <div className="p-6 rounded-xl border border-border-subtle bg-bg-surface">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Conversation Messages</h3>
          <p className="text-text-secondary text-sm">
            User prompts and AI responses are stored with vector embeddings for semantic search.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-border-subtle bg-bg-surface">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Tool Outcomes</h3>
          <p className="text-text-secondary text-sm">
            Results of tool executions are stored to learn which tools work best for which tasks.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-border-subtle bg-bg-surface">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Execution Patterns</h3>
          <p className="text-text-secondary text-sm">
            Common sequences of tools are identified and suggested for similar future tasks.
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Embeddings</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Embeddings are generated using Google's <code className="px-2 py-1 rounded bg-bg-surface text-accent">text-embedding-004</code> model
        with 768 dimensions. This enables:
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Semantic Search Example</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`// Search for similar past executions
GET /api/memory/search?query=deploy+staging

// Returns semantically similar memories
{
  "memories": [
    {
      "content": "Deployed staging environment successfully",
      "similarity": 0.92,
      "toolsUsed": ["deploy_staging", "run_health_check"]
    }
  ]
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Memory Scopes</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Agents can have isolated memory scopes. This means:
      </p>
      <ul className="space-y-2 text-text-secondary">
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>DevOps agent only sees DevOps-related memories</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Research agent has its own isolated context</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>User memories are never shared between users</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">API Endpoints</h2>
      <div className="space-y-3">
        {[
          { method: 'GET', path: '/api/memory/search', description: 'Semantic search' },
          { method: 'GET', path: '/api/memory/history', description: 'Conversation history' },
          { method: 'GET', path: '/api/memory/patterns', description: 'Tool usage patterns' },
          { method: 'GET', path: '/api/memory/context', description: 'Build context for AI' },
        ].map((endpoint) => (
          <div key={endpoint.path} className="flex items-center gap-4 p-3 rounded-lg border border-border-subtle bg-bg-surface">
            <span className="px-2 py-1 text-xs font-bold rounded bg-accent/10 text-accent">{endpoint.method}</span>
            <code className="text-text-primary font-mono text-sm">{endpoint.path}</code>
            <span className="text-text-muted text-sm ml-auto">{endpoint.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
