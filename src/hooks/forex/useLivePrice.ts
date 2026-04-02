'use client';

import { usePriceStore } from '@/store/forex/priceStore';
import type { LivePrice } from '@/types/forex/pairs';

export function useLivePrice(symbol: string): LivePrice | null {
  return usePriceStore((state) => state.prices[symbol] ?? null);
}

export function useAllPrices(): Record<string, LivePrice> {
  return usePriceStore((state) => state.prices);
}
