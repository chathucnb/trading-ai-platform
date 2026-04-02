'use client';

import { MAJOR_PAIRS } from '@/types/forex/pairs';
import { usePriceStore } from '@/store/forex/priceStore';
import { useChartStore } from '@/store/forex/chartStore';

export default function WatchlistPanel() {
  const prices = usePriceStore((s) => s.prices);
  const activePair = useChartStore((s) => s.activePair);
  const setActivePair = useChartStore((s) => s.setActivePair);

  return (
    <div className="flex flex-col gap-0.5">
      {MAJOR_PAIRS.map((pair) => {
        const price = prices[pair.symbol];
        const isActive = activePair === pair.symbol;
        const isUp = (price?.change ?? 0) >= 0;

        return (
          <button
            key={pair.symbol}
            onClick={() => setActivePair(pair.symbol)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
              isActive
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'hover:bg-gray-800/60'
            }`}
          >
            <div>
              <div className="text-sm font-semibold text-white">{pair.symbol}</div>
              <div className="text-xs text-gray-500">{pair.displayName}</div>
            </div>
            {price ? (
              <div className="text-right">
                <div className="text-sm font-mono text-white">
                  {price.mid.toFixed(pair.pipSize < 0.001 ? 5 : 3)}
                </div>
                <div className={`text-xs font-mono ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? '+' : ''}{price.changePercent.toFixed(2)}%
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-600 animate-pulse">Loading...</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
