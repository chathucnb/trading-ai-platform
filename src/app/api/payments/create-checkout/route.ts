import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getStripe, PRICE_IDS } from '@/lib/payments/stripeClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, email, successUrl, cancelUrl } = body;

    if (!tier || !['pro', 'premium'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const priceId = tier === 'pro' ? PRICE_IDS.pro : PRICE_IDS.premium;
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${request.nextUrl.origin}/trading/dashboard?checkout=success`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/trading/pricing?checkout=canceled`,
      metadata: { tier },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[API] /payments/create-checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
