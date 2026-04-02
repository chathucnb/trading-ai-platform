'use client';

import type { VerifiedSignal } from '@/types/agents';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function VerifiedSignalCard({ signal }: { signal: VerifiedSignal }) {
  const isLong = signal.direction === 'LONG';
  const dirColor = isLong ? 'text-green-400' : 'text-red-400';
  const dirBg = isLong ? 'bg-green-500/10' : 'bg-red-500/10';

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${dirBg} ${dirColor}`}>
            {signal.direction}
          </span>
          <span className="text-sm font-semibold text-white">{signal.symbol}</span>
          <span className="text-xs text-gray-500">Verified</span>
        </div>
        <span className="text-xs text-gray-500">{timeAgo(signal.verifiedAt)}</span>
      </div>

      {/* Confidence gauge */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">Confidence</span>
          <span className={`font-semibold ${
            signal.confidence >= 70 ? 'text-green-400' : signal.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {signal.confidence}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              signal.confidence >= 70 ? 'bg-green-500' : signal.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${signal.confidence}%` }}
          />
        </div>
      </div>

      {/* Price levels */}
      {signal.entry.price > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-gray-900/50 p-2 rounded">
            <span className="text-gray-500 block">Entry</span>
            <span className="text-white font-mono">{signal.entry.price.toFixed(5)}</span>
          </div>
          <div className="bg-gray-900/50 p-2 rounded">
            <span className="text-red-400 block">Stop Loss</span>
            <span className="text-white font-mono">{signal.exit.stopLoss.toFixed(5)}</span>
          </div>
          <div className="bg-gray-900/50 p-2 rounded">
            <span className="text-green-400 block">TP1</span>
            <span className="text-white font-mono">{signal.exit.tp1.toFixed(5)}</span>
          </div>
          <div className="bg-gray-900/50 p-2 rounded">
            <span className="text-green-400 block">TP2</span>
            <span className="text-white font-mono">{signal.exit.tp2.toFixed(5)}</span>
          </div>
        </div>
      )}

      {/* Reasoning */}
      <div className="space-y-2">
        <p className="text-xs text-gray-300">{signal.reasoning}</p>

        {signal.newsReasoning && (
          <div className="text-xs">
            <span className="text-purple-400 font-medium">News: </span>
            <span className="text-gray-400">{signal.newsReasoning}</span>
          </div>
        )}

        {signal.chartReasoning && (
          <div className="text-xs">
            <span className="text-blue-400 font-medium">Chart: </span>
            <span className="text-gray-400">{signal.chartReasoning}</span>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded ${
          signal.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
          signal.status === 'SL_HIT' ? 'bg-red-500/20 text-red-400' :
          signal.status === 'EXPIRED' ? 'bg-gray-500/20 text-gray-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {signal.status.replace('_', ' ')}
        </span>
        {signal.riskReward.ratio > 0 && (
          <span className="text-xs text-gray-500">R:R {signal.riskReward.ratio.toFixed(1)}</span>
        )}
      </div>
    </div>
  );
}
