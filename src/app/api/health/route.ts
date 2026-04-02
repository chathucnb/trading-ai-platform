import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/forex/cache/redisClient';
import { getDbPool } from '@/lib/forex/db/client';

export async function GET() {
  const checks: Record<string, string> = {};

  // Check Redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    checks.redis = 'ok';
  } catch {
    checks.redis = 'error';
  }

  // Check PostgreSQL
  try {
    const pool = getDbPool();
    await pool.query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
