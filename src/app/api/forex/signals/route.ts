import { NextRequest, NextResponse } from 'next/server';
import { getSignals } from '@/lib/forex/db/queries/signals';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') ?? undefined;
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '50', 10), 200);

  try {
    const signals = await getSignals(symbol, limit);
    return NextResponse.json(signals, {
      headers: { 'Cache-Control': 'public, max-age=10' },
    });
  } catch (err) {
    console.error('[API/signals]', err);
    // If DB not connected, return empty array gracefully
    return NextResponse.json([], { status: 200 });
  }
}
