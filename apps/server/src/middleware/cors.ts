import cors from 'cors';
import { config } from '../lib/config';

// Handle dynamic origin checking for multiple allowed origins
const originHandler = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (like mobile apps or curl)
  if (!origin) {
    return callback(null, true);
  }

  const allowedOrigins = Array.isArray(config.corsOrigin)
    ? config.corsOrigin
    : [config.corsOrigin];

  // Log for debugging in production
  if (config.isProd) {
    console.log(`[CORS] Origin: ${origin}, Allowed: ${allowedOrigins.join(', ')}`);
  }

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else if (config.isDev) {
    // In development, allow any localhost origin
    if (origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      // Don't throw error, just deny - prevents 500
      callback(null, false);
    }
  } else {
    // Don't throw error, just deny - prevents 500
    callback(null, false);
  }
};

export const corsMiddleware = cors({
  origin: originHandler,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
