import { z } from 'zod';
import type { OHLCVCandle, Timeframe } from './ohlcv';
import type { LivePrice } from './pairs';
import type { TradeSignal } from './signals';

// ── Inbound (client → server) ──────────────────────────────────────────────
export const SubscribeMessageSchema = z.object({
  type: z.literal('SUBSCRIBE'),
  pairs: z.array(z.string()),
  timeframes: z.array(z.string()),
});

export const UnsubscribeMessageSchema = z.object({
  type: z.literal('UNSUBSCRIBE'),
  pairs: z.array(z.string()),
});

export const PongMessageSchema = z.object({
  type: z.literal('PONG'),
});

export const ClientMessageSchema = z.discriminatedUnion('type', [
  SubscribeMessageSchema,
  UnsubscribeMessageSchema,
  PongMessageSchema,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// ── Outbound (server → client) ─────────────────────────────────────────────
export interface PriceUpdateMessage {
  type: 'PRICE_UPDATE';
  data: LivePrice;
}

export interface CandleUpdateMessage {
  type: 'CANDLE_UPDATE';
  symbol: string;
  timeframe: Timeframe;
  candle: OHLCVCandle;
  isClosed: boolean;
}

export interface SignalMessage {
  type: 'SIGNAL_NEW' | 'SIGNAL_UPDATE' | 'SIGNAL_EXPIRED';
  data: TradeSignal;
}

export interface PingMessage {
  type: 'PING';
  timestamp: number;
}

export interface ConnectedMessage {
  type: 'CONNECTED';
  pairs: string[];
  timestamp: number;
}

export interface ErrorMessage {
  type: 'ERROR';
  code: string;
  message: string;
}

// ── Agent messages (server → client) ──────────────────────────────────────
import type { AgentReasoning, AgentStatus, NewsEvent, VerifiedSignal } from '@/types/agents';

export interface NewsEventMessage {
  type: 'NEWS_EVENT';
  data: NewsEvent;
}

export interface AgentReasoningMessage {
  type: 'AGENT_REASONING';
  data: AgentReasoning;
}

export interface VerifiedSignalMessage {
  type: 'VERIFIED_SIGNAL';
  data: VerifiedSignal;
}

export interface AgentStatusMessage {
  type: 'AGENT_STATUS';
  agentName: string;
  status: AgentStatus;
}

export type ServerMessage =
  | PriceUpdateMessage
  | CandleUpdateMessage
  | SignalMessage
  | PingMessage
  | ConnectedMessage
  | ErrorMessage
  | NewsEventMessage
  | AgentReasoningMessage
  | VerifiedSignalMessage
  | AgentStatusMessage;
