/**
 * Custom Next.js server with WebSocket + AI Trading Agents.
 * Run with: npx tsx server.ts
 */
import { createServer } from 'http';
import next from 'next';
import { createWsServer } from './src/lib/forex/websocket/wsServer';
import { getOrchestrator } from './src/lib/agents/orchestrator';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT ?? '3000', 10);

async function main() {
  const app = next({ dev, hostname: 'localhost', port });
  const handle = app.getRequestHandler();

  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  // Attach WebSocket server at /ws
  createWsServer(httpServer);

  // Start AI trading agents
  const orchestrator = getOrchestrator();
  await orchestrator.startAll();

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n> Shutting down...');
    await orchestrator.stopAll();
    httpServer.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> WebSocket available at ws://localhost:${port}/ws`);
    console.log(`> AI Trading Agents active`);
  });
}

main().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
