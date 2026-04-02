'use client';

import { useMemo } from 'react';
import type { OHLCVCandle } from '@/types/forex/ohlcv';
import type { IndicatorSet, TechnicalSummaryRow } from '@/types/forex/indicators';
import { computeIndicators } from '@/lib/forex/indicators';

export function useIndicators(candles: OHLCVCandle[]): IndicatorSet {
  return useMemo(() => {
    if (candles.length < 50) {
      return {
        ema9: null, ema21: null, ema50: null, ema200: null,
        macd: null, rsi: null, bb: null, atr14: null,
        stochastic: null, adx: null, pivots: null,
      };
    }
    return computeIndicators(candles);
  }, [candles]);
}

export function useTechnicalSummary(
  candles: OHLCVCandle[],
  indicators: IndicatorSet
): TechnicalSummaryRow[] {
  return useMemo(() => {
    const price = candles.at(-1)?.close ?? 0;
    const rows: TechnicalSummaryRow[] = [];

    if (indicators.ema9 != null) rows.push({
      name: 'EMA 9', value: indicators.ema9.toFixed(5),
      signal: price > indicators.ema9 ? 'BUY' : 'SELL',
    });
    if (indicators.ema21 != null) rows.push({
      name: 'EMA 21', value: indicators.ema21.toFixed(5),
      signal: price > indicators.ema21 ? 'BUY' : 'SELL',
    });
    if (indicators.ema50 != null) rows.push({
      name: 'EMA 50', value: indicators.ema50.toFixed(5),
      signal: price > indicators.ema50 ? 'BUY' : 'SELL',
    });
    if (indicators.ema200 != null) rows.push({
      name: 'EMA 200', value: indicators.ema200.toFixed(5),
      signal: price > indicators.ema200 ? 'BUY' : 'SELL',
    });
    if (indicators.macd != null) rows.push({
      name: 'MACD', value: indicators.macd.histogram.toFixed(5),
      signal: indicators.macd.histogram > 0 ? 'BUY' : indicators.macd.histogram < 0 ? 'SELL' : 'NEUTRAL',
    });
    if (indicators.rsi != null) rows.push({
      name: 'RSI (14)', value: indicators.rsi.value.toFixed(1),
      signal: indicators.rsi.oversold ? 'BUY' : indicators.rsi.overbought ? 'SELL' : 'NEUTRAL',
    });
    if (indicators.bb != null) rows.push({
      name: 'Bollinger %B', value: (indicators.bb.percentB * 100).toFixed(1) + '%',
      signal: indicators.bb.percentB < 0.2 ? 'BUY' : indicators.bb.percentB > 0.8 ? 'SELL' : 'NEUTRAL',
    });
    if (indicators.stochastic != null) rows.push({
      name: 'Stochastic K', value: indicators.stochastic.k.toFixed(1),
      signal: indicators.stochastic.k < 20 ? 'BUY' : indicators.stochastic.k > 80 ? 'SELL' : 'NEUTRAL',
    });
    if (indicators.adx != null) rows.push({
      name: 'ADX', value: indicators.adx.adx.toFixed(1),
      signal: indicators.adx.plusDI > indicators.adx.minusDI ? 'BUY' : 'SELL',
    });

    return rows;
  }, [candles, indicators]);
}
