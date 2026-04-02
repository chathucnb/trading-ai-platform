import {
  EMA as TIema,
  MACD as TImacd,
  RSI as TIrsi,
  BollingerBands as TIBB,
  ATR as TIatr,
  Stochastic as TIstoch,
  ADX as TIadx,
} from 'technicalindicators';
import type { OHLCVCandle } from '@/types/forex/ohlcv';
import type {
  IndicatorSet,
  MACDResult,
  RSIResult,
  BollingerBandsResult,
  StochasticResult,
  ADXResult,
  PivotPointsResult,
} from '@/types/forex/indicators';

function closes(candles: OHLCVCandle[]): number[] { return candles.map((c) => c.close); }
function highs(candles: OHLCVCandle[]): number[]  { return candles.map((c) => c.high); }
function lows(candles: OHLCVCandle[]): number[]   { return candles.map((c) => c.low); }

export function calcEMA(candles: OHLCVCandle[], period: number): number | null {
  if (candles.length < period) return null;
  const result = TIema.calculate({ values: closes(candles), period });
  return result.at(-1) ?? null;
}

export function calcMACD(candles: OHLCVCandle[]): MACDResult | null {
  if (candles.length < 35) return null;
  const result = TImacd.calculate({
    values: closes(candles),
    fastPeriod: 12, slowPeriod: 26, signalPeriod: 9,
    SimpleMAOscillator: false, SimpleMASignal: false,
  });
  const last = result.at(-1);
  if (!last || last.MACD == null || last.signal == null || last.histogram == null) return null;
  return { macd: last.MACD, signal: last.signal, histogram: last.histogram };
}

export function calcRSI(candles: OHLCVCandle[], period = 14): RSIResult | null {
  if (candles.length < period + 1) return null;
  const result = TIrsi.calculate({ values: closes(candles), period });
  const last = result.at(-1);
  if (last == null) return null;
  return { value: last, overbought: last > 70, oversold: last < 30 };
}

export function calcBollingerBands(candles: OHLCVCandle[], period = 20, stdDev = 2): BollingerBandsResult | null {
  if (candles.length < period) return null;
  const result = TIBB.calculate({ values: closes(candles), period, stdDev });
  const last = result.at(-1);
  if (!last) return null;
  const close = candles.at(-1)!.close;
  const bandwidth = (last.upper - last.lower) / last.middle;
  const percentB = (close - last.lower) / (last.upper - last.lower);
  return { upper: last.upper, middle: last.middle, lower: last.lower, bandwidth, percentB };
}

export function calcATR(candles: OHLCVCandle[], period = 14): number | null {
  if (candles.length < period + 1) return null;
  const result = TIatr.calculate({
    high: highs(candles), low: lows(candles), close: closes(candles), period,
  });
  return result.at(-1) ?? null;
}

export function calcStochastic(candles: OHLCVCandle[], period = 14, signalPeriod = 3): StochasticResult | null {
  if (candles.length < period) return null;
  const result = TIstoch.calculate({
    high: highs(candles), low: lows(candles), close: closes(candles),
    period, signalPeriod,
  });
  const last = result.at(-1);
  if (!last) return null;
  return { k: last.k, d: last.d };
}

export function calcADX(candles: OHLCVCandle[], period = 14): ADXResult | null {
  if (candles.length < period * 2) return null;
  const result = TIadx.calculate({
    high: highs(candles), low: lows(candles), close: closes(candles), period,
  });
  const last = result.at(-1);
  if (!last) return null;
  return { adx: last.adx, plusDI: last.pdi, minusDI: last.mdi, trending: last.adx > 20 };
}

export function calcPivotPoints(candles: OHLCVCandle[]): PivotPointsResult | null {
  // Use the previous day's high/low/close (or last daily candle equivalent)
  const prev = candles.at(-2);
  if (!prev) return null;
  const { high, low, close } = prev;
  const pivot = (high + low + close) / 3;
  return {
    pivot,
    r1: 2 * pivot - low,
    r2: pivot + (high - low),
    r3: high + 2 * (pivot - low),
    s1: 2 * pivot - high,
    s2: pivot - (high - low),
    s3: low - 2 * (high - pivot),
  };
}

/** Compute the full indicator set for a candle array */
export function computeIndicators(candles: OHLCVCandle[]): IndicatorSet {
  return {
    ema9:   calcEMA(candles, 9),
    ema21:  calcEMA(candles, 21),
    ema50:  calcEMA(candles, 50),
    ema200: calcEMA(candles, 200),
    macd:   calcMACD(candles),
    rsi:    calcRSI(candles),
    bb:     calcBollingerBands(candles),
    atr14:  calcATR(candles),
    stochastic: calcStochastic(candles),
    adx:    calcADX(candles),
    pivots: calcPivotPoints(candles),
  };
}
