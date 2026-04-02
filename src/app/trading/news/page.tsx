'use client';

import { useState } from 'react';
import NewsFeed from '@/components/news/NewsFeed';
import MarketSelector from '@/components/forex/dashboard/MarketSelector';
import { useChartStore } from '@/store/forex/chartStore';

export default function NewsPage() {
  const activePair = useChartStore((s) => s.activePair);
  const [filterBySymbol, setFilterBySymbol] = useState(false);

  return (
    <div className="h-[calc(100vh-97px)] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Market News</h1>
            <p className="text-sm text-gray-400 mt-1">
              AI-analyzed market news with sentiment and impact scoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MarketSelector />
            <button
              onClick={() => setFilterBySymbol(!filterBySymbol)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterBySymbol
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {filterBySymbol ? `Showing ${activePair}` : 'All Markets'}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Bullish
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Bearish
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Neutral
          </div>
          <span className="text-gray-600">|</span>
          <span>Impact: 1-3 Minor, 4-6 Moderate, 7-10 Major</span>
        </div>

        {/* News Feed */}
        <NewsFeed symbol={filterBySymbol ? activePair : undefined} limit={100} />
      </div>
    </div>
  );
}
