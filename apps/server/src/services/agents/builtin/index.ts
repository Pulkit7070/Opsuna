/**
 * Built-in agent definitions
 */

import { AgentDefinition } from '../types';
import { deepResearchAgent } from './deep-research';
import { dataAnalystAgent } from './data-analyst';
import { devopsAgent } from './devops';
import { securityAuditorAgent } from './security-auditor';
import { codeReviewerAgent } from './code-reviewer';
import { projectManagerAgent } from './project-manager';

export const builtinAgents: AgentDefinition[] = [
  deepResearchAgent,
  dataAnalystAgent,
  devopsAgent,
  securityAuditorAgent,
  codeReviewerAgent,
  projectManagerAgent,
];

export {
  deepResearchAgent,
  dataAnalystAgent,
  devopsAgent,
  securityAuditorAgent,
  codeReviewerAgent,
  projectManagerAgent,
};
