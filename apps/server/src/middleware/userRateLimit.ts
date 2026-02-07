/**
 * Per-user rate limiting middleware
 * Uses userId from authenticated request instead of IP address
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Key generator that uses authenticated user ID instead of IP
 */
function userKeyGenerator(req: Request): string {
  // Use authenticated user ID if available, fallback to IP
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  // Fallback to IP for unauthenticated requests
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * General API rate limiter - per user
 * 60 requests per minute per user
 */
export const userApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per user
  keyGenerator: userKeyGenerator,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Execution rate limiter - stricter per user
 * 15 execution requests per minute per user (respects Gemini free tier)
 */
export const userExecuteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 executions per minute per user
  keyGenerator: userKeyGenerator,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many execution requests. Please wait before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Confirmation rate limiter - stricter to prevent spam confirmations
 * 30 confirmations per minute per user
 */
export const userConfirmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 confirmations per minute per user
  keyGenerator: userKeyGenerator,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many confirmation requests. Please wait before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Agent creation rate limiter - prevent agent spam
 * 10 agent creations per hour per user
 */
export const userAgentCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 agents per hour per user
  keyGenerator: userKeyGenerator,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many agent creation requests. Please wait before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
