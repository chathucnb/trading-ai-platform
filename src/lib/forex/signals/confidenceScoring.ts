import type { IndicatorSet } from '@/types/forex/indicators';
import type { SignalDirection, SignalStrength } from '@/types/forex/signals';
import type { OHLCVCandle } from '@/types/forex/ohlcv';

/** Returns the current forex trading session(s) based on UTC hour */
function getActiveSessions(utcHour: number): string[] {
  const sessions: string[] = [];
  if (utcHour >= 22 || utcHour < 7) sessions.push('sydney');
  if (utcHour >= 0 && utcHour < 9) sessions.push('tokyo');
  if (utcHour >= 7 && utcHour < 16) sessions.push('london');
  if (utcHour >= 13 && utcHour < 22) sessions.push('newYork');
  return sessions;
}

function isLondonNyOverlap(utcHour: number): boolean {
  return utcHour >= 13 && utcHour < 16;
}

export function computeConfidenceScore(
  conditionCount: number,
  totalConditions: number,
  direction: SignalDirection,
  indicators: IndicatorSet,
  candles: OHLCVCandle[]
): { score: number; strength: SignalStrength } {
  let score = 0;

  // Base score: up to 75 points
  const conditionRatio = Math.min(conditionCount / totalConditions, 1);
  score += Math.round(conditionRatio * 75);

  // Volume confirmation (+10): last candle volume > 1.5x 20-bar average
  if (candles.length >= 20) {
    const last = candles.at(-1)!;
    const avg20Vol = candles.slice(-21, -1).reduce((s, c) => s + c.volume, 0) / 20;
    if (avg20Vol > 0 && last.volume > avg20Vol * 1.5) score += 10;
  }

  // Session bonus (+5): London/NY overlap
  const utcHour = new Date().getUTCHours();
  if (isLondonNyOverlap(utcHour)) score += 5;

  // Higher timeframe alignment bonus (+10): EMA200 aligns with direction
  if (indicators.ema200 != null) {
    const price = candles.at(-1)!.close;
    if (direction === 'LONG' && price > indicators.ema200) score += 10;
    if (direction === 'SHORT' && price < indicators.ema200) score += 10;
  }

  score = Math.min(score, 100);

  const strength: SignalStrength = score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW';
  return { score, strength };
}
