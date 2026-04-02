'use client';

import ConfidenceGauge from './ConfidenceGauge';
import type { TradeSignal } from '@/types/forex/signals';
import { useLivePrice } from '@/hooks/forex/useLivePrice';
import { MAJOR_PAIRS } from '@/types/forex/pairs';
import { priceToPips, formatPrice } from '@/lib/forex/utils/pipCalculator';

interface Props {
  signal: TradeSignal;
}

export default function TradeSetupCard({ signal }: Props) {
  const price = useLivePrice(signal.symbol);
  const pair = MAJOR_PAIRS.find((p) => p.symbol === signal.symbol)!;
  const isLong = signal.direction === 'LONG';
  const currentPrice = price?.mid ?? signal.entry.price;

  const directionColor = isLong ? 'text-green-400' : 'text-red-400';
  const directionBg   = isLong ? 'bg-green-400/10 border-green-400/20' : 'bg-red-400/10 border-red-400/20';
  const age = Math.floor((Date.now() - signal.createdAt) / 60000);

  const fmt = (p: number) => formatPrice(p, pair);
  const fmtPips = (p: number) => Math.round(priceToPips(p, pair)) + ' pips';

  return (
    <div className={`rounded-xl border p-4 ${directionBg} bg-gray-900/60 backdrop-blur`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">{signal.symbol}</span>
          <span className="text-xs text-gray-400">{signal.timeframe}</span>
          <span className={`font-bold text-xs px-2 py-0.5 rounded ${isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {signal.direction}
          </span>
        </div>
        <ConfidenceGauge score={signal.confidence} size="sm" />
      </div>

      {/* Price levels */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="col-span-2 flex items-center justify-between bg-gray-800/60 rounded px-3 py-2">
          <span className="text-gray-400">Entry</span>
          <div className="text-right">
            <span className="text-white font-mono font-semibold">{fmt(signal.entry.price)}</span>
            {price && (
              <span className={`ml-2 text-xs ${isLong ? 'text-green-400' : 'text-red-400'}`}>
                now: {fmt(currentPrice)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between bg-green-900/20 rounded px-3 py-2">
          <span className="text-gray-400">TP1</span>
          <div className="text-right">
            <div className="text-green-400 font-mono">{fmt(signal.exit.tp1)}</div>
            <div className="text-green-600 text-xs">{fmtPips(Math.abs(signal.exit.tp1 - signal.entry.price))}</div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-red-900/20 rounded px-3 py-2">
          <span className="text-gray-400">SL</span>
          <div className="text-right">
            <div className="text-red-400 font-mono">{fmt(signal.exit.stopLoss)}</div>
            <div className="text-red-600 text-xs">{fmtPips(Math.abs(signal.exit.stopLoss - signal.entry.price))}</div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-green-900/20 rounded px-3 py-2">
          <span className="text-gray-400">TP2</span>
          <div className="text-right">
            <div className="text-green-400 font-mono">{fmt(signal.exit.tp2)}</div>
            <div className="text-green-600 text-xs">{fmtPips(Math.abs(signal.exit.tp2 - signal.entry.price))}</div>
          </div>
        </div>
        <div className="flex items-center justify-between bg-green-900/10 rounded px-3 py-2">
          <span className="text-gray-400">TP3</span>
          <div className="text-right">
            <div className="text-green-300 font-mono">{fmt(signal.exit.tp3)}</div>
            <div className="text-green-700 text-xs">{fmtPips(Math.abs(signal.exit.tp3 - signal.entry.price))}</div>
          </div>
        </div>
      </div>

      {/* R:R and conditions */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>R:R <span className="text-yellow-400 font-bold">1:{signal.riskReward.ratio}</span></span>
        <span>{age}m ago</span>
      </div>

      {/* Triggered conditions */}
      <div className="flex flex-wrap gap-1">
        {signal.conditions.map((c) => (
          <span key={c} className="text-xs bg-gray-800 text-gray-300 rounded px-2 py-0.5">{c}</span>
        ))}
      </div>
    </div>
  );
}
