-- Trade signals table
CREATE TABLE IF NOT EXISTS trade_signals (
  id            TEXT PRIMARY KEY,
  symbol        TEXT NOT NULL REFERENCES forex_pairs(symbol),
  timeframe     TEXT NOT NULL,
  direction     TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  entry_price   NUMERIC(18,6) NOT NULL,
  entry_time    TIMESTAMPTZ NOT NULL,
  tp1           NUMERIC(18,6) NOT NULL,
  tp2           NUMERIC(18,6) NOT NULL,
  tp3           NUMERIC(18,6) NOT NULL,
  stop_loss     NUMERIC(18,6) NOT NULL,
  risk_pips     NUMERIC(10,2) NOT NULL,
  reward_pips   NUMERIC(10,2) NOT NULL,
  rr_ratio      NUMERIC(6,2) NOT NULL,
  confidence    INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  strength      TEXT NOT NULL CHECK (strength IN ('LOW', 'MEDIUM', 'HIGH')),
  status        TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'EXPIRED')),
  conditions    TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_signals_symbol_created
  ON trade_signals (symbol, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_signals_status
  ON trade_signals (status) WHERE status = 'ACTIVE';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER signals_updated_at
  BEFORE UPDATE ON trade_signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
