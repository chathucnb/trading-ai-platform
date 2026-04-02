'use client';

import { create } from 'zustand';
import type { AgentReasoning, AgentStatus, VerifiedSignal } from '@/types/agents';

interface AgentState {
  reasoning: AgentReasoning[];
  agentStatuses: Record<string, AgentStatus>;
  verifiedSignals: VerifiedSignal[];

  addReasoning: (r: AgentReasoning) => void;
  setAgentStatus: (name: string, status: AgentStatus) => void;
  addVerifiedSignal: (s: VerifiedSignal) => void;
  setVerifiedSignals: (signals: VerifiedSignal[]) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  reasoning: [],
  agentStatuses: {},
  verifiedSignals: [],

  addReasoning: (r) =>
    set((state) => ({
      reasoning: [r, ...state.reasoning].slice(0, 100),
    })),

  setAgentStatus: (name, status) =>
    set((state) => ({
      agentStatuses: { ...state.agentStatuses, [name]: status },
    })),

  addVerifiedSignal: (s) =>
    set((state) => ({
      verifiedSignals: [s, ...state.verifiedSignals.filter((v) => v.id !== s.id)].slice(0, 200),
    })),

  setVerifiedSignals: (signals) => set({ verifiedSignals: signals }),
}));
