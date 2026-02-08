export default function BuildingAgentPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Building an Agent</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Step-by-step guide to creating a custom AI agent.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Step 1: Define the Purpose</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        First, decide what your agent will specialize in. Good agents have a clear focus:
      </p>
      <ul className="space-y-2 text-text-secondary mb-8">
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">Security Auditor</strong> — Scans code and dependencies for vulnerabilities</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">Release Manager</strong> — Handles versioning, changelogs, and releases</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">Documentation Bot</strong> — Generates and updates documentation</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Step 2: Select Tools</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Choose the tools your agent needs. Less is more — focused agents perform better.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Example: Security Auditor Tools</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`const securityTools = [
  "scan_code",           // Scan source code
  "check_dependencies",  // Audit package.json
  "search_cve",          // Search CVE database
  "generate_report"      // Create security report
];`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Step 3: Write the System Prompt</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        The system prompt shapes how the agent behaves. Be specific about its role and constraints.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Example System Prompt</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm whitespace-pre-wrap">
          <code className="text-text-secondary font-mono">{`You are a Security Auditor agent specialized in finding vulnerabilities.

RESPONSIBILITIES:
- Analyze code for security issues (XSS, SQL injection, etc.)
- Check dependencies for known vulnerabilities
- Generate detailed security reports

CONSTRAINTS:
- Never modify code, only analyze
- Always explain findings in plain English
- Prioritize HIGH severity issues first`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Step 4: Create the Agent</h2>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">API Request</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`POST /api/agents
{
  "name": "Security Auditor",
  "description": "Analyzes code and dependencies for security vulnerabilities",
  "toolNames": ["scan_code", "check_dependencies", "search_cve", "generate_report"],
  "systemPrompt": "You are a Security Auditor agent...",
  "memoryScope": "security"
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Step 5: Test the Agent</h2>
      <ol className="space-y-3 text-text-secondary">
        <li className="flex gap-3">
          <span className="text-accent font-bold">1.</span>
          <span>Select your new agent in the Chat interface</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">2.</span>
          <span>Try prompts related to its specialty</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">3.</span>
          <span>Verify it uses the correct tools</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">4.</span>
          <span>Refine the system prompt based on results</span>
        </li>
      </ol>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Best Practices</h2>
      <ul className="space-y-2 text-text-secondary">
        <li className="flex gap-3">
          <span className="text-accent">✓</span>
          <span>Keep agents focused on one domain</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">✓</span>
          <span>Use descriptive names and descriptions</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">✓</span>
          <span>Limit tools to what's necessary</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">✓</span>
          <span>Use memory scopes for data isolation</span>
        </li>
      </ul>
    </div>
  );
}
