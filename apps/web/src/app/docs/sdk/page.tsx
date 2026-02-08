export default function SDKPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Client SDK</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Use the Opsuna client to integrate with your frontend.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">API Client</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        The API client handles authentication and makes requests to the Opsuna backend.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">lib/api/client.ts</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`import { createClient } from '@/lib/supabase/client';

export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token && {
      'Authorization': \`Bearer \${session.access_token}\`
    }),
    ...options.headers,
  };

  const response = await fetch(
    \`\${process.env.NEXT_PUBLIC_API_URL}\${endpoint}\`,
    { ...options, headers }
  );

  if (!response.ok) {
    throw new Error(\`API error: \${response.statusText}\`);
  }

  return response.json();
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Execute Hook</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        The useExecution hook manages the execution lifecycle.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">hooks/useExecution.ts</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`import { useExecution } from '@/hooks/useExecution';

function MyComponent() {
  const {
    prompt,
    setPrompt,
    submitPrompt,
    status,         // 'idle' | 'planning' | 'confirming' | 'executing' | 'done'
    plan,           // ExecutionPlan from AI
    results,        // Tool execution results
    error,
    confirm,        // Confirm execution
    cancel,         // Cancel execution
    reset,          // Reset state
  } = useExecution();

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={submitPrompt}>Execute</button>

      {status === 'confirming' && (
        <button onClick={confirm}>Confirm Plan</button>
      )}
    </div>
  );
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">WebSocket Hook</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Real-time updates during execution.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">hooks/useWebSocket.ts</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`import { useWebSocket } from '@/hooks/useWebSocket';

function StatusIndicator() {
  const { isConnected } = useWebSocket();

  return (
    <div className={isConnected ? 'bg-green-500' : 'bg-gray-500'}>
      {isConnected ? 'Connected' : 'Offline'}
    </div>
  );
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Agents Hook</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Manage and select AI agents.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">hooks/useAgents.ts</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`import { useAgents } from '@/hooks/useAgents';

function AgentSelector() {
  const {
    agents,         // List of available agents
    isLoading,
    selectedAgent,  // Currently selected agent
    selectAgent,    // Select an agent
  } = useAgents();

  return (
    <select onChange={(e) => selectAgent(e.target.value)}>
      {agents.map(agent => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
    </select>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
