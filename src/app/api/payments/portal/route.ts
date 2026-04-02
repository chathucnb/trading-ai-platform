import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getStripe } from '@/lib/payments/stripeClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, returnUrl } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${request.nextUrl.origin}/trading/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[API] /payments/portal error:', err);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
