import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getGeminiClient } from '../services/ai';

const router = Router();

router.get('/', async (_req, res) => {
  let dbHealthy = false;
  let aiHealthy = false;

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  // Check AI (just verify client is initialized)
  aiHealthy = getGeminiClient() !== null;

  const status = dbHealthy ? 'healthy' : 'degraded';

  res.json({
    success: true,
    data: {
      status,
      version: '0.1.0',
      timestamp: new Date(),
      services: {
        database: dbHealthy,
        ai: aiHealthy,
        websocket: true, // Assume healthy if server is running
      },
    },
  });
});

export { router as healthRouter };
