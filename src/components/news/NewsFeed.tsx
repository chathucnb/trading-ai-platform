'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNewsStore } from '@/store/newsStore';
import NewsImpactBadge from './NewsImpactBadge';
import type { NewsEvent } from '@/types/agents';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NewsCard({ event }: { event: NewsEvent }) {
  return (
    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-medium text-white leading-tight line-clamp-2">
          {event.headline}
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <NewsImpactBadge sentiment={event.sentiment} impactScore={event.impactScore} />
        <span className="text-xs text-gray-500">{event.source}</span>
        <span className="text-xs text-gray-600">{timeAgo(event.publishedAt)}</span>
      </div>

      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{event.reasoning}</p>

      <div className="flex items-center gap-1.5 flex-wrap">
        {event.symbols.map((sym) => (
          <span key={sym} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">
            {sym}
          </span>
        ))}
        <span className="text-xs text-gray-600 ml-auto">{event.expectedDuration}</span>
      </div>
    </div>
  );
}

export default function NewsFeed({ symbol, limit = 50 }: { symbol?: string; limit?: number }) {
  const storeEvents = useNewsStore((s) => s.events);
  const setEvents = useNewsStore((s) => s.setEvents);

  const { data, isLoading } = useQuery({
    queryKey: ['news-events', symbol, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (symbol) params.set('symbol', symbol);
      params.set('limit', String(limit));
      const res = await fetch(`/api/news/events?${params}`);
      if (!res.ok) throw new Error('Failed to fetch news');
      const json = await res.json();
      return json.events as NewsEvent[];
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Merge API data with real-time WebSocket events
  useEffect(() => {
    if (data) setEvents(data);
  }, [data, setEvents]);

  // Combine stored events (includes WebSocket updates) with API data
  const allEvents = storeEvents.length > 0 ? storeEvents : (data ?? []);

  if (isLoading && allEvents.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-gray-500 text-sm">Loading news...</div>
      </div>
    );
  }

  if (allEvents.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 text-sm">No news events yet. The News Agent will start analyzing shortly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allEvents.map((event) => (
        <NewsCard key={event.id} event={event} />
      ))}
    </div>
  );
}
