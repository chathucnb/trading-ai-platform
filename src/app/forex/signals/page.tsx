'use client';

import { useSignalStore } from '@/store/forex/signalStore';
import TradeSetupCard from '@/components/forex/signals/TradeSetupCard';
import { useSignals } from '@/hooks/forex/useSignals';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   'bg-blue-500/20 text-blue-400',
  TP1_HIT:  'bg-green-500/20 text-green-400',
  TP2_HIT:  'bg-green-600/20 text-green-300',
  TP3_HIT:  'bg-green-700/20 text-green-200',
  SL_HIT:   'bg-red-500/20 text-red-400',
  EXPIRED:  'bg-gray-700/30 text-gray-500',
};

export default function SignalsPage() {
  const { signals, isLoading } = useSignals();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Signal History</h1>
          <p className="text-sm text-gray-400 mt-1">All generated trade signals with full details</p>
        </div>
        <div className="text-sm text-gray-400">{signals.length} signals total</div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800/50 rounded-xl h-40" />
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No signals yet</p>
          <p className="text-sm">Signals are generated automatically as market conditions align</p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => (
            <div key={signal.id} className="relative">
              <span className={`absolute top-4 right-4 text-xs px-2 py-0.5 rounded z-10 ${STATUS_COLORS[signal.status] ?? ''}`}>
                {signal.status.replace('_', ' ')}
              </span>
              <TradeSetupCard signal={signal} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
