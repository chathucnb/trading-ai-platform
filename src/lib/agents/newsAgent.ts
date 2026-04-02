/**
 * News Agent — monitors forex/crypto news in real-time via Finnhub,
 * analyzes market impact using Claude AI, and publishes events.
 */
import { randomUUID } from 'crypto';
import { BaseAgent } from './baseAgent';
import { getFinnhubNewsClient, type FinnhubArticle } from '@/lib/market/data/finnhubNewsClient';
import { CacheKeys } from '@/lib/forex/cache/redisClient';
import { getDbPool } from '@/lib/forex/db/client';
import type { NewsEvent } from '@/types/agents';

const POLL_INTERVAL_MS = 60_000; // 60 seconds
const MAX_ARTICLES_PER_BATCH = 10;

const SYSTEM_PROMPT = `You are a professional forex and cryptocurrency market news analyst.
Your job is to analyze news articles and determine their potential impact on financial markets.

For each article, provide a JSON response with this exact structure:
{
  "symbols": ["EUR/USD", "BTC/USD"],
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "impactScore": 1-10,
  "expectedDuration": "short-term" | "medium-term" | "long-term",
  "reasoning": "Brief 1-2 sentence explanation of market impact"
}

Guidelines:
- symbols: List trading pairs that would be most affected (use format like EUR/USD, BTC/USD, ETH/USD, etc.)
- impactScore: 1-3 = minor, 4-6 = moderate, 7-8 = significant, 9-10 = major market-moving
- short-term = minutes to hours, medium-term = hours to days, long-term = days to weeks
- Focus on actionable trading implications, not just news summary
- If the article has no clear market impact, set sentiment to NEUTRAL and impactScore to 1

Return ONLY the JSON object, no other text.`;

export class NewsAgent extends BaseAgent {
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super('NewsAgent', 'claude-haiku-4-5-20251001');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.setStatus('idle');
    this.startDailyReset();
    this.log('info', 'News Agent started');

    // Initial poll
    await this.pollNews();

