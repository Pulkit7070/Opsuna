import { Request, Response, NextFunction } from 'express';

// Hardcoded user for MVP (no auth)
const MOCK_USER = {
  id: 'user-001',
  email: 'demo@opsuna.dev',
  name: 'Demo User',
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: typeof MOCK_USER;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  // For MVP, always attach hardcoded user
  req.user = MOCK_USER;
  next();
}

export { MOCK_USER };
