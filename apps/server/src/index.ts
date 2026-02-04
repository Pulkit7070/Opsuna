import { createServer } from 'http';
import { app } from './app';
import { config } from './lib/config';
import { prisma } from './lib/prisma';
import { wsManager } from './services/events';

async function bootstrap() {
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
