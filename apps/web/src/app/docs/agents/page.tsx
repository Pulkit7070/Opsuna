export default function AgentsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">AI Agents</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Create specialized AI agents with custom tools, memory scopes, and behaviors.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">What are Agents?</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Agents are specialized AI personas that have access to specific tools and isolated memory.
        Each agent can focus on a particular domain like research, data analysis, or DevOps.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Built-in Agents</h2>
      <div className="space-y-4 mb-8">
        {[
          {
            name: 'Deep Research',
            description: 'Specializes in web search, data synthesis, and report generation.',
            tools: ['web_search', 'synthesize_data', 'generate_report'],
          },
          {
            name: 'Data Analyst',
            description: 'Query databases, generate visualizations, and analyze trends.',
            tools: ['query_database', 'create_chart', 'analyze_trends'],
          },
          {
            name: 'DevOps Engineer',
            description: 'Handle deployments, CI/CD, and infrastructure management.',
            tools: ['deploy_staging', 'run_tests', 'post_slack_message'],
          },
        ].map((agent) => (
          <div key={agent.name} className="p-6 rounded-xl border border-border-subtle bg-bg-surface">
            <h3 className="text-lg font-semibold text-text-primary mb-2">{agent.name}</h3>
            <p className="text-text-secondary text-sm mb-3">{agent.description}</p>
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <span key={tool} className="px-2 py-1 text-xs rounded-lg bg-accent/10 text-accent font-mono">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Creating Custom Agents</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        You can create custom agents with specific tool sets and memory scopes.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Create Agent API</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`POST /api/agents
{
  "name": "Security Auditor",
  "description": "Analyzes code for security vulnerabilities",
  "toolNames": ["scan_code", "check_dependencies", "generate_report"],
  "systemPrompt": "You are a security expert...",
  "memoryScope": "security"
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Agent Properties</h2>
      <ul className="space-y-3 text-text-secondary">
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">name</strong> — Display name for the agent</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">description</strong> — What the agent specializes in</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">toolNames</strong> — Array of tools the agent can use</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">systemPrompt</strong> — Custom instructions for the AI</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">memoryScope</strong> — Isolated memory namespace</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Memory Isolation</h2>
      <p className="text-text-secondary leading-relaxed">
        Each agent can have its own memory scope. This means the DevOps agent won't see memories from
        the Research agent, providing data isolation and context-appropriate suggestions.
      </p>
    </div>
  );
}
