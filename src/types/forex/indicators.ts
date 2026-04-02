export interface EMAResult {
  value: number;
  period: number;
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
}

export interface RSIResult {
  value: number;
  overbought: boolean; // > 70
  oversold: boolean;   // < 30
}

export interface BollingerBandsResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number;
}

export interface StochasticResult {
  k: number;
  d: number;
}

export interface ADXResult {
  adx: number;
  plusDI: number;
  minusDI: number;
  trending: boolean; // adx > 20
}

export interface PivotPointsResult {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

export interface IndicatorSet {
  ema9: number | null;
  ema21: number | null;
  ema50: number | null;
  ema200: number | null;
  macd: MACDResult | null;
  rsi: RSIResult | null;
  bb: BollingerBandsResult | null;
  atr14: number | null;
  stochastic: StochasticResult | null;
  adx: ADXResult | null;
  pivots: PivotPointsResult | null;
}

export type IndicatorSignal = 'BUY' | 'SELL' | 'NEUTRAL';

export interface TechnicalSummaryRow {
  name: string;
  value: string;
  signal: IndicatorSignal;
}
