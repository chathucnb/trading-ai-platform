import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn('[Stripe] No secret key set — set STRIPE_SECRET_KEY in .env.local');
    }
    _stripe = new Stripe(key ?? '', { apiVersion: '2026-03-25.dahlia' });
  }
  return _stripe;
}

export const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_ID_PRO ?? '',
  premium: process.env.STRIPE_PRICE_ID_PREMIUM ?? '',
} as const;
