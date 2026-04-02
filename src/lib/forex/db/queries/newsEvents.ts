import { getDbPool } from '../client';
import type { NewsEvent } from '@/types/agents';

interface NewsEventRow {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string | null;
  published_at: Date;
  symbols: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact_score: number;
  expected_duration: 'short-term' | 'medium-term' | 'long-term';
  reasoning: string;
  analyzed_at: Date;
}

function rowToNewsEvent(row: NewsEventRow): NewsEvent {
  return {
    id: row.id,
    headline: row.headline,
    summary: row.summary,
    source: row.source,
    url: row.url ?? '',
    publishedAt: row.published_at.getTime(),
    symbols: row.symbols,
    sentiment: row.sentiment,
    impactScore: row.impact_score,
    expectedDuration: row.expected_duration,
    reasoning: row.reasoning,
    analyzedAt: row.analyzed_at.getTime(),
  };
}

export async function getRecentNewsEvents(limit = 50, symbol?: string): Promise<NewsEvent[]> {
  const pool = getDbPool();

  let query: string;
  let params: unknown[];

  if (symbol) {
    query = `SELECT * FROM news_events WHERE $1 = ANY(symbols) ORDER BY published_at DESC LIMIT $2`;
    params = [symbol, limit];
  } else {
    query = `SELECT * FROM news_events ORDER BY published_at DESC LIMIT $1`;
    params = [limit];
  }

  const result = await pool.query<NewsEventRow>(query, params);
  return result.rows.map(rowToNewsEvent);
}

export async function getHighImpactNews(minImpact = 7, hoursBack = 24): Promise<NewsEvent[]> {
  const pool = getDbPool();
  const since = new Date(Date.now() - hoursBack * 3600 * 1000);

  const result = await pool.query<NewsEventRow>(
    `SELECT * FROM news_events
     WHERE impact_score >= $1 AND published_at >= $2
     ORDER BY impact_score DESC, published_at DESC`,
    [minImpact, since]
  );

  return result.rows.map(rowToNewsEvent);
}

export async function getNewsEventById(id: string): Promise<NewsEvent | null> {
  const pool = getDbPool();
  const result = await pool.query<NewsEventRow>('SELECT * FROM news_events WHERE id = $1', [id]);
  return result.rows[0] ? rowToNewsEvent(result.rows[0]) : null;
}
