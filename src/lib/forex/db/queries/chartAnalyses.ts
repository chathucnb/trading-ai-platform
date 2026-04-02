import { getDbPool } from '../client';
import type { ChartAnalysis, AgentSignal } from '@/types/agents';
import type { Timeframe } from '@/types/forex/ohlcv';

interface ChartAnalysisRow {
  id: string;
  symbol: string;
  timeframe: string;
  patterns: string[];
  trend_assessment: string;
  support_levels: string[];
  resistance_levels: string[];
  direction: string | null;
  confidence: number | null;
  reasoning: string;
  analyzed_at: Date;
}

function rowToChartAnalysis(row: ChartAnalysisRow): ChartAnalysis {
  const recommendation: AgentSignal = {
    id: row.id,
    source: 'chart',
    symbol: row.symbol,
    direction: (row.direction as 'LONG' | 'SHORT' | 'NEUTRAL') ?? 'NEUTRAL',
    confidence: row.confidence ?? 0,
    reasoning: row.reasoning,
    timestamp: row.analyzed_at.getTime(),
    metadata: { timeframe: row.timeframe, patterns: row.patterns },
  };

  return {
    id: row.id,
    symbol: row.symbol,
    timeframe: row.timeframe as Timeframe,
    patterns: row.patterns,
    trendAssessment: row.trend_assessment,
    keyLevels: {
      support: row.support_levels.map(Number),
      resistance: row.resistance_levels.map(Number),
    },
    recommendation,
    reasoning: row.reasoning,
    analyzedAt: row.analyzed_at.getTime(),
  };
}

export async function getRecentChartAnalyses(limit = 50, symbol?: string): Promise<ChartAnalysis[]> {
  const pool = getDbPool();

  let query: string;
  let params: unknown[];

  if (symbol) {
    query = `SELECT * FROM chart_analyses WHERE symbol = $1 ORDER BY analyzed_at DESC LIMIT $2`;
    params = [symbol, limit];
  } else {
    query = `SELECT * FROM chart_analyses ORDER BY analyzed_at DESC LIMIT $1`;
    params = [limit];
  }

  const result = await pool.query<ChartAnalysisRow>(query, params);
  return result.rows.map(rowToChartAnalysis);
}

export async function getChartAnalysisById(id: string): Promise<ChartAnalysis | null> {
  const pool = getDbPool();
  const result = await pool.query<ChartAnalysisRow>('SELECT * FROM chart_analyses WHERE id = $1', [id]);
  return result.rows[0] ? rowToChartAnalysis(result.rows[0]) : null;
}
