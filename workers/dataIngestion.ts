/**
 * Data Ingestion Worker
 * Polls Twelve Data for prices and candles, caches in Redis, publishes to pub/sub.
 * In Phase 1, this runs in-process via setInterval.
 * In Phase 4, this becomes a standalone process managed by PM2.
 */
import { getRedisClient, getRedisPublisher, CacheKeys, MAX_CACHED_CANDLES } from '../src/lib/forex/cache/redisClient';
import { getTwelveDataClient } from '../src/lib/forex/data/twelveDataClient';
import { MAJOR_PAIRS } from '../src/types/forex/pairs';
import type { LivePrice } from '../src/types/forex/pairs';
import type { OHLCVCandle, Timeframe } from '../src/types/forex/ohlcv';
import type { PriceUpdateMessage, CandleUpdateMessage } from '../src/types/forex/websocket';
import { insertCandle } from '../src/lib/forex/db/queries/ohlcv';

const POLL_INTERVAL_MS = 10_000; // 10s (respects free tier rate limits)
const CANDLE_TIMEFRAMES: Timeframe[] = ['M5', 'M15', 'H1', 'H4'];

let pairIndex = 0; // round-robin through pairs to avoid rate limits

async function updatePrice(symbol: string): Promise<void> {
  const redis = getRedisClient();
  const pub = getRedisPublisher();
  const client = getTwelveDataClient();

  const price = await client.getPrice(symbol);
  if (price == null) return;

  const pair = MAJOR_PAIRS.find((p) => p.symbol === symbol)!;
  const spread = pair.pipSize * 2;

  const livePrice: LivePrice = {
    symbol,
    bid: price - spread / 2,
    ask: price + spread / 2,
    mid: price,
    spread: 2,
    timestamp: Date.now(),
    change: 0,
    changePercent: 0,
    dailyHigh: price,
    dailyLow: price,
  };

  // Cache for 10s
  await redis.setex(CacheKeys.price(symbol), 10, JSON.stringify(livePrice));

  // Publish to WS hub
  const msg: PriceUpdateMessage = { type: 'PRICE_UPDATE', data: livePrice };
  await pub.publish(CacheKeys.priceChannel(symbol), JSON.stringify(msg));
}

async function updateCandles(symbol: string, timeframe: Timeframe): Promise<void> {
  const redis = getRedisClient();
  const pub = getRedisPublisher();
  const client = getTwelveDataClient();

  const candles = await client.getCandles(symbol, timeframe, 2); // fetch latest 2 candles
  if (candles.length === 0) return;

  const latest = candles.at(-1)!;
  const cacheKey = CacheKeys.candles(symbol, timeframe);

  // Persist to DB (fire-and-forget, don't let DB errors block the poll)
  insertCandle(symbol, timeframe, latest).catch((e) =>
    console.error('[DataIngestion] DB insert failed', e)
  );

  // Update Redis cache
  const existing = await redis.lindex(cacheKey, 0); // most recent at head
  if (existing) {
    const existingCandle = JSON.parse(existing) as OHLCVCandle;
    if (existingCandle.time === latest.time) {
      // Update current candle (still forming)
      await redis.lset(cacheKey, 0, JSON.stringify(latest));
    } else {
      // New candle closed
      await redis.lpush(cacheKey, JSON.stringify(latest));
      await redis.ltrim(cacheKey, 0, MAX_CACHED_CANDLES - 1);
    }
  } else {
    await redis.lpush(cacheKey, JSON.stringify(latest));
  }

  // Broadcast candle update
  const msg: CandleUpdateMessage = {
    type: 'CANDLE_UPDATE',
    symbol,
    timeframe,
    candle: latest,
    isClosed: candles.length > 1,
  };
  await pub.publish(CacheKeys.priceChannel(symbol), JSON.stringify(msg));
}

export function startDataIngestionWorker(): NodeJS.Timeout {
  console.log('[DataIngestion] Worker started');

  return setInterval(async () => {
    const pair = MAJOR_PAIRS[pairIndex % MAJOR_PAIRS.length];
    pairIndex++;

    try {
      await updatePrice(pair.symbol);
      // Update M5 candles on every tick, others less frequently
      const tf: Timeframe = pairIndex % 4 === 0 ? 'H1' : pairIndex % 2 === 0 ? 'M15' : 'M5';
      await updateCandles(pair.symbol, tf);
    } catch (err) {
      console.error(`[DataIngestion] Error for ${pair.symbol}:`, err);
    }
  }, POLL_INTERVAL_MS);
}
