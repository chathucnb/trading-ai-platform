import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRecentNewsEvents, getHighImpactNews } from '@/lib/forex/db/queries/newsEvents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const symbol = searchParams.get('symbol') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);
    const highImpact = searchParams.get('highImpact') === 'true';

    let events;
    if (highImpact) {
      const minImpact = parseInt(searchParams.get('minImpact') ?? '7', 10);
      events = await getHighImpactNews(minImpact);
    } else {
      events = await getRecentNewsEvents(limit, symbol);
    }

    return NextResponse.json({ events }, {
      headers: { 'Cache-Control': 'public, max-age=10' },
    });
  } catch (err) {
    console.error('[API] /news/events error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch news events' },
      { status: 500 }
    );
  }
}
