'use client';

import type { ServerMessage, ClientMessage } from '@/types/forex/websocket';

type MessageHandler = (msg: ServerMessage) => void;

export class ForexWebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30_000;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private subscriptions: { pairs: string[]; timeframes: string[] } = { pairs: [], timeframes: [] };
  private connected = false;

  private get wsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      this.connected = true;
      this.reconnectDelay = 1000;
      // Re-subscribe after reconnect
      if (this.subscriptions.pairs.length > 0) {
        this.send({ type: 'SUBSCRIBE', ...this.subscriptions });
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as ServerMessage;
        if (msg.type === 'PING') {
          this.send({ type: 'PONG' });
          return;
        }
        this.handlers.forEach((h) => h(msg));
      } catch {
        // ignore
      }
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
  }

  subscribe(pairs: string[], timeframes: string[] = ['M5', 'M15', 'H1']): void {
    this.subscriptions = { pairs, timeframes };
    this.send({ type: 'SUBSCRIBE', pairs, timeframes });
  }

  unsubscribe(pairs: string[]): void {
    this.send({ type: 'UNSUBSCRIBE', pairs });
  }

  addHandler(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private send(msg: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  get isConnected(): boolean {
    return this.connected;
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }
}

// Browser singleton
let _wsClient: ForexWebSocketClient | null = null;
export function getWsClient(): ForexWebSocketClient {
  if (!_wsClient) _wsClient = new ForexWebSocketClient();
  return _wsClient;
}
