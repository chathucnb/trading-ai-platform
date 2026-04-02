import { getDbPool } from '../client';
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';

export async function insertCandle(symbol: string, tf: Timeframe, candle: OHLCVCandle): Promise<void> {
  const pool = getDbPool();
  await pool.query(
    `INSERT INTO ohlcv (time, symbol, timeframe, open, high, low, close, volume)
     VALUES (to_timestamp($1), $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (time, symbol, timeframe) DO UPDATE
     SET open=$4, high=$5, low=$6, close=$7, volume=$8`,
    [candle.time, symbol, tf, candle.open, candle.high, candle.low, candle.close, candle.volume]
  );
}

export async function getCandles(
  symbol: string,
  tf: Timeframe,
  limit = 500
): Promise<OHLCVCandle[]> {
  const pool = getDbPool();
  const { rows } = await pool.query(
    `SELECT extract(epoch from time)::bigint AS time, open, high, low, close, volume
     FROM ohlcv
     WHERE symbol = $1 AND timeframe = $2
     ORDER BY time DESC
     LIMIT $3`,
    [symbol, tf, limit]
  );
  return rows.reverse().map((r) => ({
    time: Number(r.time),
    open: parseFloat(r.open),
    high: parseFloat(r.high),
    low: parseFloat(r.low),
    close: parseFloat(r.close),
    volume: parseFloat(r.volume),
  }));
}
