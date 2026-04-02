'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSignalStore } from '@/store/forex/signalStore';
import type { TradeSignal } from '@/types/forex/signals';

async function fetchSignals(symbol?: string): Promise<TradeSignal[]> {
  const url = symbol
    ? `/api/forex/signals?symbol=${encodeURIComponent(symbol)}`
    : '/api/forex/signals';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch signals');
  return res.json();
}

export function useSignals(symbol?: string) {
  const setSignals = useSignalStore((s) => s.setSignals);
  const signals = useSignalStore((s) => s.signals);
  const activeSignals = useSignalStore((s) => s.activeSignals);

  const query = useQuery({
    queryKey: ['signals', symbol],
    queryFn: () => fetchSignals(symbol),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (query.data) setSignals(query.data);
  }, [query.data, setSignals]);

  return { signals, activeSignals, isLoading: query.isLoading };
}
