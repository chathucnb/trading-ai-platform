/**
 * forexApiClient — provider abstraction layer.
 * All data ingestion code calls this, never individual provider clients directly.
 * Swap providers by changing only this file.
 */
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';
import type { LivePrice } from '@/types/forex/pairs';
import { MAJOR_PAIRS } from '@/types/forex/pairs';
import { getTwelveDataClient } from './twelveDataClient';
import { getRedisClient, CacheKeys } from '../cache/redisClient';

export class ForexApiClient {
  async getCandles(symbol: string, timeframe: Timeframe, limit = 500): Promise<OHLCVCandle[]> {
    // 1. Try Redis cache first
    const redis = getRedisClient();
    const cacheKey = CacheKeys.candles(symbol, timeframe);
    const cached = await redis.lrange(cacheKey, 0, limit - 1);
    if (cached.length >= 20) {
      const candles = cached.map((c) => JSON.parse(c) as OHLCVCandle).reverse();
      return candles;
    }

    // 2. Fall back to API
    const client = getTwelveDataClient();
    const candles = await client.getCandles(symbol, timeframe, limit);

    // 3. Populate cache
    if (candles.length > 0) {
      const pipeline = redis.pipeline();
      pipeline.del(cacheKey);
      for (let i = candles.length - 1; i >= 0; i--) {
        pipeline.lpush(cacheKey, JSON.stringify(candles[i]));
      }
      pipeline.ltrim(cacheKey, 0, 499);
      await pipeline.exec();
    }

    return candles;
  }

  async getLivePrice(symbol: string): Promise<LivePrice | null> {
    const redis = getRedisClient();
    const cached = await redis.get(CacheKeys.price(symbol));
    if (cached) return JSON.parse(cached) as LivePrice;

    const client = getTwelveDataClient();
    const price = await client.getPrice(symbol);
    if (price == null) return null;

    const pair = MAJOR_PAIRS.find((p) => p.symbol === symbol);
    const pipSize = pair?.pipSize ?? 0.0001;
    const spread = pipSize * 2;
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

    await redis.setex(CacheKeys.price(symbol), 1, JSON.stringify(livePrice));
    return livePrice;
  }

  async getAllPrices(): Promise<LivePrice[]> {
    const results = await Promise.allSettled(
      MAJOR_PAIRS.map((p) => this.getLivePrice(p.symbol))
    );
    return results
      .filter((r): r is PromiseFulfilledResult<LivePrice> => r.status === 'fulfilled' && r.value != null)
      .map((r) => r.value);
  }
}

let _instance: ForexApiClient | null = null;
export function getForexApiClient(): ForexApiClient {
  if (!_instance) _instance = new ForexApiClient();
  return _instance;
}
