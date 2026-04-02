/**
 * Cross-Verification Agent — validates signals by cross-referencing
 * news analysis + chart analysis to produce high-confidence verified signals.
 * Uses Claude Sonnet for higher reasoning quality.
 */
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { BaseAgent } from './baseAgent';
import { CacheKeys } from '@/lib/forex/cache/redisClient';
import { getDbPool } from '@/lib/forex/db/client';
import type { NewsEvent, ChartAnalysis, VerifiedSignal, AgentSignal } from '@/types/agents';
import type { SignalDirection, ExitPoint, RiskReward } from '@/types/forex/signals';

const CHECK_INTERVAL_MS = 30_000; // Check every 30 seconds

const SYSTEM_PROMPT = `You are a senior trading risk manager at a hedge fund.
You receive two independent analyses of a trading pair:
1. A news/fundamental analysis
2. A technical/chart analysis

Your job is to determine if these analyses corroborate each other and whether a trade should be taken.

Respond with a JSON object:
{
  "confirmed": true | false,
  "direction": "LONG" | "SHORT",
  "confidence": 0-100,
  "entryPrice": number,
  "stopLoss": number,
  "tp1": number,
  "tp2": number,
  "tp3": number,
  "riskRewardRatio": number,
  "riskPips": number,
  "rewardPips": number,
  "reasoning": "2-3 sentence explanation of your decision"
}

Guidelines:
- Only confirm if BOTH analyses point in the same direction (or one is very strong)
- Set confirmed=false if analyses conflict or overall confidence is below 60
- Be conservative — false positives cost real money
- Consider the news impact magnitude vs chart pattern reliability
- Factor in current market session and volatility
- The confidence should reflect the combined strength, not just the average

Return ONLY the JSON object, no other text.`;

export class CrossVerifyAgent extends BaseAgent {
  private subscriber: Redis | null = null;
  private checkTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super('CrossVerifyAgent', 'claude-sonnet-4-6');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.setStatus('idle');
    this.startDailyReset();
    this.log('info', 'Cross-Verify Agent started');

    // Subscribe to news and chart analysis channels
    this.subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    this.subscriber.psubscribe('channel:news:*', 'channel:agent:chart-analysis');
    this.subscriber.on('pmessage', (_pattern, channel, message) => {
      this.handleIncomingSignal(channel, message);
    });

