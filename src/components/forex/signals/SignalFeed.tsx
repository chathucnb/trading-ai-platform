'use client';

import TradeSetupCard from './TradeSetupCard';
import { useSignalStore } from '@/store/forex/signalStore';

export default function SignalFeed({ symbol }: { symbol?: string }) {
  const activeSignals = useSignalStore((s) => s.activeSignals);
  const filtered = symbol ? activeSignals.filter((s) => s.symbol === symbol) : activeSignals;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
        <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">No active signals</p>
        <p className="text-xs mt-1 opacity-60">Signals appear when conditions align</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      {filtered.map((signal) => (
        <TradeSetupCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}
