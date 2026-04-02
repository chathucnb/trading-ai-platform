'use client';

import { create } from 'zustand';
import type { LivePrice } from '@/types/forex/pairs';

interface PriceState {
  prices: Record<string, LivePrice>;
  setPrice: (price: LivePrice) => void;
  setPrices: (prices: LivePrice[]) => void;
}

export const usePriceStore = create<PriceState>((set) => ({
  prices: {},
  setPrice: (price) =>
    set((state) => ({ prices: { ...state.prices, [price.symbol]: price } })),
  setPrices: (prices) =>
    set({ prices: Object.fromEntries(prices.map((p) => [p.symbol, p])) }),
}));
