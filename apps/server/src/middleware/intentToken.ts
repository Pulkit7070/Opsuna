/**
 * Intent token middleware
 * Generates short-lived tokens on plan creation for secure confirmation
 */

import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma';
import { createError } from './errorHandler';
import { Request, Response, NextFunction } from 'express';

// Token expiration time: 5 minutes
const INTENT_TOKEN_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Generate a new intent token for an execution
 */
export function generateIntentToken(): { token: string; expiresAt: Date } {
  const token = nanoid(32); // 32-character secure token
  const expiresAt = new Date(Date.now() + INTENT_TOKEN_EXPIRY_MS);
  return { token, expiresAt };
}

/**
 * Validate intent token middleware
 * Checks that the provided token matches and hasn't expired
 */
export async function validateIntentToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { intentToken } = req.body;
    const userId = (req as Request & { user?: { id: string } }).user?.id;

    if (!intentToken) {
      return next(createError(
        'Intent token is required for confirmation',
        400,
        'MISSING_INTENT_TOKEN'
      ));
    }

    // Find the execution with matching intent token
    const execution = await prisma.execution.findFirst({
      where: {
        id,
        userId,
        status: 'awaiting_confirmation',
      },
      select: {
        intentToken: true,
        intentExpiresAt: true,
      },
    });

    if (!execution) {
      return next(createError(
        'Execution not found or not awaiting confirmation',
        404,
        'NOT_FOUND'
      ));
    }

    // Verify token matches
    if (execution.intentToken !== intentToken) {
      // Log potential security issue
      console.warn(`[Security] Invalid intent token attempt for execution ${id} by user ${userId}`);
      return next(createError(
        'Invalid intent token',
        403,
        'INVALID_INTENT_TOKEN'
      ));
    }

    // Check if token has expired
    if (execution.intentExpiresAt && new Date() > execution.intentExpiresAt) {
      return next(createError(
        'Intent token has expired. Please regenerate the plan.',
        410,
        'INTENT_TOKEN_EXPIRED'
      ));
    }

    // Token is valid, continue
    next();
  } catch (error) {
    next(createError(
      error instanceof Error ? error.message : 'Failed to validate intent token',
      500,
      'TOKEN_VALIDATION_FAILED'
    ));
  }
}

/**
 * Clear intent token after successful confirmation or cancellation
 */
export async function clearIntentToken(executionId: string): Promise<void> {
  try {
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        intentToken: null,
        intentExpiresAt: null,
      },
    });
  } catch (error) {
    console.warn(`[IntentToken] Failed to clear token for execution ${executionId}:`, error);
  }
}

/**
 * Refresh intent token (extend expiry time)
 * Useful if user needs more time to review plan
 */
export async function refreshIntentToken(executionId: string): Promise<{ token: string; expiresAt: Date } | null> {
  try {
    const { token, expiresAt } = generateIntentToken();

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        intentToken: token,
        intentExpiresAt: expiresAt,
      },
    });

    return { token, expiresAt };
  } catch (error) {
    console.warn(`[IntentToken] Failed to refresh token for execution ${executionId}:`, error);
    return null;
  }
}
