import { ExecutionPlan, RiskLevel } from '@opsuna/shared';
import { v4 as uuid } from 'uuid';

interface MockScenario {
  keywords: string[];
  plan: ExecutionPlan;
}

const mockScenarios: MockScenario[] = [
  {
    keywords: ['deploy', 'staging', 'smoke', 'test'],
    plan: {
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
          toolName: 'post_slack_message',
          description: 'Notify team about deployment status',
          parameters: { channel: '#deployments', message: 'Staging deployment complete' },
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
    },
  },
  {
    keywords: ['create', 'pr', 'pull request', 'github'],
    plan: {
      summary: 'Create a GitHub pull request',
      riskLevel: 'MEDIUM',
      riskReason: 'Creates a new PR but does not merge or modify existing code',
      steps: [
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 1,
          toolName: 'create_github_pr',
          description: 'Create pull request from feature branch to main',
          parameters: {
            title: 'Feature update',
            body: 'Automated PR created by Opsuna Tambo',
            base: 'main',
            head: 'feature-branch',
          },
          riskLevel: 'MEDIUM',
        },
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 2,
          toolName: 'post_slack_message',
          description: 'Notify team about new PR',
          parameters: { channel: '#pull-requests', message: 'New PR created for review' },
          riskLevel: 'LOW',
        },
      ],
    },
  },
  {
    keywords: ['notify', 'slack', 'message', 'team'],
    plan: {
      summary: 'Send notification to Slack',
      riskLevel: 'LOW',
      riskReason: 'Only sends a notification with no infrastructure changes',
      steps: [
        {
          id: `step-${uuid().slice(0, 8)}`,
          order: 1,
          toolName: 'post_slack_message',
          description: 'Post message to Slack channel',
          parameters: { channel: '#general', message: 'Notification from Opsuna Tambo' },
          riskLevel: 'LOW',
        },
      ],
    },
  },
  {
    keywords: ['rollback', 'revert', 'undo'],
    plan: {
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
          toolName: 'post_slack_message',
          description: 'Notify team about rollback',
          parameters: { channel: '#deployments', message: 'Rollback completed' },
          riskLevel: 'LOW',
        },
      ],
    },
  },
];

export function generateMockPlan(prompt: string): ExecutionPlan {
  const lowerPrompt = prompt.toLowerCase();

  // Find matching scenario based on keywords
  for (const scenario of mockScenarios) {
    const matchCount = scenario.keywords.filter(kw => lowerPrompt.includes(kw)).length;
    if (matchCount >= 2) {
      // Return a fresh copy with new IDs
      return JSON.parse(JSON.stringify(scenario.plan));
    }
  }

  // Default fallback plan
  return {
    summary: 'Execute requested automation task',
    riskLevel: 'MEDIUM' as RiskLevel,
    riskReason: 'Default risk level for unrecognized commands',
    steps: [
      {
        id: `step-${uuid().slice(0, 8)}`,
        order: 1,
        toolName: 'post_slack_message',
        description: 'Notify team about requested action',
        parameters: { channel: '#general', message: `Processing: ${prompt}` },
        riskLevel: 'LOW' as RiskLevel,
      },
    ],
  };
}
