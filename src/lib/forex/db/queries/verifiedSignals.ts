import { getDbPool } from '../client';
import type { VerifiedSignal } from '@/types/agents';

interface VerifiedSignalRow {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  news_signal_id: string | null;
  chart_signal_id: string | null;
  entry_price: string;
  stop_loss: string;
  tp1: string;
  tp2: string;
  tp3: string;
  reasoning: string;
  status: string;
  verified_at: Date;
  expires_at: Date;
}

function rowToVerifiedSignal(row: VerifiedSignalRow): VerifiedSignal {
  return {
    id: row.id,
    symbol: row.symbol,
    direction: row.direction,
    confidence: row.confidence,
    newsSignalId: row.news_signal_id,
    chartSignalId: row.chart_signal_id,
    entry: {
      price: parseFloat(row.entry_price),
      timestamp: row.verified_at.getTime(),
    },
    exit: {
      tp1: parseFloat(row.tp1),
      tp2: parseFloat(row.tp2),
      tp3: parseFloat(row.tp3),
      stopLoss: parseFloat(row.stop_loss),
      trailingActive: false,
    },
    riskReward: {
      ratio: 0,
      riskPips: 0,
      rewardPips: 0,
    },
    reasoning: row.reasoning,
    newsReasoning: '',
    chartReasoning: '',
    status: row.status as VerifiedSignal['status'],
    verifiedAt: row.verified_at.getTime(),
    expiresAt: row.expires_at.getTime(),
  };
}

export async function getRecentVerifiedSignals(limit = 50, symbol?: string): Promise<VerifiedSignal[]> {
  const pool = getDbPool();

  let query: string;
  let params: unknown[];

  if (symbol) {
    query = `SELECT * FROM verified_signals WHERE symbol = $1 ORDER BY verified_at DESC LIMIT $2`;
    params = [symbol, limit];
  } else {
    query = `SELECT * FROM verified_signals ORDER BY verified_at DESC LIMIT $1`;
    params = [limit];
  }

  const result = await pool.query<VerifiedSignalRow>(query, params);
  return result.rows.map(rowToVerifiedSignal);
}

export async function getActiveVerifiedSignals(): Promise<VerifiedSignal[]> {
  const pool = getDbPool();
  const result = await pool.query<VerifiedSignalRow>(
    `SELECT * FROM verified_signals WHERE status = 'ACTIVE' AND expires_at > NOW() ORDER BY confidence DESC`
  );
  return result.rows.map(rowToVerifiedSignal);
}

export async function updateVerifiedSignalStatus(id: string, status: string): Promise<void> {
  const pool = getDbPool();
  await pool.query('UPDATE verified_signals SET status = $1 WHERE id = $2', [status, id]);
}
