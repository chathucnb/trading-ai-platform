'use client';

import { useUserStore } from '@/store/userStore';
import { getTierLabel } from '@/lib/payments/featureGate';

export default function AccountPage() {
  const user = useUserStore((s) => s.user);
  const tier = useUserStore((s) => s.tier);

  const handleManageBilling = async () => {
    if (!user?.stripeCustomerId) return;

    try {
      const res = await fetch('/api/payments/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.stripeCustomerId,
          returnUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-97px)] overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-xl font-bold text-white mb-6">Account</h1>

        {/* Current Plan */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white">{getTierLabel(tier)}</span>
              <p className="text-sm text-gray-400 mt-1">
                {tier === 'free' ? 'Upgrade to unlock all features' : 'Your subscription is active'}
              </p>
            </div>
            {tier !== 'free' && user?.stripeCustomerId && (
              <button
                onClick={handleManageBilling}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
              >
                Manage Billing
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Profile</h2>
          {user ? (
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 block">Email</span>
                <span className="text-sm text-white">{user.email}</span>
              </div>
              {user.name && (
                <div>
                  <span className="text-xs text-gray-500 block">Name</span>
                  <span className="text-sm text-white">{user.name}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Not signed in. Sign up to save your preferences and access premium features.</p>
          )}
        </div>
      </div>
    </div>
  );
}
