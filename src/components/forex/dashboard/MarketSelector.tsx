'use client';

import { useState } from 'react';
import { useChartStore } from '@/store/forex/chartStore';
import { MAJOR_PAIRS } from '@/types/forex/pairs';
import { CRYPTO_PAIRS } from '@/types/market/crypto';
import type { MarketType } from '@/types/market';

export default function MarketSelector() {
  const activePair = useChartStore((s) => s.activePair);
  const setActivePair = useChartStore((s) => s.setActivePair);
  const [activeMarket, setActiveMarket] = useState<MarketType>(
    CRYPTO_PAIRS.some((p) => p.symbol === activePair) ? 'crypto' : 'forex'
  );

  const pairs = activeMarket === 'forex' ? MAJOR_PAIRS : CRYPTO_PAIRS;

  return (
    <div className="flex items-center gap-2">
      {/* Market type tabs */}
      <div className="flex bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <button
          onClick={() => {
            setActiveMarket('forex');
            setActivePair(MAJOR_PAIRS[0].symbol);
          }}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            activeMarket === 'forex'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Forex
        </button>
        <button
          onClick={() => {
            setActiveMarket('crypto');
            setActivePair(CRYPTO_PAIRS[0].symbol);
          }}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            activeMarket === 'crypto'
              ? 'bg-orange-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Crypto
        </button>
      </div>

      {/* Pair selector */}
      <select
        value={activePair}
        onChange={(e) => setActivePair(e.target.value)}
        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
      >
        {pairs.map((pair) => (
          <option key={pair.symbol} value={pair.symbol}>
            {pair.symbol} — {pair.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
