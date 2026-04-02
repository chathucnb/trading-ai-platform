import { NextResponse } from 'next/server';

export async function GET() {
  const checks: Record<string, string> = {};

  // Check Redis
  try {
    const { getRedisClient, isRedisAvailable } = await import('@/lib/forex/cache/redisClient');
    if (isRedisAvailable()) {
      const redis = getRedisClient();
      await redis.ping();
      checks.redis = 'ok';
    } else {
      checks.redis = 'unavailable';
    }
  } catch {
    checks.redis = 'error';
  }

  // Check PostgreSQL
  try {
    const { getDbPool } = await import('@/lib/forex/db/client');
    const pool = getDbPool();
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  // Always return 200 so Railway healthcheck passes
  // The status field indicates actual health
  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: 200 }
  );
}
