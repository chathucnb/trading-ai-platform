export type MarketType = 'forex' | 'crypto';

export interface TradingPair {
  symbol: string;          // "EUR/USD" or "BTC/USD"
  base: string;
  quote: string;
  displayName: string;
  market: MarketType;
  pipSize: number;         // 0.0001 for forex, 0.01 for crypto
  lotSize: number;         // 100000 for forex, 1 for crypto
  decimals: number;        // display precision
}

/** CoinGecko coin ID mapping for crypto pairs */
export const COINGECKO_ID_MAP: Record<string, string> = {
  'BTC/USD': 'bitcoin',
  'ETH/USD': 'ethereum',
  'SOL/USD': 'solana',
  'BNB/USD': 'binancecoin',
  'XRP/USD': 'ripple',
  'ADA/USD': 'cardano',
  'DOGE/USD': 'dogecoin',
  'AVAX/USD': 'avalanche-2',
};
