-- Migration 006: Create verified_signals table for cross-verified trade signals

CREATE TABLE IF NOT EXISTS verified_signals (
  id                TEXT PRIMARY KEY,
  symbol            TEXT NOT NULL,
  direction         TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
  confidence        INTEGER NOT NULL CHECK (confidence BETWEEN 0 AND 100),
  news_signal_id    TEXT,
  chart_signal_id   TEXT,
  entry_price       NUMERIC(18,6) NOT NULL DEFAULT 0,
  stop_loss         NUMERIC(18,6) NOT NULL DEFAULT 0,
  tp1               NUMERIC(18,6) NOT NULL DEFAULT 0,
  tp2               NUMERIC(18,6) NOT NULL DEFAULT 0,
  tp3               NUMERIC(18,6) NOT NULL DEFAULT 0,
  reasoning         TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'EXPIRED')),
  verified_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verified_symbol ON verified_signals (symbol);
CREATE INDEX IF NOT EXISTS idx_verified_status ON verified_signals (status);
CREATE INDEX IF NOT EXISTS idx_verified_at ON verified_signals (verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_verified_confidence ON verified_signals (confidence DESC);
