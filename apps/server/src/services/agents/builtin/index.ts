/**
 * Built-in agent definitions
 */

import { AgentDefinition } from '../types';
import { deepResearchAgent } from './deep-research';
import { dataAnalystAgent } from './data-analyst';
import { devopsAgent } from './devops';

export const builtinAgents: AgentDefinition[] = [
  deepResearchAgent,
  dataAnalystAgent,
  devopsAgent,
];

export { deepResearchAgent, dataAnalystAgent, devopsAgent };
