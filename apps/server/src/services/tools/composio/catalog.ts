import { Tool, ToolCategory, RiskLevel } from '@opsuna/shared';
import { getComposioClient } from './client';

// Cache for Composio tools (refresh every 5 minutes)
let cachedTools: Tool[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

// Map Composio app names to our categories
const APP_CATEGORY_MAP: Record<string, ToolCategory> = {
  github: 'version_control',
  gitlab: 'version_control',
  bitbucket: 'version_control',
  slack: 'communication',
  discord: 'communication',
  gmail: 'communication',
  outlook: 'communication',
  googlecalendar: 'productivity',
  notion: 'productivity',
  todoist: 'productivity',
  linear: 'productivity',
  jira: 'productivity',
  asana: 'productivity',
  trello: 'productivity',
  hubspot: 'crm',
  salesforce: 'crm',
  postgres: 'database',
  mysql: 'database',
  mongodb: 'database',
  datadog: 'analytics',
  sentry: 'analytics',
  pagerduty: 'notification',
  twilio: 'notification',
};

// Risk classification based on action patterns
function classifyRisk(actionName: string): RiskLevel {
  const lower = actionName.toLowerCase();
  if (lower.includes('delete') || lower.includes('remove') || lower.includes('drop')) {
    return 'HIGH';
  }
  if (lower.includes('create') || lower.includes('update') || lower.includes('send') || lower.includes('post')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

function categorizeApp(appName: string): ToolCategory {
  return APP_CATEGORY_MAP[appName.toLowerCase()] || 'other';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComposioToolToTool(raw: any): Tool {
  const slug: string = raw.slug || '';
  const appName = raw.toolkit?.slug?.toLowerCase() || slug.split('_')[0]?.toLowerCase() || '';
  const displayName = raw.name || slug.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  return {
    name: slug.toLowerCase(),
    displayName,
    description: raw.description || `Execute ${slug}`,
    category: categorizeApp(appName),
    riskLevel: classifyRisk(slug),
    parameters: mapParameters(raw.inputParameters),
    rollbackSupported: false,
    source: 'composio',
    composioActionName: slug,
    appName,
    logo: raw.toolkit?.logo || undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapParameters(params: any): Tool['parameters'] {
  if (!params?.properties) return [];

  const required: string[] = params.required || [];

  return Object.entries(params.properties).map(([name, schema]: [string, any]) => ({
    name,
    type: mapParamType(schema.type),
    description: schema.description || name,
    required: required.includes(name),
    default: schema.default,
    enum: schema.enum,
  }));
}

function mapParamType(type: string): 'string' | 'number' | 'boolean' | 'object' | 'array' {
  switch (type) {
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'string';
  }
}

// Popular toolkits to fetch in the default catalog
const DEFAULT_TOOLKITS = ['GITHUB', 'SLACK', 'GMAIL', 'NOTION', 'LINEAR', 'JIRA', 'TRELLO', 'DISCORD'];

/**
 * Fetch available Composio tools (cached).
 * Queries popular toolkits since the API requires at least one filter.
 */
export async function fetchComposioTools(forceRefresh = false): Promise<Tool[]> {
  const now = Date.now();

  if (!forceRefresh && cachedTools.length > 0 && now - cacheTimestamp < CACHE_TTL) {
    return cachedTools;
  }

  const client = getComposioClient();
  if (!client) {
    return [];
  }

  try {
    // Fetch tools from popular toolkits in parallel
    const results = await Promise.allSettled(
      DEFAULT_TOOLKITS.map(tk =>
        client.tools.getRawComposioTools({ toolkits: [tk], limit: 10 })
      )
    );

    const allTools: Tool[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allTools.push(...result.value.map(mapComposioToolToTool));
      }
    }

    cachedTools = allTools;
    cacheTimestamp = now;
    console.log(`[Composio] Cached ${cachedTools.length} tools from ${DEFAULT_TOOLKITS.length} toolkits`);
    return cachedTools;
  } catch (error) {
    console.error('[Composio] Failed to fetch tools:', error);
    return cachedTools;
  }
}

/**
 * Fetch tools for a specific app (e.g. "github", "slack").
 */
export async function fetchComposioToolsByApp(appName: string): Promise<Tool[]> {
  const client = getComposioClient();
  if (!client) return [];

  try {
    const rawTools = await client.tools.getRawComposioTools({
      toolkits: [appName.toUpperCase()],
      limit: 50,
    });
    return rawTools.map(mapComposioToolToTool);
  } catch (error) {
    console.error(`[Composio] Failed to fetch tools for ${appName}:`, error);
    return [];
  }
}

/**
 * Search Composio tools semantically.
 */
export async function searchComposioTools(query: string, _userId?: string): Promise<Tool[]> {
  const client = getComposioClient();
  if (!client) return [];

  try {
    const rawTools = await client.tools.getRawComposioTools({ search: query, limit: 20 });
    return rawTools.map(mapComposioToolToTool);
  } catch (error) {
    console.error(`[Composio] Search failed for "${query}":`, error);
    return [];
  }
}

/**
 * List available Composio app/toolkit names.
 */
export async function listComposioApps(): Promise<Array<{ name: string; slug: string; logo?: string; category: ToolCategory }>> {
  const client = getComposioClient();
  if (!client) return [];

  try {
    const toolkits = await client.toolkits.getToolkits();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return toolkits.map((tk: any) => ({
      name: tk.name || tk.slug,
      slug: tk.slug,
      logo: tk.logo,
      category: categorizeApp(tk.slug),
    }));
  } catch (error) {
    console.error('[Composio] Failed to list apps:', error);
    return [];
  }
}
