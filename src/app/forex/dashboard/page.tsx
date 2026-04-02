import ChartSection from '@/components/forex/dashboard/ChartSection';
import WatchlistPanel from '@/components/forex/watchlist/WatchlistPanel';
import SignalFeed from '@/components/forex/signals/SignalFeed';
import MarketDetailsPanel from '@/components/forex/market/MarketDetailsPanel';
import TechnicalSummary from '@/components/forex/market/TechnicalSummary';
import ActivePairDetails from '@/components/forex/dashboard/ActivePairDetails';

export default function DashboardPage() {
  return (
    <div className="flex h-[calc(100vh-97px)] overflow-hidden">
      {/* Left sidebar: watchlist */}
      <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-900/50 overflow-y-auto p-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">Watchlist</h2>
        <WatchlistPanel />
      </aside>

      {/* Main: chart */}
      <main className="flex-1 overflow-y-auto p-4 min-w-0">
        <ChartSection />
        <div className="mt-4">
          <ActivePairDetails />
        </div>
      </main>

      {/* Right sidebar: signals + market details */}
      <aside className="w-80 shrink-0 border-l border-gray-800 bg-gray-900/50 overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-gray-800">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Signals</h2>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          <SignalFeed />
        </div>
        <div className="border-t border-gray-800 p-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Market Details</h2>
          <ActiveMarketDetails />
        </div>
      </aside>
    </div>
  );
}

// Server component wrappers that read from client store via client component
function ActiveMarketDetails() {
  return <MarketDetailsPanel symbol="EUR/USD" />;
}
