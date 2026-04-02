'use client';

import AgentDashboardGrid from '@/components/agents/AgentDashboard';
import AgentReasoningStream from '@/components/agents/AgentReasoningStream';
import MarketSelector from '@/components/forex/dashboard/MarketSelector';
import { useChartStore } from '@/store/forex/chartStore';

export default function AgentsPage() {
  const activePair = useChartStore((s) => s.activePair);

  return (
    <div className="h-[calc(100vh-97px)] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">AI Agents</h1>
            <p className="text-sm text-gray-400 mt-1">
              Real-time reasoning from your trading analysis agents
            </p>
          </div>
          <MarketSelector />
        </div>

        {/* Agent Status Grid */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Agent Status</h2>
          <AgentDashboardGrid />
        </div>

        {/* Live Reasoning Stream */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Live Reasoning — {activePair}
          </h2>
          <AgentReasoningStream symbol={activePair} />
        </div>
      </div>
    </div>
  );
}
