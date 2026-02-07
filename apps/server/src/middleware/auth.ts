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

    // Upsert user in our database on every authenticated request
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
    console.log(`[Auth] User upsert successful for: ${supabaseUser.id}`);

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
