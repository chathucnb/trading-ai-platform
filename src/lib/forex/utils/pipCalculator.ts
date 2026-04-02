import type { ForexPair } from '@/types/forex/pairs';

/** Convert price distance to pips */
export function priceToPips(price: number, pair: ForexPair): number {
  return Math.round((price / pair.pipSize) * 10) / 10;
}

/** Convert pips to price distance */
export function pipsToPrice(pips: number, pair: ForexPair): number {
  return pips * pair.pipSize;
}

/**
 * Pip value in account currency (USD) for a standard 1.0 lot.
 * For USD quote pairs (e.g. EUR/USD): pip_value = pip_size * lot_size
 * For non-USD quote pairs: divide by current exchange rate
 */
export function calcPipValue(pair: ForexPair, quoteToUsdRate = 1): number {
  const rawValue = pair.pipSize * pair.lotSize;
  return rawValue / quoteToUsdRate;
}

/** Format a price to the appropriate decimal places */
export function formatPrice(price: number, pair: ForexPair): string {
  const decimals = pair.pipSize < 0.001 ? 5 : 3;
  return price.toFixed(decimals);
}

/** Format pips */
export function formatPips(pips: number): string {
  return pips.toFixed(1);
}
