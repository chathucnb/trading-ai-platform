'use client';

import { create } from 'zustand';

export type SubscriptionTier = 'free' | 'pro' | 'premium';

interface User {
  id: string;
  email: string;
  name: string;
  stripeCustomerId?: string;
}

interface UserState {
  user: User | null;
  tier: SubscriptionTier;
  setUser: (user: User) => void;
  setTier: (tier: SubscriptionTier) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  tier: 'free',

  setUser: (user) => set({ user }),
  setTier: (tier) => set({ tier }),
  logout: () => set({ user: null, tier: 'free' }),
}));
