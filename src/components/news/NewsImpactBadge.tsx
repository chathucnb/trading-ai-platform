'use client';

import type { NewsSentiment } from '@/types/agents';

const sentimentStyles: Record<NewsSentiment, { bg: string; text: string; label: string }> = {
  BULLISH: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Bullish' },
  BEARISH: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Bearish' },
  NEUTRAL: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Neutral' },
};

function impactColor(score: number): string {
  if (score >= 8) return 'text-red-400';
  if (score >= 5) return 'text-yellow-400';
  return 'text-gray-400';
}

export default function NewsImpactBadge({
  sentiment,
  impactScore,
}: {
  sentiment: NewsSentiment;
  impactScore: number;
}) {
  const style = sentimentStyles[sentiment];

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
      <span className={`text-xs font-mono ${impactColor(impactScore)}`}>
        Impact: {impactScore}/10
      </span>
    </div>
  );
}
