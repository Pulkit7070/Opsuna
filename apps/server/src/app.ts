import express from 'express';
import helmet from 'helmet';
import {
  corsMiddleware,
  authMiddleware,
  errorHandler,
  notFoundHandler,
  apiLimiter,
} from './middleware';
import {
  executeRouter,
  executionsRouter,
  confirmRouter,
  rollbackRouter,
  healthRouter,
} from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Rate limiting
app.use('/api', apiLimiter);

// Auth middleware (hardcoded user for MVP)
app.use(authMiddleware);

// Routes
app.use('/api/execute', executeRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/confirm', confirmRouter);
app.use('/api/rollback', rollbackRouter);
app.use('/health', healthRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
