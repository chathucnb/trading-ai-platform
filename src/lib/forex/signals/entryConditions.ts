import type { OHLCVCandle } from '@/types/forex/ohlcv';
import type { IndicatorSet } from '@/types/forex/indicators';
import type { SignalDirection } from '@/types/forex/signals';

export interface EntryEvaluation {
  direction: SignalDirection;
  conditionsMet: string[];
  conditionsTotal: number;
  passes: boolean; // true if >= 3 conditions met
}

/** Evaluate a previous and current MACD to detect crossover */
function macdCrossedUp(current: IndicatorSet, prev: IndicatorSet): boolean {
  if (!current.macd || !prev.macd) return false;
  return prev.macd.macd < prev.macd.signal && current.macd.macd >= current.macd.signal;
}
function macdCrossedDown(current: IndicatorSet, prev: IndicatorSet): boolean {
  if (!current.macd || !prev.macd) return false;
  return prev.macd.macd > prev.macd.signal && current.macd.macd <= current.macd.signal;
}

export function evaluateEntry(
  candles: OHLCVCandle[],
  indicators: IndicatorSet,
  prevIndicators: IndicatorSet
): EntryEvaluation[] {
  const results: EntryEvaluation[] = [];
  const lastCandle = candles.at(-1)!;
  const price = lastCandle.close;

  // ── BULLISH ENTRY ─────────────────────────────────────────────────────────
  {
    const conditions: string[] = [];

    if (indicators.ema50 != null && price > indicators.ema50) {
      conditions.push('Price > EMA50 (uptrend)');
    }
    if (macdCrossedUp(indicators, prevIndicators)) {
      conditions.push('MACD bullish crossover');
    }
    if (indicators.rsi != null && indicators.rsi.value >= 40 && indicators.rsi.value <= 65) {
      conditions.push('RSI in bullish zone (40-65)');
    }
    if (
      (indicators.ema21 != null && price <= indicators.ema21 * 1.001) ||
      (indicators.bb != null && price <= indicators.bb.lower * 1.002)
    ) {
      conditions.push('Price at EMA21 or lower BB support');
    }
    if (indicators.adx != null && indicators.adx.adx > 20 && indicators.adx.plusDI > indicators.adx.minusDI) {
      conditions.push('ADX trending bullish (>20)');
    }

    results.push({
      direction: 'LONG',
      conditionsMet: conditions,
      conditionsTotal: 5,
      passes: conditions.length >= 3,
    });
  }

  // ── BEARISH ENTRY ─────────────────────────────────────────────────────────
  {
    const conditions: string[] = [];

    if (indicators.ema50 != null && price < indicators.ema50) {
      conditions.push('Price < EMA50 (downtrend)');
    }
    if (macdCrossedDown(indicators, prevIndicators)) {
      conditions.push('MACD bearish crossover');
    }
    if (indicators.rsi != null && indicators.rsi.value >= 35 && indicators.rsi.value <= 60) {
      conditions.push('RSI in bearish zone (35-60)');
    }
    if (
      (indicators.ema21 != null && price >= indicators.ema21 * 0.999) ||
      (indicators.bb != null && price >= indicators.bb.upper * 0.998)
    ) {
      conditions.push('Price at EMA21 or upper BB resistance');
    }
    if (indicators.adx != null && indicators.adx.adx > 20 && indicators.adx.minusDI > indicators.adx.plusDI) {
      conditions.push('ADX trending bearish (>20)');
    }

    results.push({
      direction: 'SHORT',
      conditionsMet: conditions,
      conditionsTotal: 5,
      passes: conditions.length >= 3,
    });
  }

  return results.filter((r) => r.passes);
}
