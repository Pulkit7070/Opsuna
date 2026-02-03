import { ToolResult, ToolLog } from '@opsuna/shared';
import { registry } from './registry';
import {
  deployStaging,
  runSmokeTests,
  createGithubPR,
  postSlackMessage,
  rollbackDeploy,
} from './implementations';

type ToolImplementation = (
  callId: string,
  params: Record<string, unknown>,
  onLog: (log: ToolLog) => void
) => Promise<ToolResult>;

const implementations: Record<string, ToolImplementation> = {
  deploy_staging: deployStaging as ToolImplementation,
  run_smoke_tests: runSmokeTests as ToolImplementation,
  create_github_pr: createGithubPR as ToolImplementation,
  post_slack_message: postSlackMessage as ToolImplementation,
  rollback_deploy: rollbackDeploy as ToolImplementation,
};

export async function routeToolCall(
  callId: string,
  toolName: string,
  params: Record<string, unknown>,
  onLog: (log: ToolLog) => void
): Promise<ToolResult> {
  const tool = registry.get(toolName);

  if (!tool) {
    return {
      callId,
      toolName,
      success: false,
      error: {
        code: 'UNKNOWN_TOOL',
        message: `Tool '${toolName}' is not registered`,
        recoverable: false,
      },
      duration: 0,
      logs: [],
    };
  }

  const implementation = implementations[toolName];

  if (!implementation) {
    return {
      callId,
      toolName,
      success: false,
      error: {
        code: 'NO_IMPLEMENTATION',
        message: `Tool '${toolName}' has no implementation`,
        recoverable: false,
      },
      duration: 0,
      logs: [],
    };
  }

  return implementation(callId, params, onLog);
}
