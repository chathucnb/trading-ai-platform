'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAgentStore } from '@/store/agentStore';
import type { AgentReasoning } from '@/types/agents';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

const agentColors: Record<string, string> = {
  NewsAgent: 'text-purple-400 border-purple-500/30',
  ChartAgent: 'text-blue-400 border-blue-500/30',
  CrossVerifyAgent: 'text-green-400 border-green-500/30',
};

function ReasoningEntry({ entry }: { entry: AgentReasoning }) {
  const colors = agentColors[entry.agentName] ?? 'text-gray-400 border-gray-500/30';
  const [textColor, borderColor] = colors.split(' ');

  return (
    <div className={`p-3 rounded-lg border bg-gray-800/30 ${borderColor}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${textColor}`}>{entry.agentName}</span>
          <span className="text-xs text-gray-600">{entry.symbol}</span>
        </div>
        <span className="text-xs text-gray-600">{timeAgo(entry.timestamp)}</span>
      </div>
      <p className="text-sm text-gray-300">{entry.reasoning}</p>
      {entry.confidence != null && (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                entry.confidence >= 70 ? 'bg-green-500' : entry.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${entry.confidence}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{entry.confidence}%</span>
        </div>
      )}
    </div>
  );
}

export default function AgentReasoningStream({ symbol }: { symbol?: string }) {
  const storeReasoning = useAgentStore((s) => s.reasoning);

  const { data } = useQuery({
    queryKey: ['agent-reasoning', symbol],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (symbol) params.set('symbol', symbol);
      params.set('limit', '30');
      const res = await fetch(`/api/agents/reasoning?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.reasoning as AgentReasoning[];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  // Real-time entries from WebSocket take priority
  const entries = storeReasoning.length > 0 ? storeReasoning : (data ?? []);
  const filtered = symbol ? entries.filter((e) => e.symbol === symbol || e.symbol === '*') : entries;

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 text-sm">Agents are warming up... Reasoning will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((entry, i) => (
        <ReasoningEntry key={`${entry.agentName}-${entry.timestamp}-${i}`} entry={entry} />
      ))}
    </div>
  );
}
