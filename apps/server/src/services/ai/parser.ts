import { ExecutionPlan, RiskLevel } from '@opsuna/shared';
import { v4 as uuid } from 'uuid';

interface ParsedPlan {
  summary: string;
  riskLevel: string;
  riskReason: string;
  steps: Array<{
    id?: string;
    order: number;
    toolName: string;
    description: string;
    parameters: Record<string, unknown>;
    riskLevel?: string;
  }>;
  rollbackSteps?: Array<{
    id?: string;
    order: number;
    toolName: string;
    description: string;
    parameters: Record<string, unknown>;
    triggeredByStepId: string;
  }>;
}

interface ParsedError {
  error: true;
  message: string;
  suggestion?: string;
}

export function parseAIResponse(response: string): ExecutionPlan {
  // Extract JSON from response (handle markdown code blocks)
  let jsonString = response.trim();

  // Remove markdown code blocks if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim();
  }

  let parsed: ParsedPlan | ParsedError;

  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${e}`);
  }

  // Check for error response
  if ('error' in parsed && parsed.error) {
    throw new Error((parsed as ParsedError).message);
  }

  const plan = parsed as ParsedPlan;

  // Validate and normalize the plan
  if (!plan.summary || !plan.steps || !Array.isArray(plan.steps)) {
    throw new Error('Invalid plan structure: missing required fields');
  }

  const riskLevel = normalizeRiskLevel(plan.riskLevel);

  return {
    summary: plan.summary,
    riskLevel,
    riskReason: plan.riskReason || 'Risk level determined by tool usage',
    steps: plan.steps.map((step, index) => ({
      id: step.id || `step-${uuid().slice(0, 8)}`,
      order: step.order ?? index + 1,
      toolName: step.toolName,
      description: step.description,
      parameters: step.parameters || {},
      riskLevel: normalizeRiskLevel(step.riskLevel) || riskLevel,
    })),
    rollbackSteps: plan.rollbackSteps?.map((step, index) => ({
      id: step.id || `rollback-${uuid().slice(0, 8)}`,
      order: step.order ?? index + 1,
      toolName: step.toolName,
      description: step.description,
      parameters: step.parameters || {},
      triggeredByStepId: step.triggeredByStepId,
    })),
  };
}

function normalizeRiskLevel(level?: string): RiskLevel {
  const normalized = level?.toUpperCase();
  if (normalized === 'LOW' || normalized === 'MEDIUM' || normalized === 'HIGH') {
    return normalized as RiskLevel;
  }
  return 'MEDIUM'; // Default to MEDIUM for safety
}
