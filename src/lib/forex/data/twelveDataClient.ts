import { z } from 'zod';
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';
import { normalizeTwelveDataCandles } from './dataNormalizer';

const BASE_URL = 'https://api.twelvedata.com';

const TF_MAP: Record<Timeframe, string> = {
  M1: '1min', M5: '5min', M15: '15min', M30: '30min',
  H1: '1h', H4: '4h', D1: '1day', W1: '1week',
};

const TimeSeriesResponseSchema = z.object({
  values: z.array(z.object({
    datetime: z.string(),
    open:     z.string(),
    high:     z.string(),
    low:      z.string(),
    close:    z.string(),
    volume:   z.string().optional(),
  })).optional(),
  status: z.string().optional(),
  message: z.string().optional(),
});

export class TwelveDataClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCandles(symbol: string, timeframe: Timeframe, outputSize = 500): Promise<OHLCVCandle[]> {
    const tf = TF_MAP[timeframe];
    const apiSymbol = symbol.replace('/', '');
    const url = `${BASE_URL}/time_series?symbol=${apiSymbol}&interval=${tf}&outputsize=${outputSize}&apikey=${this.apiKey}`;

    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`Twelve Data HTTP ${res.status}`);

    const raw = await res.json();
    const parsed = TimeSeriesResponseSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.values) {
      console.error('[TwelveData] Invalid response', raw);
      return [];
    }
    return normalizeTwelveDataCandles(parsed.data, symbol);
  }

  async getPrice(symbol: string): Promise<number | null> {
    const apiSymbol = symbol.replace('/', '');
    const url = `${BASE_URL}/price?symbol=${apiSymbol}&apikey=${this.apiKey}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const raw = await res.json();
    return raw?.price ? parseFloat(raw.price) : null;
  }

  /** Returns the WebSocket endpoint URL for real-time streaming */
  getWebSocketUrl(): string {
    return `wss://ws.twelvedata.com/v1/quotes/price?apikey=${this.apiKey}`;
  }
}

// Singleton
let _client: TwelveDataClient | null = null;
export function getTwelveDataClient(): TwelveDataClient {
  if (!_client) {
    const key = process.env.TWELVE_DATA_API_KEY ?? '';
    if (!key) console.warn('[TwelveData] No API key set — set TWELVE_DATA_API_KEY in .env.local');
    _client = new TwelveDataClient(key);
  }
  return _client;
}
