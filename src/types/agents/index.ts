import type { Timeframe } from '../forex/ohlcv';
import type { EntryPoint, ExitPoint, RiskReward, SignalDirection } from '../forex/signals';

// ── Agent Status ──────────────────────────────────────────────────────────
export type AgentStatus = 'idle' | 'processing' | 'error';

export interface AgentInfo {
  name: string;
  status: AgentStatus;
  lastActivity: number;
  signalsToday: number;
  errorMessage?: string;
}

// ── Agent Reasoning (shared across all agents) ───────────────────────────
export interface AgentReasoning {
  agentName: string;
  timestamp: number;
  symbol: string;
  action: string;          // "analyzing_news" | "pattern_detected" | "signal_verified" etc.
  reasoning: string;       // natural language explanation
  confidence?: number;
  data?: Record<string, unknown>;
}

// ── Agent Signal (produced by individual agents before verification) ─────
export interface AgentSignal {
  id: string;
  source: 'news' | 'chart' | 'cross-verify';
  symbol: string;
  direction: SignalDirection | 'NEUTRAL';
  confidence: number;      // 0-100
  reasoning: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

// ── News Agent Types ─────────────────────────────────────────────────────
export type NewsSentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface NewsEvent {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: number;     // unix ms
  symbols: string[];       // affected trading pairs
  sentiment: NewsSentiment;
  impactScore: number;     // 1-10
  expectedDuration: 'short-term' | 'medium-term' | 'long-term';
  reasoning: string;       // Claude's analysis
  analyzedAt: number;      // unix ms
}

// ── Chart Agent Types ────────────────────────────────────────────────────
export interface ChartAnalysis {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  patterns: string[];              // ["ascending triangle", "bullish engulfing"]
  trendAssessment: string;         // "strong uptrend" | "consolidating" etc.
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  recommendation: AgentSignal;
  reasoning: string;
  analyzedAt: number;              // unix ms
}

// ── Cross-Verification Agent Types ───────────────────────────────────────
export type VerifiedSignalStatus = 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED';

export interface VerifiedSignal {
  id: string;
  symbol: string;
  direction: SignalDirection;
  confidence: number;
  newsSignalId: string | null;
  chartSignalId: string | null;
  entry: EntryPoint;
  exit: ExitPoint;
  riskReward: RiskReward;
  reasoning: string;               // combined reasoning from Claude
  newsReasoning: string;
  chartReasoning: string;
  status: VerifiedSignalStatus;
  verifiedAt: number;              // unix ms
  expiresAt: number;               // unix ms
}
