'use client';

import { useRouter } from 'next/navigation';
import PricingCards from '@/components/payments/PricingCard';
import { useUserStore, type SubscriptionTier } from '@/store/userStore';

export default function PricingPage() {
  const router = useRouter();
  const tier = useUserStore((s) => s.tier);

  const handleSelectTier = async (selectedTier: SubscriptionTier) => {
    if (selectedTier === 'free') return;

    try {
      const res = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          successUrl: `${window.location.origin}/trading/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/trading/pricing?checkout=canceled`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-97px)] overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white mb-2">
            Upgrade Your Trading Edge
          </h1>
          <p className="text-gray-400">
            Get AI-powered signals, real-time news analysis, and cross-verified trade recommendations
          </p>
        </div>

        <PricingCards currentTier={tier} onSelectTier={handleSelectTier} />

        <div className="mt-10 text-center text-xs text-gray-600">
          <p>All plans include a 7-day free trial. Cancel anytime.</p>
          <p className="mt-1">Payments powered by Stripe. Secure and encrypted.</p>
        </div>
      </div>
    </div>
  );
}
