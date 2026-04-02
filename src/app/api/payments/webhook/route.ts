import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getStripe } from '@/lib/payments/stripeClient';
import { getDbPool } from '@/lib/forex/db/client';
import type Stripe from 'stripe';

// Helper to safely extract period dates from subscription-like objects
function getPeriodDates(sub: Record<string, unknown>): { start: Date; end: Date } {
  const startTs = (sub.current_period_start as number) ?? 0;
  const endTs = (sub.current_period_end as number) ?? 0;
  return {
    start: new Date(startTs * 1000),
    end: new Date(endTs * 1000),
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const pool = getDbPool();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tier = session.metadata?.tier ?? 'pro';
        const email = session.customer_email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (email) {
          await pool.query(
            `INSERT INTO users (id, email, stripe_customer_id, tier)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO UPDATE SET stripe_customer_id = $3, tier = $4, updated_at = NOW()`,
            [customerId, email, customerId, tier]
          );

          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const subData = sub as unknown as Record<string, unknown>;
            const { start, end } = getPeriodDates(subData);
            await pool.query(
              `INSERT INTO subscriptions (id, user_id, stripe_subscription_id, tier, status, current_period_start, current_period_end)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (stripe_subscription_id) DO UPDATE SET status = $5, current_period_start = $6, current_period_end = $7`,
              [subscriptionId, customerId, subscriptionId, tier, (subData.status as string), start, end]
            );
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoiceData = event.data.object as unknown as Record<string, unknown>;
        const subscriptionId = invoiceData.subscription as string;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const subData = sub as unknown as Record<string, unknown>;
          const { start, end } = getPeriodDates(subData);
          await pool.query(
            `UPDATE subscriptions SET status = $1, current_period_start = $2, current_period_end = $3
             WHERE stripe_subscription_id = $4`,
            [(subData.status as string), start, end, subscriptionId]
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subData = event.data.object as unknown as Record<string, unknown>;
        const { start, end } = getPeriodDates(subData);
        await pool.query(
          `UPDATE subscriptions SET status = $1, cancel_at_period_end = $2, current_period_start = $3, current_period_end = $4
           WHERE stripe_subscription_id = $5`,
          [(subData.status as string), Boolean(subData.cancel_at_period_end), start, end, (subData.id as string)]
        );

        if (subData.status === 'canceled' || subData.status === 'incomplete_expired') {
          await pool.query(
            `UPDATE users SET tier = 'free', updated_at = NOW() WHERE stripe_customer_id = $1`,
            [(subData.customer as string)]
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subData = event.data.object as unknown as Record<string, unknown>;
        await pool.query(
          `UPDATE subscriptions SET status = 'canceled' WHERE stripe_subscription_id = $1`,
          [(subData.id as string)]
        );
        await pool.query(
          `UPDATE users SET tier = 'free', updated_at = NOW() WHERE stripe_customer_id = $1`,
          [(subData.customer as string)]
        );
        break;
      }
    }
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