    // Periodic check for corroboration across all symbols
    this.checkTimer = setInterval(() => this.checkAllSymbols(), CHECK_INTERVAL_MS);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.subscriber) {
      this.subscriber.disconnect();
      this.subscriber = null;
    }
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    this.stopDailyReset();
    this.setStatus('idle');
    this.log('info', 'Cross-Verify Agent stopped');
  }

  private async handleIncomingSignal(channel: string, message: string): Promise<void> {
    try {
      const data = JSON.parse(message);

      if (data.type === 'NEWS_EVENT' && data.data) {
        const event = data.data as NewsEvent;
        // Check if we can cross-verify any of the affected symbols
        for (const symbol of event.symbols) {
          await this.attemptCrossVerification(symbol);
        }
      } else if (data.type === 'CHART_ANALYSIS' && data.data) {
        const analysis = data.data as ChartAnalysis;
        await this.attemptCrossVerification(analysis.symbol);
      }
    } catch {
      // ignore parse errors
    }
  }

  private async checkAllSymbols(): Promise<void> {
    if (!this.isRunning) return;

    // Get all symbols that have recent data
    const keys = await this.redis.keys('agent:recent-news:*');
    const symbols = keys.map((k) => k.replace('agent:recent-news:', ''));

    for (const symbol of symbols) {
      await this.attemptCrossVerification(symbol);
    }
  }

  private async attemptCrossVerification(symbol: string): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Get recent news for this symbol
      const newsKey = CacheKeys.recentNews(symbol);
      const rawNews = await this.redis.lrange(newsKey, 0, 4);
      const recentNews: NewsEvent[] = rawNews.map((r) => JSON.parse(r));

      // Get recent chart analyses for this symbol
      const chartKey = CacheKeys.recentChartAnalysis(symbol);
      const rawChart = await this.redis.lrange(chartKey, 0, 4);
      const recentCharts: ChartAnalysis[] = rawChart.map((r) => JSON.parse(r));

      // Determine verification path
      const hasNews = recentNews.length > 0;
      const hasChart = recentCharts.length > 0;

      if (hasNews && hasChart) {
        // Full cross-verification
        await this.fullCrossVerification(symbol, recentNews[0], recentCharts[0]);
      } else if (hasChart && !hasNews) {
        // Chart-only: accept if confidence >= 85
        const latest = recentCharts[0];
        if (latest.recommendation.confidence >= 85 && latest.recommendation.direction !== 'NEUTRAL') {
          await this.chartOnlyVerification(symbol, latest);
        }
      } else if (hasNews && !hasChart) {
        // News-only: accept if impact >= 8
        const latest = recentNews[0];
        if (latest.impactScore >= 8 && latest.sentiment !== 'NEUTRAL') {
          await this.newsOnlyVerification(symbol, latest);
        }
      }
    } catch (err) {
      this.log('warn', `Cross-verification failed for ${symbol}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async fullCrossVerification(
    symbol: string,
    news: NewsEvent,
    chart: ChartAnalysis
  ): Promise<void> {
    // Check if we already verified this combination
    const verifyKey = `agent:verified:${symbol}:${news.id}:${chart.id}`;
    const alreadyVerified = await this.redis.get(verifyKey);
    if (alreadyVerified) return;

    this.setStatus('processing');
    this.publishReasoning({
      symbol,
      action: 'cross_verifying',
      reasoning: `Cross-verifying news (${news.sentiment}, impact ${news.impactScore}) with chart analysis (${chart.recommendation.direction}, ${chart.recommendation.confidence}% confidence)...`,
    });

    const userMessage = `Cross-verify these two analyses for ${symbol}:

NEWS ANALYSIS:
- Headline: ${news.headline}
- Sentiment: ${news.sentiment}
- Impact Score: ${news.impactScore}/10
- Duration: ${news.expectedDuration}
- Reasoning: ${news.reasoning}

CHART ANALYSIS:
- Timeframe: ${chart.timeframe}
- Trend: ${chart.trendAssessment}
- Patterns: ${chart.patterns.join(', ') || 'None'}
- Direction: ${chart.recommendation.direction}
- Confidence: ${chart.recommendation.confidence}%
- Key Support: ${chart.keyLevels.support.join(', ') || 'N/A'}
- Key Resistance: ${chart.keyLevels.resistance.join(', ') || 'N/A'}
- Reasoning: ${chart.reasoning}

Do these analyses corroborate? Should a trade be taken?`;

    const response = await this.callClaude(SYSTEM_PROMPT, userMessage, { maxTokens: 1024 });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.setStatus('idle');
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed.confirmed && parsed.confidence >= 60) {
        const verifiedSignal = this.buildVerifiedSignal(
          symbol,
          parsed,
          news.id,
          chart.id,
          news.reasoning,
          chart.reasoning
        );

        await this.publishVerifiedSignal(verifiedSignal);
      }

      // Mark as verified to prevent duplicate verification
      await this.redis.setex(verifyKey, 7200, '1'); // 2 hour TTL
    } catch {
      this.log('warn', `Failed to parse cross-verification response for ${symbol}`);
    }

    this.setStatus('idle');
  }

  private async chartOnlyVerification(symbol: string, chart: ChartAnalysis): Promise<void> {
    const verifyKey = `agent:verified:chart-only:${chart.id}`;
    const alreadyVerified = await this.redis.get(verifyKey);
    if (alreadyVerified) return;

    this.publishReasoning({
      symbol,
      action: 'chart_only_verification',
      reasoning: `Chart-only verification: Very high confidence (${chart.recommendation.confidence}%) ${chart.recommendation.direction} signal on ${symbol}. Accepting without news corroboration.`,
      confidence: chart.recommendation.confidence,
    });

    const meta = chart.recommendation.metadata as Record<string, number>;
    const verifiedSignal = this.buildVerifiedSignal(
      symbol,
      {
        direction: chart.recommendation.direction,
        confidence: Math.min(chart.recommendation.confidence, 85), // cap for chart-only
        entryPrice: meta.entryPrice ?? 0,
        stopLoss: meta.stopLoss ?? 0,
        tp1: meta.tp1 ?? 0,
        tp2: meta.tp2 ?? 0,
        tp3: meta.tp3 ?? 0,
        riskRewardRatio: 2,
        riskPips: 0,
        rewardPips: 0,
        reasoning: `Chart-only signal: ${chart.reasoning}`,
      },
      null,
      chart.id,
      'No news corroboration — accepted due to high chart confidence.',
      chart.reasoning
    );

    await this.publishVerifiedSignal(verifiedSignal);
    await this.redis.setex(verifyKey, 7200, '1');
  }

  private async newsOnlyVerification(symbol: string, news: NewsEvent): Promise<void> {
    const verifyKey = `agent:verified:news-only:${news.id}`;
    const alreadyVerified = await this.redis.get(verifyKey);
    if (alreadyVerified) return;

    this.publishReasoning({
      symbol,
      action: 'news_only_verification',
      reasoning: `News-only verification: High-impact (${news.impactScore}/10) ${news.sentiment} news for ${symbol}. Accepting without chart corroboration.`,
      confidence: news.impactScore * 10,
    });

    const direction: SignalDirection = news.sentiment === 'BULLISH' ? 'LONG' : 'SHORT';

    const verifiedSignal = this.buildVerifiedSignal(
      symbol,
      {
        direction,
        confidence: Math.min(news.impactScore * 10, 75), // cap for news-only
        entryPrice: 0, // will need to be filled by the trader
        stopLoss: 0,
        tp1: 0,
        tp2: 0,
        tp3: 0,
        riskRewardRatio: 0,
        riskPips: 0,
        rewardPips: 0,
        reasoning: `News-only signal: ${news.reasoning}`,
      },
      news.id,
      null,
      news.reasoning,
      'No chart analysis — accepted due to high-impact news.'
    );

    await this.publishVerifiedSignal(verifiedSignal);
    await this.redis.setex(verifyKey, 7200, '1');
  }

  private buildVerifiedSignal(
    symbol: string,
    parsed: {
      direction: string;
      confidence: number;
      entryPrice: number;
      stopLoss: number;
      tp1: number;
      tp2: number;
      tp3: number;
      riskRewardRatio: number;
      riskPips: number;
      rewardPips: number;
      reasoning: string;
    },
    newsSignalId: string | null,
    chartSignalId: string | null,
    newsReasoning: string,
    chartReasoning: string
  ): VerifiedSignal {
    const now = Date.now();
    const exit: ExitPoint = {
      tp1: parsed.tp1,
      tp2: parsed.tp2,
      tp3: parsed.tp3,
      stopLoss: parsed.stopLoss,
      trailingActive: false,
    };

    const riskReward: RiskReward = {
      ratio: parsed.riskRewardRatio || 2,
      riskPips: parsed.riskPips || 0,
      rewardPips: parsed.rewardPips || 0,
    };

    return {
      id: randomUUID(),
      symbol,
      direction: parsed.direction as SignalDirection,
      confidence: parsed.confidence,
      newsSignalId,
      chartSignalId,
      entry: { price: parsed.entryPrice, timestamp: now },
      exit,
      riskReward,
      reasoning: parsed.reasoning,
      newsReasoning,
      chartReasoning,
      status: 'ACTIVE',
      verifiedAt: now,
      expiresAt: now + 4 * 60 * 60 * 1000, // 4 hours expiry
    };
  }

  private async publishVerifiedSignal(signal: VerifiedSignal): Promise<void> {
    // Publish to WebSocket channel
    this.publishToChannel(CacheKeys.verifiedSignalsChannel(), {
      type: 'VERIFIED_SIGNAL',
      data: signal,
    });

    // Store in DB
    await this.storeVerifiedSignal(signal);

    this.publishReasoning({
      symbol: signal.symbol,
      action: 'signal_verified',
      reasoning: `VERIFIED ${signal.direction} signal on ${signal.symbol} (${signal.confidence}% confidence): ${signal.reasoning}`,
      confidence: signal.confidence,
      data: {
        direction: signal.direction,
        entryPrice: signal.entry.price,
        stopLoss: signal.exit.stopLoss,
        tp1: signal.exit.tp1,
      },
    });

    this.signalsToday++;
    this.log('info', `Verified ${signal.direction} signal for ${signal.symbol} (${signal.confidence}%)`);
  }

  private async storeVerifiedSignal(signal: VerifiedSignal): Promise<void> {
    try {
      const pool = getDbPool();
      await pool.query(
        `INSERT INTO verified_signals (id, symbol, direction, confidence, news_signal_id, chart_signal_id, entry_price, stop_loss, tp1, tp2, tp3, reasoning, status, verified_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          signal.id,
          signal.symbol,
          signal.direction,
          signal.confidence,
          signal.newsSignalId,
          signal.chartSignalId,
          signal.entry.price,
          signal.exit.stopLoss,
          signal.exit.tp1,
          signal.exit.tp2,
          signal.exit.tp3,
          signal.reasoning,
          signal.status,
          new Date(signal.verifiedAt),
          new Date(signal.expiresAt),
        ]
      );
    } catch (err) {
      this.log('warn', `DB insert failed for verified signal: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
