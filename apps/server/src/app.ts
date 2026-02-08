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
  toolsRouter,
  memoryRouter,
  artifactsRouter,
  agentsRouter,
  builderRouter,
} from './routes';

const app = express();

// Trust proxy (required for Railway/Vercel - they use reverse proxies)
app.set('trust proxy', 1);

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
app.use('/api/tools', toolsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/builder', builderRouter);
app.use('/api', artifactsRouter); // Artifacts routes at /api level
app.use('/health', healthRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
