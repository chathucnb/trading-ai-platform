import type { SubscriptionTier } from '@/store/userStore';

export type Feature =
  | 'basic_charts'
  | 'forex_prices'
  | 'crypto_prices'
  | 'limited_signals'
  | 'unlimited_signals'
  | 'agent_reasoning'
  | 'news_feed'
  | 'email_alerts'
  | 'verified_signals'
  | 'priority_analysis'
  | 'api_access';

const TIER_FEATURES: Record<SubscriptionTier, Feature[]> = {
  free: ['basic_charts', 'forex_prices', 'crypto_prices', 'limited_signals'],
  pro: [
    'basic_charts', 'forex_prices', 'crypto_prices',
    'unlimited_signals', 'agent_reasoning', 'news_feed', 'email_alerts',
  ],
  premium: [
    'basic_charts', 'forex_prices', 'crypto_prices',
    'unlimited_signals', 'agent_reasoning', 'news_feed', 'email_alerts',
    'verified_signals', 'priority_analysis', 'api_access',
  ],
};

export function canAccess(tier: SubscriptionTier, feature: Feature): boolean {
  return TIER_FEATURES[tier]?.includes(feature) ?? false;
}

export function getMaxSignalsPerDay(tier: SubscriptionTier): number {
  switch (tier) {
    case 'free': return 3;
    case 'pro': return Infinity;
    case 'premium': return Infinity;
  }
}

export function getTierLabel(tier: SubscriptionTier): string {
  switch (tier) {
    case 'free': return 'Free';
    case 'pro': return 'Pro';
    case 'premium': return 'Premium';
  }
}
