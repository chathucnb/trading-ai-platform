'use client';

import type { TechnicalSummaryRow, IndicatorSignal } from '@/types/forex/indicators';

const signalColor: Record<IndicatorSignal, string> = {
  BUY:     'text-green-400',
  SELL:    'text-red-400',
  NEUTRAL: 'text-gray-400',
};

const signalBg: Record<IndicatorSignal, string> = {
  BUY:     'bg-green-400/10',
  SELL:    'bg-red-400/10',
  NEUTRAL: 'bg-gray-700/30',
};

interface Props { rows: TechnicalSummaryRow[] }

export default function TechnicalSummary({ rows }: Props) {
  if (rows.length === 0) return <div className="text-xs text-gray-500 p-3">Not enough data</div>;

  const buys  = rows.filter((r) => r.signal === 'BUY').length;
  const sells = rows.filter((r) => r.signal === 'SELL').length;
  const overallSignal: IndicatorSignal = buys > sells ? 'BUY' : sells > buys ? 'SELL' : 'NEUTRAL';

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className={`flex items-center justify-between rounded-lg p-2 ${signalBg[overallSignal]}`}>
        <span className="text-xs text-gray-400">Summary</span>
        <span className={`text-sm font-bold ${signalColor[overallSignal]}`}>{overallSignal}</span>
        <span className="text-xs text-gray-500">{buys}↑ {sells}↓</span>
      </div>
      {/* Indicator rows */}
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between text-xs px-2 py-1 bg-gray-900 rounded">
            <span className="text-gray-400">{row.name}</span>
            <span className="text-gray-300 font-mono">{row.value}</span>
            <span className={`font-semibold w-14 text-right ${signalColor[row.signal]}`}>{row.signal}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
