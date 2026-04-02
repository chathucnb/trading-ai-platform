'use client';

import { useChartStore } from '@/store/forex/chartStore';
import type { Timeframe } from '@/types/forex/ohlcv';
import { TIMEFRAME_LABELS } from '@/types/forex/ohlcv';

const TIMEFRAMES: Timeframe[] = ['M1','M5','M15','M30','H1','H4','D1','W1'];

export default function TimeframeSelector() {
  const activeTimeframe = useChartStore((s) => s.activeTimeframe);
  const setActiveTimeframe = useChartStore((s) => s.setActiveTimeframe);

  return (
    <div className="flex items-center gap-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => setActiveTimeframe(tf)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            activeTimeframe === tf
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {TIMEFRAME_LABELS[tf]}
        </button>
      ))}
    </div>
  );
}
