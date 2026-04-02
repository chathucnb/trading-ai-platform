'use client';

import { useChartStore } from '@/store/forex/chartStore';
import { MAJOR_PAIRS } from '@/types/forex/pairs';

export default function PairSelector() {
  const activePair = useChartStore((s) => s.activePair);
  const setActivePair = useChartStore((s) => s.setActivePair);

  return (
    <select
      value={activePair}
      onChange={(e) => setActivePair(e.target.value)}
      className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
    >
      {MAJOR_PAIRS.map((pair) => (
        <option key={pair.symbol} value={pair.symbol}>{pair.symbol}</option>
      ))}
    </select>
  );
}
