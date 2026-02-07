import { z } from 'zod';
import { defineTool } from '@tambo-ai/react';
import { apiClient } from '@/lib/api/client';

// Response schema for API responses
const apiResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
}).passthrough();

/**
 * Tambo Tools Registry
 *
 * These tools are callable by the AI from the frontend.
 * They bridge the Tambo SDK to our backend API.
 */
export const tamboTools = [
  defineTool({
    name: 'executePrompt',
    description: 'Generate an execution plan for a user request. This analyzes the prompt and creates a step-by-step plan.',
    tool: async (params) => {
      try {
        const response = await apiClient('/api/execute', {
          method: 'POST',
          body: JSON.stringify(params),
        });
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to generate plan' };
      }
    },
    inputSchema: z.object({
      prompt: z.string().describe('The user request to analyze and plan'),
      agentId: z.string().optional().describe('Optional agent ID to scope the execution'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'confirmExecution',
    description: 'Confirm and start executing a plan. Call this after user confirms the execution plan.',
    tool: async (params) => {
      try {
        const response = await apiClient(`/api/confirm/${params.executionId}`, {
          method: 'POST',
          body: JSON.stringify({
            confirmed: true,
            intentToken: params.intentToken
          }),
        });
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to confirm execution' };
      }
    },
    inputSchema: z.object({
      executionId: z.string().describe('The execution ID to confirm'),
      intentToken: z.string().optional().describe('Security token for confirmation'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'cancelExecution',
    description: 'Cancel a pending execution plan.',
    tool: async (params) => {
      try {
        const response = await apiClient(`/api/confirm/${params.executionId}`, {
          method: 'POST',
          body: JSON.stringify({ confirmed: false }),
        });
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to cancel execution' };
      }
    },
    inputSchema: z.object({
      executionId: z.string().describe('The execution ID to cancel'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'listTools',
    description: 'Get list of all available tools including local and Composio integrations.',
    tool: async () => {
      try {
        const response = await apiClient('/api/tools');
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to list tools' };
      }
    },
    inputSchema: z.object({}),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'connectApp',
    description: 'Initiate OAuth connection for a Composio app (GitHub, Slack, etc.).',
    tool: async (params) => {
      try {
        const response = await apiClient('/api/tools/composio/connect', {
          method: 'POST',
          body: JSON.stringify({ appName: params.appName }),
        });
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to connect app' };
      }
    },
    inputSchema: z.object({
      appName: z.string().describe('Name of the app to connect (e.g., "github", "slack")'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'getConnectedApps',
    description: 'Get list of apps the user has connected.',
    tool: async () => {
      try {
        const response = await apiClient('/api/tools/composio/connections');
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to get connections' };
      }
    },
    inputSchema: z.object({}),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'getExecutionHistory',
    description: 'Get recent execution history for the current user.',
    tool: async (params) => {
      try {
        const response = await apiClient(`/api/executions?pageSize=${params.limit || 10}`);
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to get history' };
      }
    },
    inputSchema: z.object({
      limit: z.number().optional().describe('Maximum number of executions to return'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'getExecutionDetails',
    description: 'Get detailed information about a specific execution.',
    tool: async (params) => {
      try {
        const response = await apiClient(`/api/executions/${params.executionId}`);
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to get execution details' };
      }
    },
    inputSchema: z.object({
      executionId: z.string().describe('The execution ID to retrieve'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'listAgents',
    description: 'Get list of available AI agents (built-in and custom).',
    tool: async () => {
      try {
        const response = await apiClient('/api/agents');
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to list agents' };
      }
    },
    inputSchema: z.object({}),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'searchMemory',
    description: 'Search through past conversations and executions using semantic search.',
    tool: async (params) => {
      try {
        const response = await apiClient(
          `/api/memory/search?q=${encodeURIComponent(params.query)}&limit=${params.limit || 5}`
        );
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to search memory' };
      }
    },
    inputSchema: z.object({
      query: z.string().describe('Search query for semantic memory search'),
      limit: z.number().optional().describe('Maximum results to return'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'getMemoryContext',
    description: 'Get relevant memory context for building prompts.',
    tool: async (params) => {
      try {
        const response = await apiClient('/api/memory/context', {
          method: 'POST',
          body: JSON.stringify({ prompt: params.prompt }),
        });
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to get memory context' };
      }
    },
    inputSchema: z.object({
      prompt: z.string().describe('The prompt to find relevant context for'),
    }),
    outputSchema: apiResponseSchema,
  }),

  defineTool({
    name: 'shareExecution',
    description: 'Generate a shareable public link for an execution report.',
    tool: async (params) => {
      try {
        const response = await apiClient(`/api/executions/${params.executionId}/share`, {
          method: 'POST',
        });
        return response;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to share execution' };
      }
    },
    inputSchema: z.object({
      executionId: z.string().describe('The execution ID to share'),
    }),
    outputSchema: apiResponseSchema,
  }),
];

export type TamboToolType = typeof tamboTools[number];
