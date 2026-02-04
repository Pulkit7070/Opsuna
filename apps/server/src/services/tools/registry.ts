import { Tool, ToolCategory, ToolSource } from '@opsuna/shared';

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  registerMany(tools: Tool[]): void {
    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): Tool[] {
    return Array.from(this.tools.values());
  }

  listByCategory(category: ToolCategory): Tool[] {
    return this.list().filter(t => t.category === category);
  }

  listBySource(source: ToolSource): Tool[] {
    return this.list().filter(t => t.source === source);
  }

  clear(source?: ToolSource): void {
    if (!source) {
      this.tools.clear();
      return;
    }
    for (const [name, tool] of this.tools) {
      if (tool.source === source) {
        this.tools.delete(name);
      }
    }
  }
}

export const registry = new ToolRegistry();

// Register local (mock) tools
registry.register({
  name: 'deploy_staging',
  displayName: 'Deploy to Staging',
  description: 'Deploy code to the staging environment',
  category: 'deployment',
  riskLevel: 'HIGH',
  rollbackSupported: true,
  source: 'local',
  parameters: [
    { name: 'branch', type: 'string', description: 'Branch to deploy', required: true },
    { name: 'environment', type: 'string', description: 'Target environment', required: true, enum: ['staging'] },
  ],
});

registry.register({
  name: 'run_smoke_tests',
  displayName: 'Run Smoke Tests',
  description: 'Run automated smoke tests against an environment',
  category: 'testing',
  riskLevel: 'LOW',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'environment', type: 'string', description: 'Environment to test', required: true },
    { name: 'suite', type: 'string', description: 'Test suite to run', required: false, default: 'smoke' },
  ],
});

registry.register({
  name: 'create_github_pr',
  displayName: 'Create GitHub PR',
  description: 'Create a pull request on GitHub',
  category: 'version_control',
  riskLevel: 'MEDIUM',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'title', type: 'string', description: 'PR title', required: true },
    { name: 'body', type: 'string', description: 'PR description', required: true },
    { name: 'base', type: 'string', description: 'Base branch', required: true },
    { name: 'head', type: 'string', description: 'Head branch', required: true },
  ],
});

registry.register({
  name: 'post_slack_message',
  displayName: 'Post Slack Message',
  description: 'Send a message to a Slack channel',
  category: 'notification',
  riskLevel: 'LOW',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'channel', type: 'string', description: 'Slack channel', required: true },
    { name: 'message', type: 'string', description: 'Message content', required: true },
  ],
});

registry.register({
  name: 'rollback_deploy',
  displayName: 'Rollback Deployment',
  description: 'Rollback a deployment to a previous version',
  category: 'deployment',
  riskLevel: 'HIGH',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'environment', type: 'string', description: 'Environment to rollback', required: true },
    { name: 'version', type: 'string', description: 'Version to rollback to', required: false },
  ],
});
