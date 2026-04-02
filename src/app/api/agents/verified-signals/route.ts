import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRecentVerifiedSignals, getActiveVerifiedSignals } from '@/lib/forex/db/queries/verifiedSignals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const symbol = searchParams.get('symbol') ?? undefined;
    const activeOnly = searchParams.get('active') === 'true';
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    let signals;
    if (activeOnly) {
      signals = await getActiveVerifiedSignals();
    } else {
      signals = await getRecentVerifiedSignals(limit, symbol);
    }

    return NextResponse.json({ signals }, {
      headers: { 'Cache-Control': 'public, max-age=10' },
    });
  } catch (err) {
    console.error('[API] /agents/verified-signals error:', err);
    return NextResponse.json({ error: 'Failed to fetch verified signals' }, { status: 500 });
  }
}
