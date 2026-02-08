export default function ToolsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Tools & Integrations</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Connect 300+ external tools via Composio or create custom local tools.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Tool Types</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-6 rounded-xl border border-border-subtle bg-bg-surface">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Local Tools</h3>
          <p className="text-text-secondary text-sm mb-3">
            Built-in tools that run on your server. No external API required.
          </p>
          <div className="flex flex-wrap gap-2">
            {['deploy_staging', 'run_tests', 'analyze_codebase', 'create_chart'].map((tool) => (
              <span key={tool} className="px-2 py-1 text-xs rounded-lg bg-bg-elevated border border-border-subtle font-mono text-text-muted">
                {tool}
              </span>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-xl border border-border-subtle bg-bg-surface">
          <h3 className="text-lg font-semibold text-text-primary mb-2">Composio Tools</h3>
          <p className="text-text-secondary text-sm mb-3">
            300+ external integrations via OAuth. GitHub, Slack, Jira, and more.
          </p>
          <div className="flex flex-wrap gap-2">
            {['GitHub', 'Slack', 'Jira', 'Linear', 'Notion'].map((tool) => (
              <span key={tool} className="px-2 py-1 text-xs rounded-lg bg-accent/10 text-accent font-mono">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Built-in Tools</h2>
      <div className="space-y-3 mb-8">
        {[
          { name: 'deploy_staging', description: 'Deploy the staging environment', risk: 'MEDIUM' },
          { name: 'run_smoke_tests', description: 'Run smoke tests against staging', risk: 'LOW' },
          { name: 'create_github_pr', description: 'Create a GitHub pull request', risk: 'MEDIUM' },
          { name: 'post_slack_message', description: 'Send a message to Slack', risk: 'LOW' },
          { name: 'analyze_codebase', description: 'Generate architecture diagrams', risk: 'LOW' },
          { name: 'create_chart', description: 'Create data visualizations', risk: 'LOW' },
        ].map((tool) => (
          <div key={tool.name} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-surface">
            <div>
              <code className="text-accent font-mono">{tool.name}</code>
              <p className="text-text-muted text-sm mt-1">{tool.description}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-lg border ${
              tool.risk === 'LOW' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
              tool.risk === 'MEDIUM' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
              'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {tool.risk}
            </span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Connecting Composio Tools</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Connect external tools via OAuth on the Tools page. Once connected, the AI can use them
        in execution plans.
      </p>

      <ol className="space-y-3 text-text-secondary mb-8">
        <li className="flex gap-3">
          <span className="text-accent font-bold">1.</span>
          <span>Navigate to the Tools page</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">2.</span>
          <span>Find the tool you want to connect</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">3.</span>
          <span>Click "Connect" and complete OAuth authorization</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">4.</span>
          <span>The tool is now available in your execution plans</span>
        </li>
      </ol>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Tool Sandboxing</h2>
      <p className="text-text-secondary leading-relaxed">
        All tools run in a sandboxed environment with:
      </p>
      <ul className="space-y-2 text-text-secondary mt-4">
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>30-second execution timeout</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>1MB output limit</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Per-user rate limiting</span>
        </li>
      </ul>
    </div>
  );
}
