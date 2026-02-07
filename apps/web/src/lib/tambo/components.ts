import { z } from 'zod';
import { ExecutionPlanCard } from '@/components/tambo/ExecutionPlanCard';
import { DeploymentProgress } from '@/components/tambo/DeploymentProgress';
import { TestResultsCard } from '@/components/tambo/TestResultsCard';
import { GitHubPRCard } from '@/components/tambo/GitHubPRCard';
import { SlackMessagePreview } from '@/components/tambo/SlackMessagePreview';
import { DataChart } from '@/components/tambo/DataChart';
import { ExecutionSummary } from '@/components/tambo/ExecutionSummary';
import { AgentCard } from '@/components/tambo/AgentCard';

/**
 * Tambo Component Registry
 *
 * These components are registered with Tambo and can be dynamically
 * rendered by the AI based on conversation context.
 */
export const tamboComponents = [
  {
    name: 'ExecutionPlanCard',
    description: 'Shows an execution plan with steps, risk level, and confirm/cancel actions. Use when presenting a plan to the user for approval.',
    component: ExecutionPlanCard,
    propsSchema: z.object({
      summary: z.string().describe('Brief summary of what the plan will do'),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('Overall risk level of the plan'),
      riskReason: z.string().describe('Explanation of why this risk level was assigned'),
      steps: z.array(z.object({
        id: z.string(),
        toolName: z.string().describe('Name of the tool to execute'),
        description: z.string().describe('What this step will do'),
        riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      })).describe('List of steps in the execution plan'),
      isExecuting: z.boolean().optional().describe('Whether the plan is currently executing'),
    }),
  },

  {
    name: 'DeploymentProgress',
    description: 'Real-time deployment progress visualization with stages and logs. Use during active deployments.',
    component: DeploymentProgress,
    propsSchema: z.object({
      environment: z.string().describe('Target environment (staging, production, etc.)'),
      branch: z.string().describe('Git branch being deployed'),
      status: z.enum(['pending', 'building', 'deploying', 'running_tests', 'completed', 'failed']),
      currentStage: z.number().describe('Current stage number (1-indexed)'),
      totalStages: z.number().describe('Total number of stages'),
      logs: z.array(z.object({
        timestamp: z.string(),
        level: z.enum(['info', 'warn', 'error']),
        message: z.string(),
      })).optional().describe('Recent log entries'),
    }),
  },

  {
    name: 'TestResultsCard',
    description: 'Displays test results with pass/fail counts and optional coverage. Use after running tests.',
    component: TestResultsCard,
    propsSchema: z.object({
      environment: z.string().describe('Environment where tests were run'),
      passed: z.number().describe('Number of passing tests'),
      failed: z.number().describe('Number of failing tests'),
      skipped: z.number().describe('Number of skipped tests'),
      coverage: z.object({
        lines: z.number().describe('Line coverage percentage'),
        branches: z.number().describe('Branch coverage percentage'),
        functions: z.number().describe('Function coverage percentage'),
      }).optional().describe('Code coverage metrics'),
      tests: z.array(z.object({
        name: z.string(),
        status: z.enum(['passed', 'failed', 'skipped']),
        duration: z.number().describe('Test duration in milliseconds'),
      })).optional().describe('Individual test results'),
    }),
  },

  {
    name: 'GitHubPRCard',
    description: 'Shows a GitHub pull request with details and stats. Use when creating or showing PRs.',
    component: GitHubPRCard,
    propsSchema: z.object({
      number: z.number().describe('PR number'),
      title: z.string().describe('PR title'),
      body: z.string().describe('PR description'),
      state: z.enum(['open', 'closed', 'merged']),
      htmlUrl: z.string().describe('URL to the PR on GitHub'),
      author: z.object({
        login: z.string().describe('GitHub username'),
        avatarUrl: z.string().describe('URL to author avatar'),
      }),
      additions: z.number().describe('Lines added'),
      deletions: z.number().describe('Lines deleted'),
      changedFiles: z.number().describe('Number of files changed'),
      labels: z.array(z.object({
        name: z.string(),
        color: z.string().describe('Hex color without #'),
      })).optional(),
    }),
  },

  {
    name: 'SlackMessagePreview',
    description: 'Preview of a Slack message. Use when sending or previewing Slack notifications.',
    component: SlackMessagePreview,
    propsSchema: z.object({
      channel: z.string().describe('Slack channel (with or without #)'),
      message: z.string().describe('Message content'),
      timestamp: z.string().optional().describe('Message timestamp'),
      sent: z.boolean().optional().describe('Whether the message was sent'),
      permalink: z.string().optional().describe('Link to message in Slack'),
    }),
  },

  {
    name: 'DataChart',
    description: 'Displays data as various chart types (line, bar, pie, area). Use for analytics and visualizations.',
    component: DataChart,
    propsSchema: z.object({
      title: z.string().describe('Chart title'),
      type: z.enum(['line', 'bar', 'pie', 'area']).describe('Type of chart to render'),
      data: z.array(z.object({
        name: z.string().describe('Data point label'),
        value: z.number().describe('Data point value'),
      })).describe('Chart data points'),
      xAxisLabel: z.string().optional(),
      yAxisLabel: z.string().optional(),
    }),
  },

  {
    name: 'ExecutionSummary',
    description: 'Summary of a completed execution with results. Use after an execution finishes.',
    component: ExecutionSummary,
    propsSchema: z.object({
      executionId: z.string(),
      status: z.enum(['completed', 'failed', 'cancelled']),
      duration: z.number().describe('Total duration in milliseconds'),
      stepsCompleted: z.number(),
      totalSteps: z.number(),
      results: z.array(z.object({
        toolName: z.string(),
        status: z.enum(['success', 'failed']),
        summary: z.string().optional().describe('Brief result summary'),
      })),
    }),
  },

  {
    name: 'AgentCard',
    description: 'Shows an AI agent with its capabilities. Use when listing or selecting agents.',
    component: AgentCard,
    propsSchema: z.object({
      name: z.string().describe('Agent name'),
      description: z.string().describe('Agent description'),
      icon: z.string().optional().describe('Icon identifier'),
      toolCount: z.number().describe('Number of tools this agent has'),
      isBuiltin: z.boolean().describe('Whether this is a built-in agent'),
    }),
  },
];

export type TamboComponentType = typeof tamboComponents[number];
