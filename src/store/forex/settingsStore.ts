'use client';

import { create } from 'zustand';

interface UserSettings {
  minConfidence: number;       // minimum signal confidence to display (0-100)
  enableNotifications: boolean;
  defaultPair: string;
  defaultTimeframe: string;
  theme: 'dark' | 'light';
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    minConfidence: 60,
    enableNotifications: false,
    defaultPair: 'EUR/USD',
    defaultTimeframe: 'H1',
    theme: 'dark',
  },
  updateSettings: (updates) =>
    set((state) => ({ settings: { ...state.settings, ...updates } })),
}));
