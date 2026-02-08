import { Tool, ToolCategory, ToolSource } from '@opsuna/shared';

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private initialized = false;

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

  isInitialized(): boolean {
    return this.initialized;
  }

  setInitialized(): void {
    this.initialized = true;
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

registry.register({
  name: 'send_email',
  displayName: 'Send Email',
  description: 'Send an email notification',
  category: 'communication',
  riskLevel: 'LOW',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'to', type: 'string', description: 'Recipient email address', required: true },
    { name: 'subject', type: 'string', description: 'Email subject', required: true },
    { name: 'body', type: 'string', description: 'Email body content', required: true },
    { name: 'cc', type: 'string', description: 'CC recipients', required: false },
  ],
});

registry.register({
  name: 'run_unit_tests',
  displayName: 'Run Unit Tests',
  description: 'Run the unit test suite with optional coverage report',
  category: 'testing',
  riskLevel: 'LOW',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'testSuite', type: 'string', description: 'Specific test suite to run', required: false },
    { name: 'coverage', type: 'boolean', description: 'Generate coverage report', required: false, default: false },
  ],
});

registry.register({
  name: 'deploy_production',
  displayName: 'Deploy to Production',
  description: 'Deploy code to the production environment (high risk)',
  category: 'deployment',
  riskLevel: 'HIGH',
  rollbackSupported: true,
  source: 'local',
  parameters: [
    { name: 'version', type: 'string', description: 'Version to deploy', required: true },
    { name: 'rollbackOnFailure', type: 'boolean', description: 'Auto-rollback on failure', required: false, default: true },
  ],
});

registry.register({
  name: 'check_ci_status',
  displayName: 'Check CI Status',
  description: 'Check the status of CI/CD pipelines for a repository',
  category: 'analytics',
  riskLevel: 'LOW',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'repo', type: 'string', description: 'Repository name', required: true },
    { name: 'branch', type: 'string', description: 'Branch to check', required: false, default: 'main' },
  ],
});

registry.register({
  name: 'create_jira_ticket',
  displayName: 'Create Jira Ticket',
  description: 'Create a new ticket in Jira',
  category: 'productivity',
  riskLevel: 'LOW',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'title', type: 'string', description: 'Ticket title', required: true },
    { name: 'description', type: 'string', description: 'Ticket description', required: true },
    { name: 'type', type: 'string', description: 'Issue type (Bug, Task, Story)', required: true },
    { name: 'priority', type: 'string', description: 'Priority level', required: false, default: 'Medium' },
    { name: 'assignee', type: 'string', description: 'Assignee email', required: false },
  ],
});

registry.register({
  name: 'run_database_migration',
  displayName: 'Run Database Migration',
  description: 'Run pending database migrations',
  category: 'deployment',
  riskLevel: 'HIGH',
  rollbackSupported: true,
  source: 'local',
  parameters: [
    { name: 'environment', type: 'string', description: 'Target environment', required: true },
    { name: 'dryRun', type: 'boolean', description: 'Preview without applying', required: false, default: false },
  ],
});

registry.register({
  name: 'list_github_repos',
  displayName: 'List GitHub Repositories',
  description: 'List repositories for a GitHub user',
  category: 'version_control',
  riskLevel: 'LOW',
  rollbackSupported: false,
  source: 'local',
  parameters: [
    { name: 'username', type: 'string', description: 'GitHub username', required: false },
    { name: 'type', type: 'string', description: 'Repository type filter', required: false, enum: ['all', 'public', 'private'] },
    { name: 'sort', type: 'string', description: 'Sort order', required: false, enum: ['created', 'updated', 'stars'] },
  ],
});
