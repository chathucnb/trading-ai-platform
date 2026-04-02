import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Server } from 'http';
import { getRedisSubscriber, isRedisAvailable } from '../cache/redisClient';
import { ClientMessageSchema } from '@/types/forex/websocket';
import type { ServerMessage } from '@/types/forex/websocket';

type TopicKey = string; // e.g. "EUR/USD" or "SIGNAL"

interface ClientState {
  ws: WebSocket;
  subscriptions: Set<TopicKey>;
  lastPong: number;
}

const clients = new Map<WebSocket, ClientState>();

function broadcast(topic: TopicKey, message: ServerMessage): void {
  const payload = JSON.stringify(message);
  for (const [ws, state] of clients) {
    if (ws.readyState === WebSocket.OPEN && (state.subscriptions.has(topic) || state.subscriptions.has('*'))) {
      ws.send(payload);
    }
  }
}

function broadcastAll(message: ServerMessage): void {
  const payload = JSON.stringify(message);
  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}

function setupRedisSubscriber(): void {
  try {
    const sub = getRedisSubscriber();
    sub.connect().then(() => {
      sub.psubscribe('channel:prices:*', 'channel:signals:*', 'channel:news:*', 'channel:agent:*');
      sub.on('pmessage', (_pattern, channel, rawMessage) => {
        try {
          const message = JSON.parse(rawMessage) as ServerMessage;
          const topic = channel.split(':').slice(2).join(':') || '*';
          broadcast(topic, message);
        } catch {
          // ignore malformed messages
        }
      });
      console.log('[WS] Redis subscriber connected');
    }).catch((err) => {
      console.warn('[WS] Redis subscriber failed to connect:', err.message);
      // Retry after 10 seconds
      setTimeout(setupRedisSubscriber, 10_000);
    });
  } catch (err) {
    console.warn('[WS] Failed to setup Redis subscriber:', (err as Error).message);
    setTimeout(setupRedisSubscriber, 10_000);
  }
}

export function createWsServer(httpServer: Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // ── Redis pub/sub listener (non-blocking) ────────────────────────────────
  setupRedisSubscriber();

  // ── Connection handler ───────────────────────────────────────────────────
  wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
    const state: ClientState = { ws, subscriptions: new Set(['*']), lastPong: Date.now() };
    clients.set(ws, state);

    // Send handshake (includes both forex and crypto pairs)
    const connected: ServerMessage = {
      type: 'CONNECTED',
      pairs: [
        'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
        'BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD', 'AVAX/USD',
      ],
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(connected));

    ws.on('message', (data) => {
      try {
        const parsed = ClientMessageSchema.safeParse(JSON.parse(data.toString()));
        if (!parsed.success) return;
        const msg = parsed.data;

        if (msg.type === 'SUBSCRIBE') {
          state.subscriptions.clear();
          msg.pairs.forEach((p) => state.subscriptions.add(p));
          state.subscriptions.add('SIGNAL');
        } else if (msg.type === 'UNSUBSCRIBE') {
          msg.pairs.forEach((p) => state.subscriptions.delete(p));
        } else if (msg.type === 'PONG') {
          state.lastPong = Date.now();
        }
      } catch {
        // ignore
      }
    });

    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  // ── Heartbeat ping every 30s ─────────────────────────────────────────────
  setInterval(() => {
    const now = Date.now();
    const ping: ServerMessage = { type: 'PING', timestamp: now };
    for (const [ws, state] of clients) {
      if (now - state.lastPong > 60_000) {
        ws.terminate();
        clients.delete(ws);
        continue;
      }
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(ping));
    }
  }, 30_000);

  console.log('[WS] WebSocket server attached at /ws');
  return wss;
}

export { broadcastAll, broadcast };
