'use client';

import type { SubscriptionTier } from '@/store/userStore';

interface PricingTier {
  name: string;
  tier: SubscriptionTier;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    tier: 'free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic trading tools',
    features: [
      'Forex & crypto price charts',
      'Basic technical indicators',
      '3 AI signals per day',
      'Market overview dashboard',
    ],
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: '$29',
    period: '/month',
    description: 'Full AI-powered trading intelligence',
    features: [
      'Everything in Free',
      'Unlimited AI signals',
      'Agent reasoning dashboard',
      'Real-time news feed with AI analysis',
      'Email alerts for high-confidence signals',
      'All timeframes & indicators',
    ],
    highlighted: true,
    cta: 'Upgrade to Pro',
  },
  {
    name: 'Premium',
    tier: 'premium',
    price: '$79',
    period: '/month',
    description: 'Maximum trading edge with cross-verified signals',
    features: [
      'Everything in Pro',
      'Cross-verified signals (News + Chart AI)',
      'Priority analysis (faster processing)',
      'API access for automated trading',
      'Advanced pattern recognition',
      'Custom alert configurations',
    ],
    cta: 'Upgrade to Premium',
  },
];

export default function PricingCards({
  currentTier = 'free',
  onSelectTier,
}: {
  currentTier?: SubscriptionTier;
  onSelectTier?: (tier: SubscriptionTier) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {tiers.map((tier) => {
        const isCurrent = tier.tier === currentTier;
        const isHighlighted = tier.highlighted;

        return (
          <div
            key={tier.tier}
            className={`relative rounded-xl p-6 border transition-all ${
              isHighlighted
                ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                : 'border-gray-700 bg-gray-800/50'
            }`}
          >
            {isHighlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                Most Popular
              </div>
            )}

            <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{tier.description}</p>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-bold text-white">{tier.price}</span>
              <span className="text-sm text-gray-400">{tier.period}</span>
            </div>

            <ul className="space-y-2 mb-6">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => !isCurrent && onSelectTier?.(tier.tier)}
              disabled={isCurrent}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-gray-700 text-gray-400 cursor-default'
                  : isHighlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isCurrent ? 'Current Plan' : tier.cta}
            </button>
          </div>
        );
      })}
    </div>
  );
}
