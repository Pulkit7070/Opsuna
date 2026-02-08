export default function CustomToolsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-text-primary mb-4">Custom Tools</h1>
      <p className="text-xl text-text-secondary mb-8 leading-relaxed">
        Create your own tools that the AI can use in execution plans.
      </p>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Tool Structure</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Every tool is a TypeScript function that returns a standard result format.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Tool Implementation</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`// apps/server/src/services/tools/implementations/my_tool.ts

import { ToolResult, ToolLog } from '@opsuna/shared';

export async function myCustomTool(
  callId: string,
  params: Record<string, unknown>,
  onLog: (log: ToolLog) => void,
  userId?: string
): Promise<ToolResult> {
  // Log progress
  onLog({
    level: 'info',
    message: 'Starting custom tool...'
  });

  try {
    // Your tool logic here
    const result = await doSomething(params);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'TOOL_ERROR',
        message: error.message
      }
    };
  }
}`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Register the Tool</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Add your tool to the registry so the AI knows about it.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Tool Registration</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`// apps/server/src/services/tools/registry.ts

import { myCustomTool } from './implementations/my_tool';

toolRegistry.register({
  name: 'my_custom_tool',
  description: 'Does something useful',
  category: 'utility',
  riskLevel: 'LOW',
  source: 'local',
  parameters: {
    param1: { type: 'string', required: true },
    param2: { type: 'number', required: false }
  }
});

// Add to router
toolRouter.set('my_custom_tool', myCustomTool);`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Tool Properties</h2>
      <div className="space-y-3 mb-8">
        {[
          { prop: 'name', desc: 'Unique identifier (snake_case)' },
          { prop: 'description', desc: 'What the tool does (used by AI)' },
          { prop: 'category', desc: 'Grouping (devops, communication, etc.)' },
          { prop: 'riskLevel', desc: 'LOW, MEDIUM, or HIGH' },
          { prop: 'source', desc: 'local or composio' },
          { prop: 'parameters', desc: 'Input schema for the tool' },
        ].map((item) => (
          <div key={item.prop} className="flex gap-4 p-3 rounded-lg border border-border-subtle bg-bg-surface">
            <code className="text-accent font-mono text-sm">{item.prop}</code>
            <span className="text-text-secondary text-sm">{item.desc}</span>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Logging</h2>
      <p className="text-text-secondary mb-4 leading-relaxed">
        Use the <code className="px-2 py-1 rounded bg-bg-surface text-accent">onLog</code> callback to send progress updates to the frontend.
      </p>

      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50">
          <span className="text-xs text-text-muted font-mono">Log Levels</span>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-text-secondary font-mono">{`onLog({ level: 'info', message: 'Processing...' });
onLog({ level: 'warn', message: 'Retrying...' });
onLog({ level: 'error', message: 'Failed to connect' });`}</code>
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-text-primary mt-8 mb-4">Sandboxing</h2>
      <p className="text-text-secondary leading-relaxed">
        All tools are automatically sandboxed with:
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
          <span>Error catching and formatting</span>
        </li>
      </ul>
    </div>
  );
}
