import { getDbPool } from '../client';
import type { TradeSignal } from '@/types/forex/signals';

export async function insertSignal(signal: TradeSignal): Promise<void> {
  const pool = getDbPool();
  await pool.query(
    `INSERT INTO trade_signals
     (id, symbol, timeframe, direction, entry_price, entry_time,
      tp1, tp2, tp3, stop_loss, risk_pips, reward_pips, rr_ratio,
      confidence, strength, status, conditions, expires_at)
     VALUES ($1,$2,$3,$4,$5,to_timestamp($6/1000.0),$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,to_timestamp($18/1000.0))
     ON CONFLICT (id) DO NOTHING`,
    [
      signal.id, signal.symbol, signal.timeframe, signal.direction,
      signal.entry.price, signal.entry.timestamp,
      signal.exit.tp1, signal.exit.tp2, signal.exit.tp3, signal.exit.stopLoss,
      signal.riskReward.riskPips, signal.riskReward.rewardPips, signal.riskReward.ratio,
      signal.confidence, signal.strength, signal.status, signal.conditions, signal.expiresAt,
    ]
  );
}

export async function getSignals(symbol?: string, limit = 50): Promise<TradeSignal[]> {
  const pool = getDbPool();
  const params: (string | number)[] = [limit];
  const whereClause = symbol ? `WHERE symbol = $2` : '';
  if (symbol) params.push(symbol);

  const { rows } = await pool.query(
    `SELECT id, symbol, timeframe, direction,
            entry_price, extract(epoch from entry_time)*1000 AS entry_time,
            tp1, tp2, tp3, stop_loss, risk_pips, reward_pips, rr_ratio,
            confidence, strength, status, conditions,
            extract(epoch from created_at)*1000 AS created_at,
            extract(epoch from updated_at)*1000 AS updated_at,
            extract(epoch from expires_at)*1000 AS expires_at
     FROM trade_signals
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $1`,
    params
  );

  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    timeframe: r.timeframe,
    direction: r.direction,
    entry: { price: parseFloat(r.entry_price), timestamp: Number(r.entry_time) },
    exit: {
      tp1: parseFloat(r.tp1),
      tp2: parseFloat(r.tp2),
      tp3: parseFloat(r.tp3),
      stopLoss: parseFloat(r.stop_loss),
      trailingActive: false,
    },
    riskReward: {
      ratio: parseFloat(r.rr_ratio),
      riskPips: parseFloat(r.risk_pips),
      rewardPips: parseFloat(r.reward_pips),
    },
    confidence: r.confidence,
    strength: r.strength,
    status: r.status,
    conditions: r.conditions ?? [],
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
    expiresAt: Number(r.expires_at),
  }));
}

export async function updateSignalStatus(id: string, status: string): Promise<void> {
  const pool = getDbPool();
  await pool.query(`UPDATE trade_signals SET status=$2 WHERE id=$1`, [id, status]);
}
