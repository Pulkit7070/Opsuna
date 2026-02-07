/**
 * Input sanitization middleware
 * Strips HTML, limits input lengths, validates content
 */

import sanitizeHtml from 'sanitize-html';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// Configuration for input limits
const INPUT_LIMITS = {
  prompt: 4000,         // Max characters for execution prompts
  agentName: 100,       // Max characters for agent names
  agentDescription: 500, // Max characters for agent descriptions
  systemPrompt: 8000,   // Max characters for system prompts
  confirmPhrase: 100,   // Max characters for confirmation phrases
  reason: 500,          // Max characters for rollback reasons
  default: 1000,        // Default max for unknown fields
};

// Fields that should be sanitized for HTML
const HTML_SANITIZE_FIELDS = ['prompt', 'name', 'description', 'systemPrompt', 'reason'];

/**
 * Sanitize HTML from a string value
 */
function sanitizeString(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim();
}

/**
 * Get the character limit for a field
 */
function getFieldLimit(fieldName: string): number {
  return INPUT_LIMITS[fieldName as keyof typeof INPUT_LIMITS] || INPUT_LIMITS.default;
}

/**
 * Validate and sanitize a single field
 */
function sanitizeField(key: string, value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  let sanitized = value;

  // Strip HTML if this is a sanitizable field
  if (HTML_SANITIZE_FIELDS.includes(key)) {
    sanitized = sanitizeString(sanitized);
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  // Check length limit
  const limit = getFieldLimit(key);
  if (sanitized.length > limit) {
    throw new Error(`Field "${key}" exceeds maximum length of ${limit} characters`);
  }

  return sanitized;
}

/**
 * Recursively sanitize object fields
 */
function sanitizeObject(obj: Record<string, unknown>, path = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fieldPath = path ? `${path}.${key}` : key;

    if (value === null || value === undefined) {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item as Record<string, unknown>, `${fieldPath}[${index}]`);
        }
        return sanitizeField(key, item);
      });
    } else if (typeof value === 'object') {
      result[key] = sanitizeObject(value as Record<string, unknown>, fieldPath);
    } else {
      result[key] = sanitizeField(key, value);
    }
  }

  return result;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Input validation failed';
    next(createError(message, 400, 'VALIDATION_ERROR'));
  }
}

/**
 * Middleware specifically for prompt input
 * Additional validation for execution prompts
 */
export function sanitizePromptInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    if (req.body?.prompt) {
      const prompt = req.body.prompt;

      if (typeof prompt !== 'string') {
        return next(createError('Prompt must be a string', 400, 'VALIDATION_ERROR'));
      }

      // Sanitize HTML
      const sanitized = sanitizeString(prompt);

      // Check minimum length
      if (sanitized.length < 3) {
        return next(createError('Prompt is too short', 400, 'VALIDATION_ERROR'));
      }

      // Check maximum length
      if (sanitized.length > INPUT_LIMITS.prompt) {
        return next(createError(
          `Prompt exceeds maximum length of ${INPUT_LIMITS.prompt} characters`,
          400,
          'VALIDATION_ERROR'
        ));
      }

      // Check for potentially malicious patterns
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /on\w+\s*=/i, // onclick=, onerror=, etc.
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(prompt)) {
          console.warn(`[Security] Suspicious input pattern detected: ${pattern}`);
          return next(createError('Invalid input detected', 400, 'VALIDATION_ERROR'));
        }
      }

      req.body.prompt = sanitized;
    }

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Input validation failed';
    next(createError(message, 400, 'VALIDATION_ERROR'));
  }
}

/**
 * Extract client info from request for audit logging
 */
export function extractClientInfo(req: Request): { ipAddress: string; userAgent: string } {
  // Get IP address (handle proxies)
  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    'unknown';

  // Get user agent
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  return { ipAddress, userAgent };
}
