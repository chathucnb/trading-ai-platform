-- Migration 004: Create news_events table for AI-analyzed market news

CREATE TABLE IF NOT EXISTS news_events (
  id                TEXT PRIMARY KEY,
  headline          TEXT NOT NULL,
  summary           TEXT NOT NULL DEFAULT '',
  source            TEXT NOT NULL,
  url               TEXT,
  published_at      TIMESTAMPTZ NOT NULL,
  symbols           TEXT[] NOT NULL DEFAULT '{}',
  sentiment         TEXT NOT NULL CHECK (sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  impact_score      INTEGER NOT NULL CHECK (impact_score BETWEEN 1 AND 10),
  expected_duration TEXT NOT NULL CHECK (expected_duration IN ('short-term', 'medium-term', 'long-term')),
  reasoning         TEXT NOT NULL,
  analyzed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_symbols ON news_events USING GIN (symbols);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_events (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news_events (sentiment);
CREATE INDEX IF NOT EXISTS idx_news_impact ON news_events (impact_score DESC);
