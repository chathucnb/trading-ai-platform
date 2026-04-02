'use client';

import { create } from 'zustand';
import type { NewsEvent } from '@/types/agents';

interface NewsState {
  events: NewsEvent[];
  addEvent: (event: NewsEvent) => void;
  setEvents: (events: NewsEvent[]) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  events: [],

  addEvent: (event) =>
    set((state) => {
      const updated = [event, ...state.events.filter((e) => e.id !== event.id)].slice(0, 200);
      return { events: updated };
    }),

  setEvents: (events) => set({ events }),
}));
