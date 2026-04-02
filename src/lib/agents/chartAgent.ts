/**
 * Chart Analysis Agent — analyzes chart patterns and technical indicators using Claude AI.
 * Subscribes to price updates, detects candle closes, runs the signal engine as a pre-filter,
 * then calls Claude for deeper pattern recognition.
 */
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { BaseAgent } from './baseAgent';
import { CacheKeys, getRedisClient } from '@/lib/forex/cache/redisClient';
import { computeIndicators } from '@/lib/forex/indicators';
import { runSignalEngine } from '@/lib/forex/signals/signalEngine';
import { getDbPool } from '@/lib/forex/db/client';
import { getMarketApiClient } from '@/lib/market/data/marketApiClient';
import { ALL_PAIRS, findPair } from '@/types/forex/pairs';
import type { OHLCVCandle, Timeframe } from '@/types/forex/ohlcv';
import type { IndicatorSet } from '@/types/forex/indicators';
import type { AgentSignal, ChartAnalysis } from '@/types/agents';

const ANALYSIS_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours fallback
const MONITORED_TIMEFRAMES: Timeframe[] = ['H1', 'H4'];

const SYSTEM_PROMPT = `You are an expert technical chart analyst for forex and cryptocurrency markets.
Analyze the provided chart data and technical indicators to identify patterns and trading opportunities.

Respond with a JSON object in this exact structure:
{
  "patterns": ["pattern1", "pattern2"],
  "trendAssessment": "strong uptrend" | "weak uptrend" | "consolidating" | "weak downtrend" | "strong downtrend",
  "supportLevels": [price1, price2],
  "resistanceLevels": [price1, price2],
  "direction": "LONG" | "SHORT" | "NEUTRAL",
  "confidence": 0-100,
  "entryPrice": number,
  "stopLoss": number,
  "tp1": number,
  "tp2": number,
  "tp3": number,
  "reasoning": "1-3 sentence explanation of your analysis"
}

Pattern examples to look for: head & shoulders, inverse head & shoulders, double top, double bottom,
ascending triangle, descending triangle, symmetrical triangle, bull flag, bear flag, rising wedge,
falling wedge, cup & handle, bullish engulfing, bearish engulfing, doji, hammer, shooting star,
morning star, evening star, three white soldiers, three black crows.

Guidelines:
- Only recommend LONG or SHORT if confidence >= 60
- Set direction to NEUTRAL if no clear setup exists
- Use ATR for stop loss distance (1.5x ATR from entry)
- Set TP1 at 1:1 R:R, TP2 at 1:2 R:R, TP3 at 1:3 R:R
- Consider multi-timeframe alignment when indicators are provided
- Factor in trend strength (ADX), momentum (RSI, MACD), and volatility (BB bandwidth)

Return ONLY the JSON object, no other text.`;

export class ChartAgent extends BaseAgent {
  private subscriber: Redis | null = null;
  private analysisTimer: ReturnType<typeof setInterval> | null = null;
  private lastAnalysis: Map<string, number> = new Map(); // symbol -> timestamp

