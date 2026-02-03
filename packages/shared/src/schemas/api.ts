import { z } from 'zod';

export const ExecuteRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt too long'),
});

export const ConfirmRequestSchema = z.object({
  confirmed: z.boolean(),
  confirmPhrase: z.string().optional(),
});

export const RollbackRequestSchema = z.object({
  stepIds: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const ExecutionIdParamSchema = z.object({
  id: z.string().uuid('Invalid execution ID'),
});

export type ExecuteRequestInput = z.infer<typeof ExecuteRequestSchema>;
export type ConfirmRequestInput = z.infer<typeof ConfirmRequestSchema>;
export type RollbackRequestInput = z.infer<typeof RollbackRequestSchema>;
export type PaginationQueryInput = z.infer<typeof PaginationQuerySchema>;
