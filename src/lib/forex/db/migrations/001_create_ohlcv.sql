-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Pairs reference table
CREATE TABLE IF NOT EXISTS forex_pairs (
  symbol       TEXT PRIMARY KEY,
  base         TEXT NOT NULL,
  quote        TEXT NOT NULL,
  display_name TEXT NOT NULL,
  pip_size     NUMERIC(10,6) NOT NULL,
  lot_size     INTEGER NOT NULL DEFAULT 100000,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default major pairs
INSERT INTO forex_pairs (symbol, base, quote, display_name, pip_size) VALUES
  ('EUR/USD', 'EUR', 'USD', 'Euro / US Dollar',              0.0001),
  ('GBP/USD', 'GBP', 'USD', 'British Pound / US Dollar',     0.0001),
  ('USD/JPY', 'USD', 'JPY', 'US Dollar / Japanese Yen',      0.01),
  ('USD/CHF', 'USD', 'CHF', 'US Dollar / Swiss Franc',       0.0001),
  ('AUD/USD', 'AUD', 'USD', 'Australian Dollar / US Dollar', 0.0001),
  ('USD/CAD', 'USD', 'CAD', 'US Dollar / Canadian Dollar',   0.0001),
  ('NZD/USD', 'NZD', 'USD', 'New Zealand Dollar / US Dollar',0.0001),
  ('EUR/GBP', 'EUR', 'GBP', 'Euro / British Pound',          0.0001),
  ('EUR/JPY', 'EUR', 'JPY', 'Euro / Japanese Yen',           0.01),
  ('GBP/JPY', 'GBP', 'JPY', 'British Pound / Japanese Yen', 0.01)
ON CONFLICT (symbol) DO NOTHING;

-- OHLCV time-series table
CREATE TABLE IF NOT EXISTS ohlcv (
  time       TIMESTAMPTZ NOT NULL,
  symbol     TEXT        NOT NULL REFERENCES forex_pairs(symbol),
  timeframe  TEXT        NOT NULL, -- M1, M5, M15, M30, H1, H4, D1, W1
  open       NUMERIC(18,6) NOT NULL,
  high       NUMERIC(18,6) NOT NULL,
  low        NUMERIC(18,6) NOT NULL,
  close      NUMERIC(18,6) NOT NULL,
  volume     NUMERIC(20,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (time, symbol, timeframe)
);

-- Convert to TimescaleDB hypertable partitioned by time
SELECT create_hypertable('ohlcv', 'time', if_not_exists => TRUE);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_tf_time
  ON ohlcv (symbol, timeframe, time DESC);

-- Continuous aggregate: 1-minute → 1-hour
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlcv_1h
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 hour', time) AS bucket,
  symbol,
  FIRST(open,  time) AS open,
  MAX(high)         AS high,
  MIN(low)          AS low,
  LAST(close, time) AS close,
  SUM(volume)       AS volume
FROM ohlcv
WHERE timeframe = 'M1'
GROUP BY bucket, symbol
WITH NO DATA;

-- Continuous aggregate: 1-hour → 1-day
CREATE MATERIALIZED VIEW IF NOT EXISTS ohlcv_1d
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', bucket) AS day_bucket,
  symbol,
  FIRST(open,  bucket) AS open,
  MAX(high)            AS high,
  MIN(low)             AS low,
  LAST(close, bucket)  AS close,
  SUM(volume)          AS volume
FROM ohlcv_1h
GROUP BY day_bucket, symbol
WITH NO DATA;
