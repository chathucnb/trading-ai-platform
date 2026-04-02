import { Pool } from 'pg';

const DB_URL = process.env.DATABASE_URL ?? 'postgresql://forex_user:forex_password@localhost:5432/forex_db';

let _pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: DB_URL, max: 10 });
    _pool.on('error', (err) => console.error('[DB] pool error', err));
  }
  return _pool;
}
