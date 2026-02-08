export default function DeploymentPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Deployment</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Deploy Opsuna to production with Vercel and Supabase.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Architecture</h2>
      <div className="p-6 rounded-xl border border-border-subtle bg-bg-surface mb-8">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Frontend</h3>
            <p className="text-accent font-mono">Vercel</p>
            <p className="text-sm text-text-muted mt-1">Next.js App</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Backend</h3>
            <p className="text-accent font-mono">Railway / Render</p>
            <p className="text-sm text-text-muted mt-1">Express API</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Database</h3>
            <p className="text-accent font-mono">Supabase</p>
            <p className="text-sm text-text-muted mt-1">PostgreSQL + pgvector</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">1. Supabase Setup</h2>
      <ol className="space-y-3 text-text-secondary mb-8">
        <li className="flex gap-3">
          <span className="text-accent font-bold">1.</span>
          <span>Create a new Supabase project</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">2.</span>
          <span>Enable pgvector extension in Database → Extensions</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">3.</span>
          <span>Copy the connection strings from Settings → Database</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">4.</span>
          <span>Run <code className="px-2 py-1 rounded bg-bg-surface text-accent">pnpm db:push</code> to create tables</span>
        </li>
      </ol>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">2. Deploy Backend</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Deploy the Express server to Railway, Render, or any Node.js host.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Environment Variables</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
COMPOSIO_API_KEY=xxx  # Optional`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">3. Deploy Frontend</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Deploy the Next.js app to Vercel.
      </p>

      <ol className="space-y-3 text-text-secondary mb-8">
        <li className="flex gap-3">
          <span className="text-accent font-bold">1.</span>
          <span>Push your code to GitHub</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">2.</span>
          <span>Import the repo in Vercel</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">3.</span>
          <span>Set the root directory to <code className="px-2 py-1 rounded bg-bg-surface text-accent">apps/web</code></span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent font-bold">4.</span>
          <span>Add environment variables</span>
        </li>
      </ol>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Vercel Environment Variables</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">4. Configure CORS</h2>
      <p className="text-text-secondary leading-relaxed">
        Update the backend CORS settings to allow your Vercel domain:
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mt-4">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">CORS Configuration</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`// apps/server/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ]
}));`}</code>
        </pre>
      </div>
    </div>
  );
}
