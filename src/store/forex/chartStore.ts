'use client';

import { create } from 'zustand';
import type { Timeframe } from '@/types/forex/ohlcv';

interface ChartSettings {
  showEma9: boolean;
  showEma21: boolean;
  showEma50: boolean;
  showEma200: boolean;
  showBollingerBands: boolean;
  showVolume: boolean;
  showSignalMarkers: boolean;
}

interface ChartState {
  activePair: string;
  activeTimeframe: Timeframe;
  settings: ChartSettings;
  setActivePair: (pair: string) => void;
  setActiveTimeframe: (tf: Timeframe) => void;
  toggleSetting: (key: keyof ChartSettings) => void;
}

export const useChartStore = create<ChartState>((set) => ({
  activePair: 'EUR/USD',
  activeTimeframe: 'H1',
  settings: {
    showEma9: true,
    showEma21: true,
    showEma50: true,
    showEma200: true,
    showBollingerBands: true,
    showVolume: true,
    showSignalMarkers: true,
  },
  setActivePair: (pair) => set({ activePair: pair }),
  setActiveTimeframe: (tf) => set({ activeTimeframe: tf }),
  toggleSetting: (key) =>
    set((state) => ({
      settings: { ...state.settings, [key]: !state.settings[key] },
    })),
}));
