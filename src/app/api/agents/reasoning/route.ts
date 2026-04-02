import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRecentChartAnalyses } from '@/lib/forex/db/queries/chartAnalyses';
import { getRecentNewsEvents } from '@/lib/forex/db/queries/newsEvents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const symbol = searchParams.get('symbol') ?? undefined;
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    const [chartAnalyses, newsEvents] = await Promise.all([
      getRecentChartAnalyses(limit, symbol),
      getRecentNewsEvents(limit, symbol),
    ]);

    // Merge and sort by time
    const reasoning = [
      ...chartAnalyses.map((a) => ({
        agentName: 'ChartAgent',
        timestamp: a.analyzedAt,
        symbol: a.symbol,
        action: 'chart_analysis',
        reasoning: `${a.trendAssessment} | ${a.patterns.join(', ') || 'No patterns'} | ${a.recommendation.direction} (${a.recommendation.confidence}%)`,
        confidence: a.recommendation.confidence,
      })),
      ...newsEvents.map((n) => ({
        agentName: 'NewsAgent',
        timestamp: n.analyzedAt,
        symbol: n.symbols[0] ?? '*',
        action: 'news_analysis',
        reasoning: `${n.sentiment} (impact: ${n.impactScore}/10): ${n.reasoning}`,
        confidence: n.impactScore * 10,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    return NextResponse.json({ reasoning }, {
      headers: { 'Cache-Control': 'public, max-age=10' },
    });
  } catch (err) {
    console.error('[API] /agents/reasoning error:', err);
    return NextResponse.json({ error: 'Failed to fetch reasoning' }, { status: 500 });
  }
}
