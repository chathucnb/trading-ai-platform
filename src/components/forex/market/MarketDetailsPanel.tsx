'use client';

import { useQuery } from '@tanstack/react-query';
import type { MarketDetails } from '@/types/forex/pairs';
import SessionClock from './SessionClock';

async function fetchMarketDetails(symbol: string): Promise<MarketDetails> {
  const res = await fetch(`/api/forex/market-details/${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error('Failed to fetch market details');
  return res.json();
}

export default function MarketDetailsPanel({ symbol }: { symbol: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['market-details', symbol],
    queryFn: () => fetchMarketDetails(symbol),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  if (isLoading || !data) {
    return <div className="animate-pulse bg-gray-800/50 rounded-lg h-40" />;
  }

  const volColor = data.volatilityLabel === 'HIGH' ? 'text-red-400' : data.volatilityLabel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="space-y-3">
      <SessionClock />
      <div className="bg-gray-900 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">Spread</div>
          <div className="text-white font-mono">{data.spread.toFixed(1)} pips</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Pip Value (1 lot)</div>
          <div className="text-white font-mono">${data.pipValue.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">ATR (14)</div>
          <div className="text-white font-mono">{data.atr14Pips.toFixed(1)} pips</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Volatility</div>
          <div className={`font-semibold ${volColor}`}>{data.volatilityLabel}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Swap Long</div>
          <div className={`font-mono ${data.swapLong >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.swapLong > 0 ? '+' : ''}{data.swapLong.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Swap Short</div>
          <div className={`font-mono ${data.swapShort >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.swapShort > 0 ? '+' : ''}{data.swapShort.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
