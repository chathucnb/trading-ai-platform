import type { IndicatorSet } from '@/types/forex/indicators';
import type { SignalDirection } from '@/types/forex/signals';
import type { ExitPoint, RiskReward } from '@/types/forex/signals';
import type { ForexPair } from '@/types/forex/pairs';

export function calculateExitLevels(
  entryPrice: number,
  direction: SignalDirection,
  indicators: IndicatorSet,
  pair: ForexPair
): { exit: ExitPoint; riskReward: RiskReward } | null {
  const atr = indicators.atr14;
  if (!atr || atr === 0) return null;

  const pipSize = pair.pipSize;

  let tp1: number, tp2: number, tp3: number, stopLoss: number;

  if (direction === 'LONG') {
    tp1 = entryPrice + atr * 1.5;
    tp2 = entryPrice + atr * 2.5;
    tp3 = indicators.pivots?.r2 ?? entryPrice + atr * 4;
    stopLoss = entryPrice - atr;
  } else {
    tp1 = entryPrice - atr * 1.5;
    tp2 = entryPrice - atr * 2.5;
    tp3 = indicators.pivots?.s2 ?? entryPrice - atr * 4;
    stopLoss = entryPrice + atr;
  }

  const riskPips = Math.abs(entryPrice - stopLoss) / pipSize;
  const rewardPips = Math.abs(tp2 - entryPrice) / pipSize;
  const ratio = rewardPips / riskPips;

  return {
    exit: { tp1, tp2, tp3, stopLoss, trailingActive: false },
    riskReward: {
      ratio: Math.round(ratio * 100) / 100,
      riskPips: Math.round(riskPips * 10) / 10,
      rewardPips: Math.round(rewardPips * 10) / 10,
    },
  };
}

/** Check if an active signal's TP or SL has been hit */
export function checkSignalUpdate(
  currentPrice: number,
  direction: SignalDirection,
  exit: ExitPoint
): 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | null {
  if (direction === 'LONG') {
    if (currentPrice >= exit.tp3) return 'TP3_HIT';
    if (currentPrice >= exit.tp2) return 'TP2_HIT';
    if (currentPrice >= exit.tp1) return 'TP1_HIT';
    if (currentPrice <= exit.stopLoss) return 'SL_HIT';
  } else {
    if (currentPrice <= exit.tp3) return 'TP3_HIT';
    if (currentPrice <= exit.tp2) return 'TP2_HIT';
    if (currentPrice <= exit.tp1) return 'TP1_HIT';
    if (currentPrice >= exit.stopLoss) return 'SL_HIT';
  }
  return null;
}