    // Set up recurring poll
    this.pollTimer = setInterval(() => this.pollNews(), POLL_INTERVAL_MS);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.stopDailyReset();
    this.setStatus('idle');
    this.log('info', 'News Agent stopped');
  }

  private async pollNews(): Promise<void> {
    if (!this.isRunning) return;

    try {
      this.setStatus('processing');
      this.publishReasoning({
        symbol: '*',
        action: 'polling_news',
        reasoning: 'Fetching latest forex and crypto news from Finnhub...',
      });

      const client = getFinnhubNewsClient();
      const articles = await client.getAllTradingNews();

      // Filter out already-seen articles
      const newArticles = await this.filterNewArticles(articles);

      if (newArticles.length === 0) {
        this.setStatus('idle');
        return;
      }

      this.log('info', `Found ${newArticles.length} new articles to analyze`);

      // Process in batches to manage Claude API costs
      const batch = newArticles.slice(0, MAX_ARTICLES_PER_BATCH);
      await this.analyzeArticles(batch);

      this.setStatus('idle');
    } catch (err) {
      this.log('error', `Poll failed: ${err instanceof Error ? err.message : String(err)}`);
      this.setStatus('error');
    }
  }

  private async filterNewArticles(articles: FinnhubArticle[]): Promise<FinnhubArticle[]> {
    if (articles.length === 0) return [];

    const seenKey = CacheKeys.newsSeenSet();
    const pipeline = this.redis.pipeline();

    for (const article of articles) {
      pipeline.sismember(seenKey, String(article.id));
    }

    const results = await pipeline.exec();
    if (!results) return articles;

    return articles.filter((_, i) => {
      const [err, isMember] = results[i];
      return !err && isMember === 0;
    });
  }

  private async markAsSeen(articleIds: number[]): Promise<void> {
    if (articleIds.length === 0) return;
    const seenKey = CacheKeys.newsSeenSet();
    const pipeline = this.redis.pipeline();
    for (const id of articleIds) {
      pipeline.sadd(seenKey, String(id));
    }
    // Expire the set after 24 hours to prevent unbounded growth
    pipeline.expire(seenKey, 86400);
    await pipeline.exec();
  }

  private async analyzeArticles(articles: FinnhubArticle[]): Promise<void> {
    for (const article of articles) {
      if (!this.isRunning) break;

      try {
        const analysis = await this.analyzeArticle(article);
        if (analysis) {
          // Store in DB
          await this.storeNewsEvent(analysis);

          // Publish to Redis channels
          this.publishToChannel(CacheKeys.newsChannel(), {
            type: 'NEWS_EVENT',
            data: analysis,
          });

          // Store in recent news per symbol for cross-verification
          for (const symbol of analysis.symbols) {
            const key = CacheKeys.recentNews(symbol);
            await this.redis.lpush(key, JSON.stringify(analysis));
            await this.redis.ltrim(key, 0, 19); // keep last 20
            await this.redis.expire(key, 7200); // 2 hours TTL
          }

          this.publishReasoning({
            symbol: analysis.symbols[0] ?? '*',
            action: 'news_analyzed',
            reasoning: `${analysis.sentiment} signal (impact: ${analysis.impactScore}/10): ${analysis.reasoning}`,
            confidence: analysis.impactScore * 10,
            data: { headline: analysis.headline, symbols: analysis.symbols },
          });

          this.signalsToday++;
        }

        // Mark as seen
        await this.markAsSeen([article.id]);
      } catch (err) {
        this.log('warn', `Failed to analyze article ${article.id}: ${err instanceof Error ? err.message : String(err)}`);
        // Still mark as seen to avoid retrying failed articles
        await this.markAsSeen([article.id]);
      }
    }
  }

  private async analyzeArticle(article: FinnhubArticle): Promise<NewsEvent | null> {
    const userMessage = `Analyze this financial news article:

Headline: ${article.headline}
Summary: ${article.summary}
Source: ${article.source}
Category: ${article.category}
Related Tickers: ${article.related || 'N/A'}
Published: ${new Date(article.datetime * 1000).toISOString()}`;

    const response = await this.callClaude(SYSTEM_PROMPT, userMessage, { maxTokens: 512 });

    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]) as {
        symbols: string[];
        sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        impactScore: number;
        expectedDuration: 'short-term' | 'medium-term' | 'long-term';
        reasoning: string;
      };

      // Skip very low-impact news
      if (parsed.impactScore <= 1 && parsed.sentiment === 'NEUTRAL') return null;

      const event: NewsEvent = {
        id: randomUUID(),
        headline: article.headline,
        summary: article.summary,
        source: article.source,
        url: article.url,
        publishedAt: article.datetime * 1000,
        symbols: parsed.symbols,
        sentiment: parsed.sentiment,
        impactScore: Math.min(10, Math.max(1, parsed.impactScore)),
        expectedDuration: parsed.expectedDuration,
        reasoning: parsed.reasoning,
        analyzedAt: Date.now(),
      };

      return event;
    } catch (err) {
      this.log('warn', `Failed to parse Claude response for article: ${article.headline}`);
      return null;
    }
  }

  private async storeNewsEvent(event: NewsEvent): Promise<void> {
    try {
      const pool = getDbPool();
      await pool.query(
        `INSERT INTO news_events (id, headline, summary, source, url, published_at, symbols, sentiment, impact_score, expected_duration, reasoning, analyzed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [
          event.id,
          event.headline,
          event.summary,
          event.source,
          event.url,
          new Date(event.publishedAt),
          event.symbols,
          event.sentiment,
          event.impactScore,
          event.expectedDuration,
          event.reasoning,
          new Date(event.analyzedAt),
        ]
      );
    } catch (err) {
      this.log('warn', `DB insert failed for news event: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
