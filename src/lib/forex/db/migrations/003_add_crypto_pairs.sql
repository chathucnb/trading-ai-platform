-- Migration 003: Add market_type column and crypto pairs support

-- Add market_type column to any existing forex_pairs table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forex_pairs') THEN
    ALTER TABLE forex_pairs ADD COLUMN IF NOT EXISTS market_type TEXT NOT NULL DEFAULT 'forex';
  END IF;
END $$;

-- Create trading_pairs table if forex_pairs doesn't exist
CREATE TABLE IF NOT EXISTS trading_pairs (
  symbol       TEXT PRIMARY KEY,
  base         TEXT NOT NULL,
  quote        TEXT NOT NULL,
  display_name TEXT NOT NULL,
  market_type  TEXT NOT NULL DEFAULT 'forex' CHECK (market_type IN ('forex', 'crypto')),
  pip_size     NUMERIC(10,8) NOT NULL DEFAULT 0.0001,
  lot_size     NUMERIC(12,2) NOT NULL DEFAULT 100000,
  decimals     INTEGER NOT NULL DEFAULT 4,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert crypto pairs
INSERT INTO trading_pairs (symbol, base, quote, display_name, market_type, pip_size, lot_size, decimals) VALUES
  ('BTC/USD', 'BTC', 'USD', 'Bitcoin', 'crypto', 0.01, 1, 2),
  ('ETH/USD', 'ETH', 'USD', 'Ethereum', 'crypto', 0.01, 1, 2),
  ('SOL/USD', 'SOL', 'USD', 'Solana', 'crypto', 0.001, 1, 3),
  ('BNB/USD', 'BNB', 'USD', 'BNB', 'crypto', 0.01, 1, 2),
  ('XRP/USD', 'XRP', 'USD', 'XRP', 'crypto', 0.0001, 1, 4),
  ('ADA/USD', 'ADA', 'USD', 'Cardano', 'crypto', 0.0001, 1, 4),
  ('DOGE/USD', 'DOGE', 'USD', 'Dogecoin', 'crypto', 0.00001, 1, 5),
  ('AVAX/USD', 'AVAX', 'USD', 'Avalanche', 'crypto', 0.001, 1, 3)
ON CONFLICT (symbol) DO NOTHING;

-- Also insert forex pairs for completeness
INSERT INTO trading_pairs (symbol, base, quote, display_name, market_type, pip_size, lot_size, decimals) VALUES
  ('EUR/USD', 'EUR', 'USD', 'Euro / US Dollar', 'forex', 0.0001, 100000, 4),
  ('GBP/USD', 'GBP', 'USD', 'British Pound / US Dollar', 'forex', 0.0001, 100000, 4),
  ('USD/JPY', 'USD', 'JPY', 'US Dollar / Japanese Yen', 'forex', 0.01, 100000, 2),
  ('USD/CHF', 'USD', 'CHF', 'US Dollar / Swiss Franc', 'forex', 0.0001, 100000, 4),
  ('AUD/USD', 'AUD', 'USD', 'Australian Dollar / US Dollar', 'forex', 0.0001, 100000, 4),
  ('USD/CAD', 'USD', 'CAD', 'US Dollar / Canadian Dollar', 'forex', 0.0001, 100000, 4),
  ('NZD/USD', 'NZD', 'USD', 'New Zealand Dollar / US Dollar', 'forex', 0.0001, 100000, 4),
  ('EUR/GBP', 'EUR', 'GBP', 'Euro / British Pound', 'forex', 0.0001, 100000, 4),
  ('EUR/JPY', 'EUR', 'JPY', 'Euro / Japanese Yen', 'forex', 0.01, 100000, 2),
  ('GBP/JPY', 'GBP', 'JPY', 'British Pound / Japanese Yen', 'forex', 0.01, 100000, 2)
ON CONFLICT (symbol) DO NOTHING;
