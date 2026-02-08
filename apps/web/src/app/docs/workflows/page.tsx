export default function WorkflowsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Workflows</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Understanding execution plans and the preview → confirm → execute pipeline.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Execution Flow</h2>
      <div className="space-y-4 mb-8">
        {[
          {
            step: '1',
            title: 'User Input',
            description: 'User describes their task in natural language.',
            example: '"Deploy staging and notify the team on Slack"',
          },
          {
            step: '2',
            title: 'Plan Generation',
            description: 'AI generates an execution plan with tool calls and risk assessments.',
            example: 'deploy_staging (LOW) → run_health_check (LOW) → post_slack_message (LOW)',
          },
          {
            step: '3',
            title: 'Review & Confirm',
            description: 'User reviews the plan. High-risk actions require typed confirmation.',
            example: 'Intent token generated, expires in 5 minutes',
          },
          {
            step: '4',
            title: 'Execution',
            description: 'Tools execute sequentially with real-time progress updates.',
            example: 'WebSocket streams logs and status for each step',
          },
        ].map((item) => (
          <div key={item.step} className="flex gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
              {item.step}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-1">{item.title}</h3>
              <p className="text-text-secondary text-sm mb-2">{item.description}</p>
              <code className="text-xs text-accent bg-accent/10 px-2 py-1 rounded">{item.example}</code>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Risk Levels</h2>
      <div className="space-y-3 mb-8">
        {[
          { level: 'LOW', color: 'text-green-400 bg-green-500/10 border-green-500/20', description: 'Safe operations like reading data or sending notifications' },
          { level: 'MEDIUM', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', description: 'Operations that modify state but are reversible' },
          { level: 'HIGH', color: 'text-red-400 bg-red-500/10 border-red-500/20', description: 'Destructive operations requiring typed confirmation' },
        ].map((risk) => (
          <div key={risk.level} className="flex items-center gap-4 p-4 rounded-xl border border-border-subtle bg-bg-surface">
            <span className={`px-3 py-1 text-sm font-bold rounded-lg border ${risk.color}`}>
              {risk.level}
            </span>
            <p className="text-text-secondary text-sm">{risk.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Intent Tokens</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Every execution plan generates an intent token that expires in 5 minutes. This prevents
        stale confirmations and ensures users are approving recent plans.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Confirm Execution</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`POST /api/confirm/:executionId
{
  "confirmed": true,
  "intentToken": "token-from-execute-response"
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Real-time Updates</h2>
      <p className="text-text-secondary leading-relaxed">
        During execution, the frontend receives real-time updates via WebSocket. Each tool's
        progress, output, and status are streamed as they happen.
      </p>
    </div>
  );
}
