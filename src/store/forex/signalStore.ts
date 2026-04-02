'use client';

import { create } from 'zustand';
import type { TradeSignal } from '@/types/forex/signals';

interface SignalState {
  signals: TradeSignal[];
  activeSignals: TradeSignal[];
  addSignal: (signal: TradeSignal) => void;
  updateSignal: (id: string, updates: Partial<TradeSignal>) => void;
  setSignals: (signals: TradeSignal[]) => void;
}

export const useSignalStore = create<SignalState>((set, get) => ({
  signals: [],
  activeSignals: [],

  addSignal: (signal) =>
    set((state) => {
      const updated = [signal, ...state.signals.filter((s) => s.id !== signal.id)].slice(0, 200);
      return {
        signals: updated,
        activeSignals: updated.filter((s) => s.status === 'ACTIVE'),
      };
    }),

  updateSignal: (id, updates) =>
    set((state) => {
      const updated = state.signals.map((s) => (s.id === id ? { ...s, ...updates } : s));
      return {
        signals: updated,
        activeSignals: updated.filter((s) => s.status === 'ACTIVE'),
      };
    }),

  setSignals: (signals) =>
    set({
      signals,
      activeSignals: signals.filter((s) => s.status === 'ACTIVE'),
    }),
}));
