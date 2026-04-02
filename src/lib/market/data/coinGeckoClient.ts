/**
 * CoinGecko API client for crypto market data.
 * Uses the free API (no key required, 10-30 calls/min).
 */
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';
import type { LivePrice } from '@/types/forex/pairs';
import { COINGECKO_ID_MAP } from '@/types/market';
import { CRYPTO_PAIRS } from '@/types/market/crypto';

const BASE_URL = 'https://api.coingecko.com/api/v3';

/** Map our timeframes to CoinGecko days parameter */
const TF_TO_DAYS: Record<Timeframe, number> = {
  M1: 1,       // 1-day data gives ~5-min candles
  M5: 1,
  M15: 1,
  M30: 7,      // 7-day data gives ~30-min candles
  H1: 14,      // 14-day data gives ~hourly candles
  H4: 30,      // 30-day data gives ~4h candles
  D1: 365,     // 1-year data gives daily candles
  W1: 365,
};

export class CoinGeckoClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? '';
  }

  private async fetchJson(url: string): Promise<unknown> {
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (this.apiKey) {
      headers['x-cg-demo-api-key'] = this.apiKey;
    }
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}: ${res.statusText}`);
    return res.json();
  }

  private getCoinId(symbol: string): string | null {
    return COINGECKO_ID_MAP[symbol] ?? null;
  }

  async getCandles(symbol: string, timeframe: Timeframe, limit = 500): Promise<OHLCVCandle[]> {
    const coinId = this.getCoinId(symbol);
    if (!coinId) return [];

    const days = TF_TO_DAYS[timeframe];
    const url = `${BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;

    const raw = await this.fetchJson(url) as number[][];
    if (!Array.isArray(raw)) return [];

    // CoinGecko OHLC format: [timestamp_ms, open, high, low, close]
    const candles: OHLCVCandle[] = raw.map((item) => ({
      time: Math.floor(item[0] / 1000), // convert ms to seconds
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0, // OHLC endpoint doesn't include volume
    }));

    return candles.slice(-limit);
  }

  async getLivePrice(symbol: string): Promise<LivePrice | null> {
    const coinId = this.getCoinId(symbol);
    if (!coinId) return null;

    const url = `${BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_last_updated_at=true`;
    const raw = await this.fetchJson(url) as Record<string, Record<string, number>>;

    const data = raw[coinId];
    if (!data) return null;

    const price = data.usd;
    const pair = CRYPTO_PAIRS.find((p) => p.symbol === symbol);
    const pipSize = pair?.pipSize ?? 0.01;
    const spread = pipSize * 2;

    return {
      symbol,
      bid: price - spread / 2,
      ask: price + spread / 2,
      mid: price,
      spread: 2,
      timestamp: (data.last_updated_at ?? Date.now() / 1000) * 1000,
      change: 0,
      changePercent: data.usd_24h_change ?? 0,
      dailyHigh: price,
      dailyLow: price,
    };
  }

  async getAllPrices(): Promise<LivePrice[]> {
    const coinIds = Object.values(COINGECKO_ID_MAP).join(',');
    const url = `${BASE_URL}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;
    const raw = await this.fetchJson(url) as Record<string, Record<string, number>>;

    // Reverse map: coinId -> symbol
    const idToSymbol = Object.fromEntries(
      Object.entries(COINGECKO_ID_MAP).map(([sym, id]) => [id, sym])
    );

    const prices: LivePrice[] = [];
    for (const [coinId, data] of Object.entries(raw)) {
      const symbol = idToSymbol[coinId];
      if (!symbol || !data.usd) continue;

      const price = data.usd;
      const pair = CRYPTO_PAIRS.find((p) => p.symbol === symbol);
      const pipSize = pair?.pipSize ?? 0.01;
      const spread = pipSize * 2;

      prices.push({
        symbol,
        bid: price - spread / 2,
        ask: price + spread / 2,
        mid: price,
        spread: 2,
        timestamp: (data.last_updated_at ?? Date.now() / 1000) * 1000,
        change: 0,
        changePercent: data.usd_24h_change ?? 0,
        dailyHigh: price,
        dailyLow: price,
      });
    }

    return prices;
  }
}

// Singleton
let _client: CoinGeckoClient | null = null;
export function getCoinGeckoClient(): CoinGeckoClient {
  if (!_client) {
    _client = new CoinGeckoClient(process.env.COINGECKO_API_KEY);
  }
  return _client;
}
