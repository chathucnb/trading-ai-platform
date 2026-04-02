'use client';

import { usePriceStore } from '@/store/forex/priceStore';
import { MAJOR_PAIRS } from '@/types/forex/pairs';

export default function PriceTickerBar() {
  const prices = usePriceStore((s) => s.prices);

  return (
    <div className="w-full bg-gray-900 border-b border-gray-800 overflow-hidden">
      <div className="flex animate-scroll-x gap-8 px-4 py-2 whitespace-nowrap">
        {[...MAJOR_PAIRS, ...MAJOR_PAIRS].map((pair, i) => {
          const price = prices[pair.symbol];
          const isUp = (price?.change ?? 0) >= 0;
          return (
            <div key={`${pair.symbol}-${i}`} className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-gray-300">{pair.symbol}</span>
              <span className="text-xs font-mono text-white">
                {price ? price.mid.toFixed(pair.pipSize < 0.001 ? 5 : 3) : '—'}
              </span>
              {price && (
                <span className={`text-xs font-mono ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(price.changePercent).toFixed(2)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
