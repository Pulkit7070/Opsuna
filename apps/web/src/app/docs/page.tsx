import Link from 'next/link';

export default function DocsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">
        Welcome to Opsuna
      </h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Opsuna is a Generative UI platform built with Tambo SDK. Describe your task in natural language,
        and the AI decides which components to render dynamically.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <Link
          href="/docs/installation"
          className="group p-6 rounded-xl border border-border-subtle bg-bg-surface hover:border-accent/50 transition-all"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
            Quick Start
          </h3>
          <p className="text-sm text-text-muted">
            Get up and running with Opsuna in under 5 minutes.
          </p>
        </Link>

        <Link
          href="/docs/architecture"
          className="group p-6 rounded-xl border border-border-subtle bg-bg-surface hover:border-accent/50 transition-all"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
            Architecture
          </h3>
          <p className="text-sm text-text-muted">
            Understand how Opsuna and Tambo work together.
          </p>
        </Link>

        <Link
          href="/docs/agents"
          className="group p-6 rounded-xl border border-border-subtle bg-bg-surface hover:border-accent/50 transition-all"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
            AI Agents
          </h3>
          <p className="text-sm text-text-muted">
            Create specialized agents with custom tools and memory.
          </p>
        </Link>

        <Link
          href="/docs/tools"
          className="group p-6 rounded-xl border border-border-subtle bg-bg-surface hover:border-accent/50 transition-all"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
            Tools & Integrations
          </h3>
          <p className="text-sm text-text-muted">
            Connect 300+ tools via Composio or create custom ones.
          </p>
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-12 mb-4">What is Generative UI?</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Generative UI is a paradigm where the AI decides which UI components to render based on
        natural language conversations. Instead of users navigating through static interfaces,
        the UI dynamically adapts to show exactly what they need.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface p-6 my-8">
        <p className="text-sm text-text-muted mb-4">Example conversation:</p>
        <div className="space-y-4 font-mono text-sm">
          <div className="flex gap-3">
            <span className="text-accent">User:</span>
            <span className="text-text-primary">"Deploy staging and notify the team"</span>
          </div>
          <div className="flex gap-3">
            <span className="text-cyan-400">AI:</span>
            <span className="text-text-secondary">Renders ExecutionPlan component with steps</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-12 mb-4">Key Features</h2>
      <ul className="space-y-3 text-text-secondary">
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">Natural Language Commands</strong> — Describe what you want in plain English</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">Dynamic Component Rendering</strong> — AI chooses the right component</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">Risk Assessment</strong> — Every action is classified before execution</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">Semantic Memory</strong> — AI learns from past executions</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span><strong className="text-text-primary">300+ Integrations</strong> — Connect GitHub, Slack, Jira via Composio</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-text-primary mt-12 mb-4">Built with Tambo</h2>
      <p className="text-text-secondary leading-relaxed">
        Opsuna is built with <strong className="text-text-primary">Tambo</strong>, a Generative UI SDK for React.
        Register your components, and the AI decides which ones to render based on natural language.
        Users shouldn't have to learn your app — Generative UI shows the right components based on what someone is trying to do.
      </p>
    </div>
  );
}
