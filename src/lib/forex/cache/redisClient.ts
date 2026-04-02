import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

// Singleton for commands
let _client: Redis | null = null;
// Separate connection for pub/sub (subscribe blocks the connection)
let _subscriber: Redis | null = null;
let _publisher: Redis | null = null;

export function getRedisClient(): Redis {
  if (!_client) {
    _client = new Redis(REDIS_URL, { lazyConnect: false, maxRetriesPerRequest: 3 });
    _client.on('error', (err) => console.error('[Redis] client error', err));
  }
  return _client;
}

export function getRedisSubscriber(): Redis {
  if (!_subscriber) {
    _subscriber = new Redis(REDIS_URL, { lazyConnect: false });
    _subscriber.on('error', (err) => console.error('[Redis] subscriber error', err));
  }
  return _subscriber;
}

export function getRedisPublisher(): Redis {
  if (!_publisher) {
    _publisher = new Redis(REDIS_URL, { lazyConnect: false });
    _publisher.on('error', (err) => console.error('[Redis] publisher error', err));
  }
  return _publisher;
}

// ── Cache key constants ────────────────────────────────────────────────────
export const CacheKeys = {
  /** Current tick price for a pair */
  price: (symbol: string) => `price:${symbol}`,
  /** Last N candles: Redis list, most recent at head */
  candles: (symbol: string, tf: string) => `candles:${symbol}:${tf}`,
  /** Pub/sub channel for price updates */
  priceChannel: (symbol: string) => `channel:prices:${symbol}`,
  /** Pub/sub channel for signal events */
  signalChannel: (symbol: string) => `channel:signals:${symbol}`,
  /** Broadcast channel for all price updates */
  allPricesChannel: () => 'channel:prices:*',
  /** Pub/sub channel for news events */
  newsChannel: () => 'channel:news:events',
  /** Pub/sub channel for chart analysis */
  chartAnalysisChannel: () => 'channel:agent:chart-analysis',
  /** Pub/sub channel for verified signals */
  verifiedSignalsChannel: () => 'channel:agent:verified-signals',
  /** Pub/sub channel for agent reasoning */
  reasoningChannel: () => 'channel:agent:reasoning',
  /** Pub/sub channel for agent status */
  agentStatusChannel: () => 'channel:agent:status',
  /** Set of seen news article IDs (dedup) */
  newsSeenSet: () => 'news:seen',
  /** Recent news events for a symbol (rolling window) */
  recentNews: (symbol: string) => `agent:recent-news:${symbol}`,
  /** Recent chart analyses for a symbol (rolling window) */
  recentChartAnalysis: (symbol: string) => `agent:recent-chart:${symbol}`,
};

export const MAX_CACHED_CANDLES = 500;
