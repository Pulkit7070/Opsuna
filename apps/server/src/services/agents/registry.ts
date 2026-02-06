/**
 * Agent registry - CRUD operations for agents
 */

import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import {
  Agent,
  AgentCreateInput,
  AgentUpdateInput,
  AgentConfig,
  MemoryScope,
} from './types';
import { builtinAgents } from './builtin';

/**
 * Initialize built-in agents in the database.
 */
export async function initializeBuiltinAgents(): Promise<void> {
  for (const agent of builtinAgents) {
    const existing = await prisma.agent.findFirst({
      where: {
        name: agent.name,
        isBuiltin: true,
      },
    });

    if (!existing) {
      await prisma.agent.create({
        data: {
          name: agent.name,
          description: agent.description,
          icon: agent.icon,
          systemPrompt: agent.systemPrompt,
          toolNames: agent.toolNames,
          memoryScope: agent.memoryScope,
          isBuiltin: true,
          isPublic: true,
          config: agent.config ? (agent.config as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });
      console.log(`[Agents] Created built-in agent: ${agent.name}`);
    }
  }
}

/**
 * Get all agents accessible to a user (built-in + public + own).
 */
export async function getAccessibleAgents(userId: string): Promise<Agent[]> {
  const agents = await prisma.agent.findMany({
    where: {
      OR: [
        { isBuiltin: true },
        { isPublic: true },
        { userId },
      ],
    },
    orderBy: [
      { isBuiltin: 'desc' },
      { name: 'asc' },
    ],
  });

  return agents.map(mapPrismaAgent);
}

/**
 * Get built-in agents only.
 */
export async function getBuiltinAgents(): Promise<Agent[]> {
  const agents = await prisma.agent.findMany({
    where: { isBuiltin: true },
    orderBy: { name: 'asc' },
  });

  return agents.map(mapPrismaAgent);
}

/**
 * Get user's custom agents.
 */
export async function getUserAgents(userId: string): Promise<Agent[]> {
  const agents = await prisma.agent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return agents.map(mapPrismaAgent);
}

/**
 * Get a single agent by ID.
 */
export async function getAgent(id: string): Promise<Agent | null> {
  const agent = await prisma.agent.findUnique({
    where: { id },
  });

  return agent ? mapPrismaAgent(agent) : null;
}

/**
 * Get agent by ID and verify access.
 */
export async function getAgentWithAccess(
  id: string,
  userId: string
): Promise<Agent | null> {
  const agent = await prisma.agent.findFirst({
    where: {
      id,
      OR: [
        { isBuiltin: true },
        { isPublic: true },
        { userId },
      ],
    },
  });

  return agent ? mapPrismaAgent(agent) : null;
}

/**
 * Create a new agent.
 */
export async function createAgent(
  userId: string,
  input: AgentCreateInput
): Promise<Agent> {
  const agent = await prisma.agent.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      icon: input.icon,
      systemPrompt: input.systemPrompt,
      toolNames: input.toolNames,
      memoryScope: input.memoryScope || 'shared',
      isBuiltin: false,
      isPublic: input.isPublic || false,
      config: input.config ? (input.config as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });

  return mapPrismaAgent(agent);
}

/**
 * Update an agent.
 */
export async function updateAgent(
  id: string,
  userId: string,
  input: AgentUpdateInput
): Promise<Agent | null> {
  // Verify ownership (can't update built-in agents)
  const existing = await prisma.agent.findFirst({
    where: {
      id,
      userId,
      isBuiltin: false,
    },
  });

  if (!existing) {
    return null;
  }

  const agent = await prisma.agent.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.systemPrompt && { systemPrompt: input.systemPrompt }),
      ...(input.toolNames && { toolNames: input.toolNames }),
      ...(input.memoryScope && { memoryScope: input.memoryScope }),
      ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
      ...(input.config && { config: input.config as Prisma.InputJsonValue }),
    },
  });

  return mapPrismaAgent(agent);
}

/**
 * Delete an agent.
 */
export async function deleteAgent(id: string, userId: string): Promise<boolean> {
  // Verify ownership (can't delete built-in agents)
  const existing = await prisma.agent.findFirst({
    where: {
      id,
      userId,
      isBuiltin: false,
    },
  });

  if (!existing) {
    return false;
  }

  await prisma.agent.delete({
    where: { id },
  });

  return true;
}

/**
 * Map Prisma agent to domain type.
 */
function mapPrismaAgent(agent: {
  id: string;
  userId: string | null;
  name: string;
  description: string;
  icon: string | null;
  systemPrompt: string;
  toolNames: string[];
  memoryScope: string;
  isBuiltin: boolean;
  isPublic: boolean;
  config: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}): Agent {
  return {
    id: agent.id,
    userId: agent.userId,
    name: agent.name,
    description: agent.description,
    icon: agent.icon || undefined,
    systemPrompt: agent.systemPrompt,
    toolNames: agent.toolNames,
    memoryScope: agent.memoryScope as MemoryScope,
    isBuiltin: agent.isBuiltin,
    isPublic: agent.isPublic,
    config: agent.config as AgentConfig | undefined,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
}
