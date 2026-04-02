/**
 * Unified market API client — wraps both forex (Twelve Data) and crypto (CoinGecko).
 * All data-fetching code should call this, never individual providers directly.
 */
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';
import type { LivePrice } from '@/types/forex/pairs';
import type { MarketType } from '@/types/market';
import { CRYPTO_PAIRS } from '@/types/market/crypto';
import { getForexApiClient } from '@/lib/forex/data/forexApiClient';
import { getCoinGeckoClient } from './coinGeckoClient';
import { getRedisClient, CacheKeys } from '@/lib/forex/cache/redisClient';

function getMarketType(symbol: string): MarketType {
  return CRYPTO_PAIRS.some((p) => p.symbol === symbol) ? 'crypto' : 'forex';
}

export class MarketApiClient {
  async getCandles(symbol: string, timeframe: Timeframe, limit = 500): Promise<OHLCVCandle[]> {
    const market = getMarketType(symbol);

    // Check Redis cache first
    const redis = getRedisClient();
    const cacheKey = CacheKeys.candles(symbol, timeframe);
    const cached = await redis.lrange(cacheKey, 0, limit - 1);
    if (cached.length >= 20) {
      return cached.map((c) => JSON.parse(c) as OHLCVCandle).reverse();
    }

    // Fetch from appropriate provider
    let candles: OHLCVCandle[];
    if (market === 'crypto') {
      candles = await getCoinGeckoClient().getCandles(symbol, timeframe, limit);
    } else {
      candles = await getForexApiClient().getCandles(symbol, timeframe, limit);
    }

    // Populate cache
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

    const market = getMarketType(symbol);
    let price: LivePrice | null;

    if (market === 'crypto') {
      price = await getCoinGeckoClient().getLivePrice(symbol);
    } else {
      price = await getForexApiClient().getLivePrice(symbol);
    }

    if (price) {
      await redis.setex(CacheKeys.price(symbol), 1, JSON.stringify(price));
    }

    return price;
  }

  async getAllPrices(market?: MarketType): Promise<LivePrice[]> {
    const results: LivePrice[] = [];

    if (!market || market === 'forex') {
      const forexPrices = await getForexApiClient().getAllPrices();
      results.push(...forexPrices);
    }

    if (!market || market === 'crypto') {
      const cryptoPrices = await getCoinGeckoClient().getAllPrices();
      results.push(...cryptoPrices);
    }

    return results;
  }
}

// Singleton
let _instance: MarketApiClient | null = null;
export function getMarketApiClient(): MarketApiClient {
  if (!_instance) _instance = new MarketApiClient();
  return _instance;
}
