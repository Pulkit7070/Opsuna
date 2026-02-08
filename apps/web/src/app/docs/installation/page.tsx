export default function InstallationPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Installation</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Get Opsuna up and running in under 5 minutes.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Prerequisites</h2>
      <ul className="space-y-2 text-text-secondary mb-8">
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Node.js 18 or higher</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>pnpm 8.15 or higher</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Supabase account (free tier works)</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent">•</span>
          <span>Google AI API Key for Gemini</span>
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Quick Start</h2>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Terminal</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`# Clone the repository
git clone https://github.com/Pulkit7070/Opsuna.git
cd opsuna_tambo

# Install dependencies
pnpm install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.local.example apps/web/.env.local

# Initialize database
pnpm db:generate
pnpm db:push

# Start development servers
pnpm dev`}</code>
        </pre>
      </div>

      <p className="text-text-secondary mb-4">
        Visit <code className="px-2 py-1 rounded bg-bg-surface text-accent">http://localhost:3000</code> to see the app.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Environment Variables</h2>

      <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">Server (apps/server/.env)</h3>
      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`DATABASE_URL=          # Supabase PostgreSQL connection
DIRECT_URL=            # Supabase direct connection
SUPABASE_URL=          # Supabase project URL
SUPABASE_ANON_KEY=     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=  # Supabase service role key
GEMINI_API_KEY=        # Google AI API key
COMPOSIO_API_KEY=      # Optional: Composio for tools`}</code>
        </pre>
      </div>

      <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">Web (apps/web/.env.local)</h3>
      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anonymous key`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Development Mode</h2>
      <p className="text-text-secondary leading-relaxed">
        Without API keys configured, Opsuna runs in <strong className="text-text-primary">dev mode</strong> with mock AI responses and authentication.
        This is perfect for exploring the UI and understanding how Generative UI works.
      </p>
    </div>
  );
}
