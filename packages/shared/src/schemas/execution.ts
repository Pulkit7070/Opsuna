import { z } from 'zod';

export const RiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const ExecutionStatusSchema = z.enum([
  'pending',
  'awaiting_confirmation',
  'executing',
  'completed',
  'failed',
  'cancelled',
  'rolled_back',
]);

export const ExecutionStepSchema = z.object({
  id: z.string(),
  order: z.number().int().min(0),
  toolName: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  expectedDuration: z.number().optional(),
  riskLevel: RiskLevelSchema,
});

export const RollbackStepSchema = z.object({
  id: z.string(),
  order: z.number().int().min(0),
  toolName: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  triggeredByStepId: z.string(),
});

export const ExecutionPlanSchema = z.object({
  summary: z.string(),
  riskLevel: RiskLevelSchema,
  riskReason: z.string(),
  steps: z.array(ExecutionStepSchema),
  rollbackSteps: z.array(RollbackStepSchema).optional(),
});

export const LogEntrySchema = z.object({
  timestamp: z.coerce.date(),
  level: z.enum(['info', 'warn', 'error', 'debug']),
  message: z.string(),
  data: z.unknown().optional(),
});

export const ToolCallResultSchema = z.object({
  stepId: z.string(),
  toolName: z.string(),
  status: z.enum(['pending', 'running', 'success', 'failed', 'skipped']),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  result: z.unknown().optional(),
  error: z.string().optional(),
  logs: z.array(LogEntrySchema),
});

export const ExecutionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  prompt: z.string(),
  status: ExecutionStatusSchema,
  riskLevel: RiskLevelSchema,
  plan: ExecutionPlanSchema.nullable(),
  results: z.array(ToolCallResultSchema),
  error: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
});

export type RiskLevelInput = z.infer<typeof RiskLevelSchema>;
export type ExecutionStatusInput = z.infer<typeof ExecutionStatusSchema>;
export type ExecutionStepInput = z.infer<typeof ExecutionStepSchema>;
export type ExecutionPlanInput = z.infer<typeof ExecutionPlanSchema>;
export type ExecutionInput = z.infer<typeof ExecutionSchema>;
