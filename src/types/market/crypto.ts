import type { TradingPair } from './index';

export const CRYPTO_PAIRS: TradingPair[] = [
  { symbol: 'BTC/USD', base: 'BTC', quote: 'USD', displayName: 'Bitcoin', market: 'crypto', pipSize: 0.01, lotSize: 1, decimals: 2 },
  { symbol: 'ETH/USD', base: 'ETH', quote: 'USD', displayName: 'Ethereum', market: 'crypto', pipSize: 0.01, lotSize: 1, decimals: 2 },
  { symbol: 'SOL/USD', base: 'SOL', quote: 'USD', displayName: 'Solana', market: 'crypto', pipSize: 0.001, lotSize: 1, decimals: 3 },
  { symbol: 'BNB/USD', base: 'BNB', quote: 'USD', displayName: 'BNB', market: 'crypto', pipSize: 0.01, lotSize: 1, decimals: 2 },
  { symbol: 'XRP/USD', base: 'XRP', quote: 'USD', displayName: 'XRP', market: 'crypto', pipSize: 0.0001, lotSize: 1, decimals: 4 },
  { symbol: 'ADA/USD', base: 'ADA', quote: 'USD', displayName: 'Cardano', market: 'crypto', pipSize: 0.0001, lotSize: 1, decimals: 4 },
  { symbol: 'DOGE/USD', base: 'DOGE', quote: 'USD', displayName: 'Dogecoin', market: 'crypto', pipSize: 0.00001, lotSize: 1, decimals: 5 },
  { symbol: 'AVAX/USD', base: 'AVAX', quote: 'USD', displayName: 'Avalanche', market: 'crypto', pipSize: 0.001, lotSize: 1, decimals: 3 },
];
