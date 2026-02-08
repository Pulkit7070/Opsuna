import { Request, Response, NextFunction } from 'express';
import { config } from '../lib/config';
import { verifyToken } from '../lib/supabase';
import { prisma } from '../lib/prisma';

// Fallback user for development mode without auth
const MOCK_USER = {
  id: 'user-001',
  email: 'demo@opsuna.dev',
  name: 'Demo User',
  avatarUrl: null as string | null,
};

// User upsert cache to reduce DB writes (5-minute TTL)
const USER_CACHE_TTL_MS = 5 * 60 * 1000;
const userUpsertCache = new Map<string, { timestamp: number; hash: string }>();

function getUserHash(user: { email: string; name: string | null; avatarUrl: string | null }): string {
  return `${user.email}|${user.name || ''}|${user.avatarUrl || ''}`;
}

function shouldUpsertUser(userId: string, currentHash: string): boolean {
  const cached = userUpsertCache.get(userId);
  if (!cached) return true;

  // Check if cache expired
  if (Date.now() - cached.timestamp > USER_CACHE_TTL_MS) {
    return true;
  }

  // Check if user data changed
  return cached.hash !== currentHash;
}

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth for OPTIONS preflight requests (CORS)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Skip auth for health check
  if (req.path === '/health' || req.path.startsWith('/health')) {
    return next();
  }

  const authHeader = req.headers.authorization;

  // If no auth header and dev mode, use mock user
  if (!authHeader && config.isDev) {
    req.user = MOCK_USER;
    return next();
  }

  // Require auth header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabaseUser = await verifyToken(token);

    if (!supabaseUser) {
      // In dev mode, fall back to mock user if Supabase isn't configured
      if (config.isDev) {
        req.user = MOCK_USER;
        return next();
      }

      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }

    // Check if we need to upsert (cached with 5-min TTL to reduce DB writes)
    const userHash = getUserHash(supabaseUser);
    if (shouldUpsertUser(supabaseUser.id, userHash)) {
      console.log(`[Auth] Upserting user: ${supabaseUser.id} (${supabaseUser.email})`);
      await prisma.user.upsert({
        where: { id: supabaseUser.id },
        update: {
          email: supabaseUser.email,
          name: supabaseUser.name,
          avatarUrl: supabaseUser.avatarUrl,
        },
        create: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.name,
          avatarUrl: supabaseUser.avatarUrl,
        },
      });
      // Update cache
      userUpsertCache.set(supabaseUser.id, { timestamp: Date.now(), hash: userHash });
      console.log(`[Auth] User upsert successful for: ${supabaseUser.id}`);
    }

    req.user = supabaseUser;
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);

    // In dev mode, fall back to mock user
    if (config.isDev) {
      req.user = MOCK_USER;
      return next();
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication failed',
      },
    });
  }
}

export { MOCK_USER };
