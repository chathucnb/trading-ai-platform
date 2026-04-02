import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getForexApiClient } from '@/lib/forex/data/forexApiClient';
import type { Timeframe } from '@/types/forex/ohlcv';

const QuerySchema = z.object({
  symbol:    z.string().min(1),
  timeframe: z.enum(['M1','M5','M15','M30','H1','H4','D1','W1']),
  limit:     z.coerce.number().min(1).max(500).default(500),
});

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const parsed = QuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { symbol, timeframe, limit } = parsed.data;
  try {
    const client = getForexApiClient();
    const candles = await client.getCandles(symbol, timeframe as Timeframe, limit);
    return NextResponse.json(candles, {
      headers: { 'Cache-Control': 'public, max-age=10, stale-while-revalidate=30' },
    });
  } catch (err) {
    console.error('[API/candles]', err);
    return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 500 });
  }
}
