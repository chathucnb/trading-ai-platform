import type { OHLCVCandle } from '@/types/forex/ohlcv';
import type { LivePrice } from '@/types/forex/pairs';
import { MAJOR_PAIRS } from '@/types/forex/pairs';

// ── Normalize Twelve Data REST OHLCV response ──────────────────────────────
export function normalizeTwelveDataCandles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any,
  symbol: string
): OHLCVCandle[] {
  if (!raw?.values || !Array.isArray(raw.values)) return [];
  // Twelve Data returns newest-first; reverse to oldest-first
  return raw.values
    .slice()
    .reverse()
    .map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any): OHLCVCandle => ({
        time: Math.floor(new Date(v.datetime).getTime() / 1000),
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume ?? '0'),
      })
    );
}

// ── Normalize Twelve Data WebSocket tick ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeTwelveDataTick(raw: any): LivePrice | null {
  if (!raw?.symbol || !raw?.price) return null;
  const symbol = raw.symbol.replace(':', '/');
  const pair = MAJOR_PAIRS.find((p) => p.symbol === symbol);
  const price = parseFloat(raw.price);
  const spread = pair ? pair.pipSize * 2 : 0; // estimated spread
  return {
    symbol,
    bid: price - spread / 2,
    ask: price + spread / 2,
    mid: price,
    spread: 2,
    timestamp: raw.timestamp ? raw.timestamp * 1000 : Date.now(),
    change: parseFloat(raw.change ?? '0'),
    changePercent: parseFloat(raw.percent_change ?? '0'),
    dailyHigh: parseFloat(raw.day_high ?? price.toString()),
    dailyLow: parseFloat(raw.day_low ?? price.toString()),
  };
}

// ── Normalize Finnhub tick ────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeFinnhubTick(raw: any): LivePrice | null {
  if (!raw?.s || !raw?.b) return null;
  const symbol = raw.s.replace('OANDA:', '').replace('_', '/');
  const bid = parseFloat(raw.b);
  const ask = parseFloat(raw.a ?? raw.b);
  const pair = MAJOR_PAIRS.find((p) => p.symbol === symbol);
  const pipSize = pair?.pipSize ?? 0.0001;
  return {
    symbol,
    bid,
    ask,
    mid: (bid + ask) / 2,
    spread: Math.round((ask - bid) / pipSize * 10) / 10,
    timestamp: (raw.t ?? Date.now() / 1000) * 1000,
    change: 0,
    changePercent: 0,
    dailyHigh: bid,
    dailyLow: bid,
  };
}
