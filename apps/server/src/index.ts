import { createServer } from 'http';
import { app } from './app';
import { config } from './lib/config';
import { prisma } from './lib/prisma';
import { wsManager } from './services/events';
import { MOCK_USER } from './middleware/auth';

async function bootstrap() {
  // Create HTTP server
  const server = createServer(app);

  // Initialize WebSocket
  wsManager.initialize(server);

  // Ensure demo user exists
  try {
    await prisma.user.upsert({
      where: { id: MOCK_USER.id },
      update: {},
      create: {
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        name: MOCK_USER.name,
      },
    });
    console.log('[DB] Demo user initialized');
  } catch (error) {
    console.error('[DB] Failed to initialize demo user:', error);
  }

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
║   AI Provider: ${config.geminiApiKey ? 'Google Gemini'.padEnd(40) : 'Mock (no API key)'.padEnd(40)}║
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
