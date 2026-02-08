import { ExecutionPlan, RiskLevel } from '@opsuna/shared';
import { v4 as uuid } from 'uuid';
import { registry } from '../tools/registry';

/**
 * Get the best tool name for a given action.
 * Prefers Composio tools over local mocks when available.
 */
function getToolName(composioName: string, localFallback: string): string {
  const composioTool = registry.get(composioName);
  if (composioTool && composioTool.source === 'composio') {
    console.log(`[Mock] Using Composio tool: ${composioName}`);
    return composioName;
  }
  console.log(`[Mock] Using local tool: ${localFallback} (Composio ${composioName} not found)`);
  return localFallback;
}

interface MockScenario {
  keywords: string[];
  getPlan: (prompt: string) => ExecutionPlan;
}

const mockScenarios: MockScenario[] = [
  {
    keywords: ['create', 'branch', 'github'],
    getPlan: (prompt: string) => {
      // Extract repo: "in repo owner/name" or "owner/repo"
      const repoMatch = prompt.match(/(?:in\s+(?:repo\s+)?|repo\s+)?([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
      const owner = repoMatch?.[1] || 'YOUR_USERNAME';
      const repo = repoMatch?.[2] || 'YOUR_REPO';

      // Extract branch name - look for word after "called", "named", or "branch"
      // but exclude common words like "in", "repo", etc.
      const branchMatch = prompt.match(/(?:called|named)\s+['"]?([a-zA-Z0-9_/-]+)['"]?/i)
        || prompt.match(/branch\s+['"]?([a-zA-Z0-9_-]+)['"]?\s+(?:in|on|for)/i)
        || prompt.match(/create\s+(?:a\s+)?(?:new\s+)?branch\s+['"]?([a-zA-Z0-9_-]+)['"]?/i);
      const branchName = branchMatch?.[1] || 'new-branch';

      // Extract base branch - look for "from <branch>", "based on <branch>", "off <branch>"
      const baseMatch = prompt.match(/(?:from|based on|off)\s+['"]?([a-zA-Z0-9_/-]+)['"]?(?:\s+branch)?/i);
      const baseBranch = baseMatch?.[1] || 'master'; // Default to master (most common)

      // Creating a branch requires getting the SHA first, so we use commit_multiple_files
      // which can create a branch with a simple file change
      return {
        summary: `Create branch '${branchName}' in ${owner}/${repo} from ${baseBranch}`,
        riskLevel: 'LOW',
        riskReason: 'Creates a new branch without modifying existing code',
        steps: [
          {
            id: `step-${uuid().slice(0, 8)}`,
            order: 1,
            toolName: getToolName('github_commit_multiple_files', 'create_branch'),
            description: `Create branch '${branchName}' from ${baseBranch}`,
            parameters: {
              owner,
              repo,
              branch: branchName,
              base_branch: baseBranch,
              message: `Create branch ${branchName} via Opsuna Tambo`,
              upserts: [
                {
                  path: '.opsuna-branch-marker',
                  content: `Branch created by Opsuna Tambo at ${new Date().toISOString()}`,
                },
              ],
            },
            riskLevel: 'LOW',
          },
        ],
      };
    },
  },
  {
    keywords: ['deploy', 'staging', 'smoke', 'test'],
    getPlan: () => ({
      summary: 'Deploy to staging and run smoke tests',
      riskLevel: 'HIGH',
      riskReason: 'Deployment modifies staging environment infrastructure',
      steps: [
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 1,
          toolName: 'deploy_staging',
          description: 'Deploy the current main branch to staging environment',
          parameters: { branch: 'main', environment: 'staging' },
          riskLevel: 'HIGH',
        },
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 2,
          toolName: 'run_smoke_tests',
          description: 'Run automated smoke tests against staging',
          parameters: { environment: 'staging', suite: 'smoke' },
          riskLevel: 'LOW',
        },
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 3,
          toolName: getToolName('slack_sends_a_message_to_a_slack_channel', 'post_slack_message'),
          description: 'Notify team about deployment status',
          parameters: { channel: '#deployments', text: 'Staging deployment complete' },
          riskLevel: 'LOW',
        },
      ],
      rollbackSteps: [
        {
          id: `rollback-${uuid().slice(0, 8)}`,
          order: 1,
          toolName: 'rollback_deploy',
          description: 'Rollback staging deployment to previous version',
          parameters: { environment: 'staging' },
          triggeredByStepId: 'step-1',
        },
      ],
    }),
  },
  {
    keywords: ['create', 'pr', 'pull request', 'github'],
    getPlan: (prompt: string) => {
      // Try to extract repo info from prompt: "in repo owner/name" or "owner/repo"
      const repoMatch = prompt.match(/(?:in\s+(?:repo\s+)?|repo\s+)?([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
      const owner = repoMatch?.[1] || 'YOUR_USERNAME';
      const repo = repoMatch?.[2] || 'YOUR_REPO';

      // Try to extract branch names
      const branchMatch = prompt.match(/from\s+([a-zA-Z0-9_/-]+)\s+to\s+([a-zA-Z0-9_/-]+)/i);
      const head = branchMatch?.[1] || 'feature-branch';
      const base = branchMatch?.[2] || 'main';

      return {
        summary: 'Create a GitHub pull request',
        riskLevel: 'MEDIUM',
        riskReason: 'Creates a new PR but does not merge or modify existing code',
        steps: [
          {
            id: `step-${uuid().slice(0, 8)}`,
            order: 1,
            toolName: getToolName('github_create_a_pull_request', 'create_github_pr'),
            description: `Create pull request from ${head} to ${base}`,
            parameters: {
              owner,
              repo,
              title: 'Feature update',
              body: 'Automated PR created by Opsuna Tambo',
              base,
              head,
            },
            riskLevel: 'MEDIUM',
          },
          {
            id: `step-${uuid().slice(0, 8)}`,
            order: 2,
            toolName: getToolName('slack_sends_a_message_to_a_slack_channel', 'post_slack_message'),
            description: 'Notify team about new PR',
            parameters: { channel: '#pull-requests', text: 'New PR created for review' },
            riskLevel: 'LOW',
          },
        ],
      };
    },
  },
  {
    keywords: ['issue', 'github', 'create', 'bug'],
    getPlan: (prompt: string) => {
      // Extract repo: "in repo owner/name" or "owner/repo"
      const repoMatch = prompt.match(/(?:in\s+(?:repo\s+)?|repo\s+)?([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
      const owner = repoMatch?.[1] || 'YOUR_USERNAME';
      const repo = repoMatch?.[2] || 'YOUR_REPO';

      // Extract title from quotes or "titled X"
      const titleMatch = prompt.match(/titled\s+['"]([^'"]+)['"]/i) || prompt.match(/['"]([^'"]+)['"]/);
      const title = titleMatch?.[1] || 'New issue from Opsuna';

      return {
        summary: 'Create a GitHub issue',
        riskLevel: 'LOW',
        riskReason: 'Creates an issue without modifying code',
        steps: [
          {
            id: `step-${uuid().slice(0, 8)}`,
            order: 1,
            toolName: getToolName('github_create_an_issue', 'create_github_issue'),
            description: 'Create a new GitHub issue',
            parameters: {
              owner,
              repo,
              title,
              body: 'Issue created via Opsuna Tambo automation',
            },
            riskLevel: 'LOW',
          },
        ],
      };
    },
  },
  {
    keywords: ['notify', 'slack', 'message', 'team'],
    getPlan: () => ({
      summary: 'Send notification to Slack',
      riskLevel: 'LOW',
      riskReason: 'Only sends a notification with no infrastructure changes',
      steps: [
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 1,
          toolName: getToolName('slack_sends_a_message_to_a_slack_channel', 'post_slack_message'),
          description: 'Post message to Slack channel',
          parameters: { channel: '#general', text: 'Notification from Opsuna Tambo' },
          riskLevel: 'LOW',
        },
      ],
    }),
  },
  {
    keywords: ['list', 'repos', 'repository', 'github'],
    getPlan: () => ({
      summary: 'List GitHub repositories',
      riskLevel: 'LOW',
      riskReason: 'Read-only operation',
      steps: [
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 1,
          toolName: getToolName('github_list_repositories_for_a_user', 'list_github_repos'),
          description: 'List GitHub repositories',
          parameters: {
            username: 'prateek-opsuna',
          },
          riskLevel: 'LOW',
        },
      ],
    }),
  },
  {
    keywords: ['rollback', 'revert', 'undo'],
    getPlan: () => ({
      summary: 'Rollback deployment',
      riskLevel: 'HIGH',
      riskReason: 'Modifies infrastructure by reverting to previous version',
      steps: [
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 1,
          toolName: 'rollback_deploy',
          description: 'Rollback to previous stable version',
          parameters: { environment: 'staging' },
          riskLevel: 'HIGH',
        },
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 2,
          toolName: 'run_smoke_tests',
          description: 'Verify rollback was successful',
          parameters: { environment: 'staging', suite: 'smoke' },
          riskLevel: 'LOW',
        },
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 3,
          toolName: getToolName('slack_sends_a_message_to_a_slack_channel', 'post_slack_message'),
          description: 'Notify team about rollback',
          parameters: { channel: '#deployments', text: 'Rollback completed' },
          riskLevel: 'LOW',
        },
      ],
    }),
  },
];

export function generateMockPlan(prompt: string): ExecutionPlan {
  const lowerPrompt = prompt.toLowerCase();

  // Check for specific strong keyword matches FIRST (more specific beats generic)
  if (lowerPrompt.includes('branch') && lowerPrompt.includes('create')) {
    console.log('[Mock] Matched create branch scenario');
    return mockScenarios[0].getPlan(prompt);
  }
  if (lowerPrompt.includes('issue')) {
    console.log('[Mock] Matched GitHub issue scenario');
    return mockScenarios[3].getPlan(prompt);
  }
  if (lowerPrompt.includes('pr') || lowerPrompt.includes('pull request')) {
    console.log('[Mock] Matched GitHub PR scenario');
    return mockScenarios[2].getPlan(prompt);
  }
  if (lowerPrompt.includes('slack') || lowerPrompt.includes('notify') || lowerPrompt.includes('message')) {
    console.log('[Mock] Matched Slack scenario');
    return mockScenarios[3].getPlan(prompt);
  }
  if (lowerPrompt.includes('list') && (lowerPrompt.includes('repo') || lowerPrompt.includes('github'))) {
    console.log('[Mock] Matched list repos scenario');
    return mockScenarios[4].getPlan(prompt);
  }

  // Find matching scenario based on keywords
  for (const scenario of mockScenarios) {
    const matchCount = scenario.keywords.filter(kw => lowerPrompt.includes(kw)).length;
    if (matchCount >= 2) {
      console.log(`[Mock] Matched scenario with keywords: ${scenario.keywords.join(', ')}`);
      return scenario.getPlan(prompt);
    }
  }

  // Default fallback plan
  console.log('[Mock] Using default fallback plan');
  return {
    summary: 'Execute requested automation task',
    riskLevel: 'MEDIUM' as RiskLevel,
    riskReason: 'Default risk level for unrecognized commands',
    steps: [
      {
        id: `step-${uuid().slice(0, 8)}`,
        order: 1,
        toolName: getToolName('slack_sends_a_message_to_a_slack_channel', 'post_slack_message'),
        description: 'Notify team about requested action',
        parameters: { channel: '#general', text: `Processing: ${prompt}` },
        riskLevel: 'LOW' as RiskLevel,
      },
    ],
  };
}
