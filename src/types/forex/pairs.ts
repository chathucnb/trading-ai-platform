export interface ForexPair {
  symbol: string;       // e.g. "EUR/USD"
  base: string;         // e.g. "EUR"
  quote: string;        // e.g. "USD"
  displayName: string;  // e.g. "Euro / US Dollar"
  pipSize: number;      // e.g. 0.0001 for most pairs, 0.01 for JPY pairs
  lotSize: number;      // standard lot = 100000
}

export interface LivePrice {
  symbol: string;
  bid: number;
  ask: number;
  mid: number;
  spread: number;       // in pips
  timestamp: number;    // unix ms
  change: number;       // vs previous close
  changePercent: number;
  dailyHigh: number;
  dailyLow: number;
}

export interface MarketDetails {
  symbol: string;
  spread: number;       // in pips
  pipValue: number;     // USD value per pip per standard lot
  atr14: number;        // ATR(14) value in price
  atr14Pips: number;    // ATR(14) in pips
  volatilityLabel: 'LOW' | 'MEDIUM' | 'HIGH';
  swapLong: number;
  swapShort: number;
  sessionStatus: SessionStatus;
}

export interface SessionStatus {
  sydney: boolean;
  tokyo: boolean;
  london: boolean;
  newYork: boolean;
  overlap: 'none' | 'tokyo-london' | 'london-newyork';
  nextOpen: { session: string; timestamp: number } | null;
}

export const MAJOR_PAIRS: ForexPair[] = [
  { symbol: 'EUR/USD', base: 'EUR', quote: 'USD', displayName: 'Euro / US Dollar', pipSize: 0.0001, lotSize: 100000 },
  { symbol: 'GBP/USD', base: 'GBP', quote: 'USD', displayName: 'British Pound / US Dollar', pipSize: 0.0001, lotSize: 100000 },
  { symbol: 'USD/JPY', base: 'USD', quote: 'JPY', displayName: 'US Dollar / Japanese Yen', pipSize: 0.01, lotSize: 100000 },
  { symbol: 'USD/CHF', base: 'USD', quote: 'CHF', displayName: 'US Dollar / Swiss Franc', pipSize: 0.0001, lotSize: 100000 },
  { symbol: 'AUD/USD', base: 'AUD', quote: 'USD', displayName: 'Australian Dollar / US Dollar', pipSize: 0.0001, lotSize: 100000 },
  { symbol: 'USD/CAD', base: 'USD', quote: 'CAD', displayName: 'US Dollar / Canadian Dollar', pipSize: 0.0001, lotSize: 100000 },
  { symbol: 'NZD/USD', base: 'NZD', quote: 'USD', displayName: 'New Zealand Dollar / US Dollar', pipSize: 0.0001, lotSize: 100000 },
  { symbol: 'EUR/GBP', base: 'EUR', quote: 'GBP', displayName: 'Euro / British Pound', pipSize: 0.0001, lotSize: 100000 },
  { symbol: 'EUR/JPY', base: 'EUR', quote: 'JPY', displayName: 'Euro / Japanese Yen', pipSize: 0.01, lotSize: 100000 },
  { symbol: 'GBP/JPY', base: 'GBP', quote: 'JPY', displayName: 'British Pound / Japanese Yen', pipSize: 0.01, lotSize: 100000 },
];

// Re-export crypto pairs and provide a unified ALL_PAIRS list
import { CRYPTO_PAIRS } from '@/types/market/crypto';
export { CRYPTO_PAIRS };

export const ALL_PAIRS = [...MAJOR_PAIRS, ...CRYPTO_PAIRS];

/** Look up any pair (forex or crypto) by symbol */
export function findPair(symbol: string): ForexPair | typeof CRYPTO_PAIRS[number] | undefined {
  return ALL_PAIRS.find((p) => p.symbol === symbol);
}
