import { randomUUID } from 'crypto';
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';
import type { TradeSignal } from '@/types/forex/signals';
import type { ForexPair } from '@/types/forex/pairs';
import { computeIndicators } from '../indicators';
import { evaluateEntry } from './entryConditions';
import { calculateExitLevels } from './exitConditions';
import { computeConfidenceScore } from './confidenceScoring';
import { TIMEFRAME_MINUTES } from '@/types/forex/ohlcv';

const MIN_CANDLES = 50; // minimum candles needed for reliable signals
const MIN_CONFIDENCE = 40;

export function runSignalEngine(
  candles: OHLCVCandle[],
  pair: ForexPair,
  timeframe: Timeframe
): TradeSignal[] {
  if (candles.length < MIN_CANDLES) return [];

  const indicators = computeIndicators(candles);
  const prevIndicators = computeIndicators(candles.slice(0, -1));

  const entries = evaluateEntry(candles, indicators, prevIndicators);
  const signals: TradeSignal[] = [];

  for (const entry of entries) {
    const lastCandle = candles.at(-1)!;
    const entryPrice = lastCandle.close;
    const now = Date.now();
    const tfMinutes = TIMEFRAME_MINUTES[timeframe];

    const exitData = calculateExitLevels(entryPrice, entry.direction, indicators, pair);
    if (!exitData) continue;

    // Skip signals with poor R:R (must be at least 1.5)
    if (exitData.riskReward.ratio < 1.5) continue;

    const { score, strength } = computeConfidenceScore(
      entry.conditionsMet.length,
      entry.conditionsTotal,
      entry.direction,
      indicators,
      candles
    );

    if (score < MIN_CONFIDENCE) continue;

    const signal: TradeSignal = {
      id: randomUUID(),
      symbol: pair.symbol,
      timeframe,
      direction: entry.direction,
      entry: { price: entryPrice, timestamp: lastCandle.time * 1000 },
      exit: exitData.exit,
      riskReward: exitData.riskReward,
      confidence: score,
      strength,
      status: 'ACTIVE',
      conditions: entry.conditionsMet,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + tfMinutes * 3 * 60 * 1000, // expires after 3 candles
    };

    signals.push(signal);
  }

  return signals;
}
