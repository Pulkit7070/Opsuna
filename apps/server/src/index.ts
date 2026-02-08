import { createServer } from 'http';
import { app } from './app';
import { config } from './lib/config';
import { prisma } from './lib/prisma';
import { wsManager } from './services/events';
import { initializeComposioTools } from './services/tools/composio';

async function bootstrap() {
  // In dev mode, ensure mock user exists for testing
  if (config.isDev) {
    try {
      await prisma.user.upsert({
        where: { id: 'user-001' },
        update: {},
        create: {
          id: 'user-001',
          email: 'demo@opsuna.dev',
          name: 'Demo User',
        },
      });
      console.log('[Server] Dev mode: Mock user ready');
    } catch (error) {
      console.warn('[Server] Failed to create mock user:', error);
    }
  }

  // Initialize Composio tools (load into registry)
  if (config.composioApiKey) {
    await initializeComposioTools();
  }

  // Create HTTP server
  const server = createServer(app);

  // Initialize WebSocket
  wsManager.initialize(server);

  // Start server
  server.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Opsuna Tambo Server                                     ║
║                                                           ║
║   HTTP:      http://localhost:${config.port}                      ║
║   WebSocket: ws://localhost:${config.port}/ws                     ║
║   Health:    http://localhost:${config.port}/health               ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║   AI Provider: ${(config.geminiApiKey ? 'Google Gemini' : 'Mock (no API key)').padEnd(40)}║
║   Auth:        ${(config.supabaseUrl ? 'Supabase' : 'Mock (dev mode)').padEnd(40)}║
║   Tools:       ${(config.composioApiKey ? 'Composio + Local' : 'Local only').padEnd(40)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

   CORS Origins: ${JSON.stringify(config.corsOrigin)}
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Server] SIGTERM received, shutting down...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('[Server] Failed to start:', error);
  process.exit(1);
});
// Railway deploy trigger