  constructor() {
    super('ChartAgent', 'claude-haiku-4-5-20251001');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.setStatus('idle');
    this.startDailyReset();
    this.log('info', 'Chart Agent started');

    // Subscribe to price channels for candle close detection
    this.subscriber = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    this.subscriber.psubscribe('channel:prices:*');
    this.subscriber.on('pmessage', (_pattern, _channel, _message) => {
      // Price updates are handled via the periodic analysis loop
    });

    // Run periodic analysis for all pairs
    await this.runAnalysisCycle();
    this.analysisTimer = setInterval(() => this.runAnalysisCycle(), ANALYSIS_INTERVAL_MS);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.subscriber) {
      this.subscriber.disconnect();
      this.subscriber = null;
    }
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }
    this.stopDailyReset();
    this.setStatus('idle');
    this.log('info', 'Chart Agent stopped');
  }

  private async runAnalysisCycle(): Promise<void> {
    if (!this.isRunning) return;

    for (const pair of ALL_PAIRS) {
      if (!this.isRunning) break;

      for (const tf of MONITORED_TIMEFRAMES) {
        try {
          await this.analyzeSymbol(pair.symbol, tf);
        } catch (err) {
          this.log('warn', `Analysis failed for ${pair.symbol} ${tf}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Small delay between pairs to avoid rate limits
      await this.sleep(2000);
    }
  }

  private async analyzeSymbol(symbol: string, timeframe: Timeframe): Promise<void> {
    this.setStatus('processing');

    this.publishReasoning({
      symbol,
      action: 'fetching_data',
      reasoning: `Fetching ${timeframe} candle data for ${symbol}...`,
    });

    // Fetch candles
    const client = getMarketApiClient();
    const candles = await client.getCandles(symbol, timeframe, 200);

    if (candles.length < 50) {
      this.setStatus('idle');
      return;
    }

    // Run the fast signal engine first as a pre-filter
    const pairInfo = findPair(symbol);
    const forexPair = pairInfo ? {
      symbol: pairInfo.symbol,
      base: pairInfo.base,
      quote: pairInfo.quote,
      displayName: pairInfo.displayName,
      pipSize: pairInfo.pipSize,
      lotSize: pairInfo.lotSize,
    } : {
      symbol,
      base: symbol.split('/')[0],
      quote: symbol.split('/')[1],
      displayName: symbol,
      pipSize: 0.0001,
      lotSize: 100000,
    };

    const engineSignals = runSignalEngine(candles, forexPair, timeframe);
    const hasInterestingSignal = engineSignals.some((s) => s.confidence >= 50);

    // Check if enough time has passed since last analysis
    const lastTime = this.lastAnalysis.get(`${symbol}:${timeframe}`) ?? 0;
    const timeSinceLastAnalysis = Date.now() - lastTime;

    // Only call Claude if: signal engine found something interesting OR 4 hours have passed
    if (!hasInterestingSignal && timeSinceLastAnalysis < ANALYSIS_INTERVAL_MS) {
      this.setStatus('idle');
      return;
    }

    this.publishReasoning({
      symbol,
      action: 'analyzing_chart',
      reasoning: hasInterestingSignal
        ? `Signal engine detected potential setup. Running deep AI analysis on ${symbol} ${timeframe}...`
        : `Running scheduled AI analysis on ${symbol} ${timeframe}...`,
    });

    // Compute indicators
    const indicators = computeIndicators(candles);

    // Call Claude for deep analysis
    const analysis = await this.runClaudeAnalysis(symbol, timeframe, candles, indicators);

    if (analysis) {
      this.lastAnalysis.set(`${symbol}:${timeframe}`, Date.now());

      // Store in DB
      await this.storeChartAnalysis(analysis);

      // Publish to channel for cross-verification agent
      this.publishToChannel(CacheKeys.chartAnalysisChannel(), {
        type: 'CHART_ANALYSIS',
        data: analysis,
      });

      // Store in recent analyses per symbol
      const key = CacheKeys.recentChartAnalysis(symbol);
      await this.redis.lpush(key, JSON.stringify(analysis));
      await this.redis.ltrim(key, 0, 9); // keep last 10
      await this.redis.expire(key, 7200); // 2 hours TTL

      this.publishReasoning({
        symbol,
        action: 'pattern_detected',
        reasoning: `${analysis.trendAssessment} | Patterns: ${analysis.patterns.join(', ') || 'none'} | Direction: ${analysis.recommendation.direction} (${analysis.recommendation.confidence}% confidence)`,
        confidence: analysis.recommendation.confidence,
        data: {
          patterns: analysis.patterns,
          direction: analysis.recommendation.direction,
        },
      });

      this.signalsToday++;
    }

    this.setStatus('idle');
  }

  private async runClaudeAnalysis(
    symbol: string,
    timeframe: Timeframe,
    candles: OHLCVCandle[],
    indicators: IndicatorSet
  ): Promise<ChartAnalysis | null> {
    // Format last 50 candles as compact table
    const recentCandles = candles.slice(-50);
    const candleTable = recentCandles
      .map((c) => `${new Date(c.time * 1000).toISOString().slice(0, 16)} O:${c.open} H:${c.high} L:${c.low} C:${c.close} V:${c.volume}`)
      .join('\n');

    const indicatorSummary = `
EMA9: ${indicators.ema9?.toFixed(5) ?? 'N/A'}
EMA21: ${indicators.ema21?.toFixed(5) ?? 'N/A'}
EMA50: ${indicators.ema50?.toFixed(5) ?? 'N/A'}
EMA200: ${indicators.ema200?.toFixed(5) ?? 'N/A'}
MACD: ${indicators.macd ? `MACD=${indicators.macd.macd.toFixed(5)} Signal=${indicators.macd.signal.toFixed(5)} Hist=${indicators.macd.histogram.toFixed(5)}` : 'N/A'}
RSI(14): ${indicators.rsi ? `${indicators.rsi.value.toFixed(2)} (${indicators.rsi.overbought ? 'OVERBOUGHT' : indicators.rsi.oversold ? 'OVERSOLD' : 'NEUTRAL'})` : 'N/A'}
Bollinger Bands: ${indicators.bb ? `Upper=${indicators.bb.upper.toFixed(5)} Middle=${indicators.bb.middle.toFixed(5)} Lower=${indicators.bb.lower.toFixed(5)} BW=${indicators.bb.bandwidth.toFixed(4)}` : 'N/A'}
ATR(14): ${indicators.atr14?.toFixed(5) ?? 'N/A'}
Stochastic: ${indicators.stochastic ? `K=${indicators.stochastic.k.toFixed(2)} D=${indicators.stochastic.d.toFixed(2)}` : 'N/A'}
ADX: ${indicators.adx ? `ADX=${indicators.adx.adx.toFixed(2)} +DI=${indicators.adx.plusDI.toFixed(2)} -DI=${indicators.adx.minusDI.toFixed(2)} Trending=${indicators.adx.trending}` : 'N/A'}
Pivots: ${indicators.pivots ? `P=${indicators.pivots.pivot.toFixed(5)} R1=${indicators.pivots.r1.toFixed(5)} S1=${indicators.pivots.s1.toFixed(5)}` : 'N/A'}`;

    const userMessage = `Analyze this ${symbol} chart on the ${timeframe} timeframe.

Current Price: ${recentCandles.at(-1)?.close}

Last 50 candles:
${candleTable}

Technical Indicators:
${indicatorSummary}`;

    const response = await this.callClaude(SYSTEM_PROMPT, userMessage, { maxTokens: 1024 });

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      const recommendation: AgentSignal = {
        id: randomUUID(),
        source: 'chart',
        symbol,
        direction: parsed.direction ?? 'NEUTRAL',
        confidence: Math.min(100, Math.max(0, parsed.confidence ?? 0)),
        reasoning: parsed.reasoning ?? '',
        timestamp: Date.now(),
        metadata: {
          timeframe,
          entryPrice: parsed.entryPrice,
          stopLoss: parsed.stopLoss,
          tp1: parsed.tp1,
          tp2: parsed.tp2,
          tp3: parsed.tp3,
          patterns: parsed.patterns,
        },
      };

      const analysis: ChartAnalysis = {
        id: randomUUID(),
        symbol,
        timeframe,
        patterns: parsed.patterns ?? [],
        trendAssessment: parsed.trendAssessment ?? 'consolidating',
        keyLevels: {
          support: parsed.supportLevels ?? [],
          resistance: parsed.resistanceLevels ?? [],
        },
        recommendation,
        reasoning: parsed.reasoning ?? '',
        analyzedAt: Date.now(),
      };

      return analysis;
    } catch {
      this.log('warn', `Failed to parse Claude chart analysis for ${symbol}`);
      return null;
    }
  }

  private async storeChartAnalysis(analysis: ChartAnalysis): Promise<void> {
    try {
      const pool = getDbPool();
      await pool.query(
        `INSERT INTO chart_analyses (id, symbol, timeframe, patterns, trend_assessment, support_levels, resistance_levels, direction, confidence, reasoning, analyzed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          analysis.id,
          analysis.symbol,
          analysis.timeframe,
          analysis.patterns,
          analysis.trendAssessment,
          analysis.keyLevels.support,
          analysis.keyLevels.resistance,
          analysis.recommendation.direction,
          analysis.recommendation.confidence,
          analysis.reasoning,
          new Date(analysis.analyzedAt),
        ]
      );
    } catch (err) {
      this.log('warn', `DB insert failed for chart analysis: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
