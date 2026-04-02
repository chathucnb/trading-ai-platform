'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAgentStore } from '@/store/agentStore';
import VerifiedSignalCard from '@/components/agents/VerifiedSignalCard';
import MarketSelector from '@/components/forex/dashboard/MarketSelector';
import { useChartStore } from '@/store/forex/chartStore';
import type { VerifiedSignal } from '@/types/agents';

export default function SignalsPage() {
  const activePair = useChartStore((s) => s.activePair);
  const storeSignals = useAgentStore((s) => s.verifiedSignals);
  const setVerifiedSignals = useAgentStore((s) => s.setVerifiedSignals);

  const { data, isLoading } = useQuery({
    queryKey: ['verified-signals'],
    queryFn: async () => {
      const res = await fetch('/api/agents/verified-signals?limit=50');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.signals as VerifiedSignal[];
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data) setVerifiedSignals(data);
  }, [data, setVerifiedSignals]);

  const allSignals = storeSignals.length > 0 ? storeSignals : (data ?? []);
  const activeSignals = allSignals.filter((s) => s.status === 'ACTIVE');
  const closedSignals = allSignals.filter((s) => s.status !== 'ACTIVE');

  return (
    <div className="h-[calc(100vh-97px)] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Verified Signals</h1>
            <p className="text-sm text-gray-400 mt-1">
              Cross-verified buy/sell signals from AI agents
            </p>
          </div>
          <MarketSelector />
        </div>

        {/* Active Signals */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Active Signals ({activeSignals.length})
          </h2>
          {isLoading && activeSignals.length === 0 ? (
            <div className="text-gray-500 text-sm py-4">Loading signals...</div>
          ) : activeSignals.length === 0 ? (
            <div className="text-gray-500 text-sm py-4 bg-gray-800/30 rounded-lg text-center p-6">
              No active verified signals. Agents are analyzing the markets...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeSignals.map((signal) => (
                <VerifiedSignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}
        </div>

        {/* Signal History */}
        {closedSignals.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Signal History ({closedSignals.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {closedSignals.map((signal) => (
                <VerifiedSignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
