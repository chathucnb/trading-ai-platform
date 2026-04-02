import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/forex/db/client';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ tier: 'free' });
    }

    const pool = getDbPool();
    const result = await pool.query(
      'SELECT tier, stripe_customer_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ tier: 'free' });
    }

    return NextResponse.json({
      tier: result.rows[0].tier,
      stripeCustomerId: result.rows[0].stripe_customer_id,
    });
  } catch (err) {
    console.error('[API] /payments/status error:', err);
    return NextResponse.json({ tier: 'free' });
  }
}
