/**
 * Custom Next.js server with WebSocket + AI Trading Agents.
 * Run with: npx tsx server.ts
 */
import { createServer } from 'http';
import next from 'next';
import { createWsServer } from './src/lib/forex/websocket/wsServer';
import { getOrchestrator } from './src/lib/agents/orchestrator';
import { tryConnectRedis } from './src/lib/forex/cache/redisClient';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT ?? '3000', 10);

async function main() {
  const app = next({ dev, hostname: '0.0.0.0', port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  // Start listening FIRST so healthcheck can pass
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
    console.log(`> WebSocket available at ws://0.0.0.0:${port}/ws`);
  });

  // Attach WebSocket server at /ws
  createWsServer(httpServer);

  // Try to connect Redis (non-blocking — agents start only if Redis is available)
  const redisOk = await tryConnectRedis();
  if (redisOk) {
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.startAll();
      console.log('> AI Trading Agents active');
    } catch (err) {
      console.error('> Failed to start agents (non-fatal):', err);
    }
  } else {
    console.warn('> Agents skipped — Redis not available');
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n> Shutting down...');
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.stopAll();
    } catch { /* ignore */ }
    httpServer.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
