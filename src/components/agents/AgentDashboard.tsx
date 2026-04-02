'use client';

import { useQuery } from '@tanstack/react-query';
import { useAgentStore } from '@/store/agentStore';
import type { AgentStatus, AgentInfo } from '@/types/agents';

const statusStyles: Record<AgentStatus, { dot: string; label: string }> = {
  idle: { dot: 'bg-gray-400', label: 'Idle' },
  processing: { dot: 'bg-green-400 animate-pulse', label: 'Processing' },
  error: { dot: 'bg-red-400', label: 'Error' },
};

const agentDescriptions: Record<string, string> = {
  NewsAgent: 'Monitors forex & crypto news, analyzes market impact with AI',
  ChartAgent: 'Analyzes chart patterns and technical indicators for trade setups',
  CrossVerifyAgent: 'Cross-references news & chart signals to produce verified trades',
};

function AgentCard({ name, status }: { name: string; status: AgentStatus }) {
  const style = statusStyles[status];

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{name}</h3>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-xs text-gray-400">{style.label}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">{agentDescriptions[name] ?? 'AI trading agent'}</p>
    </div>
  );
}

export default function AgentDashboardGrid() {
  const storeStatuses = useAgentStore((s) => s.agentStatuses);

  const { data } = useQuery({
    queryKey: ['agent-status'],
    queryFn: async () => {
      const res = await fetch('/api/agents/status');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.agents as Record<string, AgentInfo>;
    },
    staleTime: 10_000,
    refetchInterval: 10_000,
  });

  // Merge API data with real-time WebSocket updates
  const agents = ['NewsAgent', 'ChartAgent', 'CrossVerifyAgent'];
  const getStatus = (name: string): AgentStatus => {
    if (storeStatuses[name]) return storeStatuses[name];
    if (data?.[name]) return data[name].status;
    return 'idle';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {agents.map((name) => (
        <AgentCard key={name} name={name} status={getStatus(name)} />
      ))}
    </div>
  );
}
