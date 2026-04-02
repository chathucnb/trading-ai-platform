import type { Timeframe } from './ohlcv';

export type SignalDirection = 'LONG' | 'SHORT';
export type SignalStrength = 'LOW' | 'MEDIUM' | 'HIGH';
export type SignalStatus = 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED';

export interface EntryPoint {
  price: number;
  timestamp: number;
}

export interface ExitPoint {
  tp1: number;
  tp2: number;
  tp3: number;
  stopLoss: number;
  trailingActive: boolean;
}

export interface RiskReward {
  ratio: number;       // e.g. 2.5 means 1:2.5
  riskPips: number;
  rewardPips: number;  // to TP2
}

export interface TradeSignal {
  id: string;
  symbol: string;
  timeframe: Timeframe;
  direction: SignalDirection;
  entry: EntryPoint;
  exit: ExitPoint;
  riskReward: RiskReward;
  confidence: number;          // 0-100
  strength: SignalStrength;
  status: SignalStatus;
  conditions: string[];        // which conditions triggered
  createdAt: number;           // unix ms
  updatedAt: number;
  expiresAt: number;           // unix ms (signal expires after 3 candles)
}

export interface SignalEvent {
  type: 'NEW_SIGNAL' | 'SIGNAL_UPDATE' | 'SIGNAL_EXPIRED';
  signal: TradeSignal;
}
