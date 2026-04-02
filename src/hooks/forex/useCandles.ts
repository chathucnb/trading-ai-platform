'use client';

import { useQuery } from '@tanstack/react-query';
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';

async function fetchCandles(symbol: string, timeframe: Timeframe, limit: number): Promise<OHLCVCandle[]> {
  const res = await fetch(`/api/forex/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch candles');
  return res.json();
}

export function useCandles(symbol: string, timeframe: Timeframe, limit = 500) {
  return useQuery({
    queryKey: ['candles', symbol, timeframe, limit],
    queryFn: () => fetchCandles(symbol, timeframe, limit),
    staleTime: 10_000,
    refetchInterval: 30_000,
    enabled: !!symbol && !!timeframe,
  });
}
