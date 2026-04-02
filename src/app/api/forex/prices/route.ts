import { NextRequest, NextResponse } from 'next/server';
import { getForexApiClient } from '@/lib/forex/data/forexApiClient';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol');
  const client = getForexApiClient();

  try {
    if (symbol) {
      const price = await client.getLivePrice(symbol);
      if (!price) return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
      return NextResponse.json(price, {
        headers: { 'Cache-Control': 'public, max-age=5, stale-while-revalidate=10' },
      });
    }

    const prices = await client.getAllPrices();
    return NextResponse.json(prices, {
      headers: { 'Cache-Control': 'public, max-age=5, stale-while-revalidate=10' },
    });
  } catch (err) {
    console.error('[API/prices]', err);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
