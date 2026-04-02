-- Migration 005: Create chart_analyses table for AI chart pattern analysis

CREATE TABLE IF NOT EXISTS chart_analyses (
  id                  TEXT PRIMARY KEY,
  symbol              TEXT NOT NULL,
  timeframe           TEXT NOT NULL,
  patterns            TEXT[] NOT NULL DEFAULT '{}',
  trend_assessment    TEXT NOT NULL,
  support_levels      NUMERIC(18,6)[] DEFAULT '{}',
  resistance_levels   NUMERIC(18,6)[] DEFAULT '{}',
  direction           TEXT,
  confidence          INTEGER,
  reasoning           TEXT NOT NULL,
  analyzed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chart_symbol ON chart_analyses (symbol);
CREATE INDEX IF NOT EXISTS idx_chart_analyzed ON chart_analyses (analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_chart_symbol_tf ON chart_analyses (symbol, timeframe);
