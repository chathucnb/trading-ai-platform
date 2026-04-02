/**
 * Signal Processing Worker
 * Listens to Redis candle-close events and runs the signal engine.
 */
import { getRedisSubscriber, getRedisPublisher, getRedisClient, CacheKeys } from '../src/lib/forex/cache/redisClient';
import { runSignalEngine } from '../src/lib/forex/signals/signalEngine';
import { insertSignal } from '../src/lib/forex/db/queries/signals';
import { MAJOR_PAIRS } from '../src/types/forex/pairs';
import type { OHLCVCandle, Timeframe } from '../src/types/forex/ohlcv';
import type { CandleUpdateMessage } from '../src/types/forex/websocket';
import type { SignalMessage } from '../src/types/forex/websocket';

export function startSignalProcessingWorker(): void {
  const sub = getRedisSubscriber();
  const pub = getRedisPublisher();
  const redis = getRedisClient();

  sub.psubscribe('channel:prices:*');
  console.log('[SignalEngine] Worker started, listening for candle updates');

  sub.on('pmessage', async (_pattern, channel, rawMsg) => {
    try {
      const msg = JSON.parse(rawMsg) as CandleUpdateMessage;
      if (msg.type !== 'CANDLE_UPDATE' || !msg.isClosed) return;

      const { symbol, timeframe } = msg;
      const pair = MAJOR_PAIRS.find((p) => p.symbol === symbol);
      if (!pair) return;

      // Fetch cached candles
      const cacheKey = CacheKeys.candles(symbol, timeframe);
      const cached = await redis.lrange(cacheKey, 0, 499);
      if (cached.length < 50) return;

      const candles: OHLCVCandle[] = cached
        .map((c) => JSON.parse(c) as OHLCVCandle)
        .reverse(); // oldest first

      const signals = runSignalEngine(candles, pair, timeframe as Timeframe);

      for (const signal of signals) {
        // Persist to DB
        await insertSignal(signal).catch((e) =>
          console.error('[SignalEngine] DB insert failed', e)
        );

        // Broadcast to WebSocket clients
        const msg: SignalMessage = { type: 'SIGNAL_NEW', data: signal };
        await pub.publish(`channel:signals:${symbol}`, JSON.stringify(msg));

        console.log(
          `[SignalEngine] New ${signal.direction} signal on ${symbol} ${timeframe} — confidence: ${signal.confidence}`
        );
      }
    } catch (err) {
      console.error('[SignalEngine] Error processing message:', err);
    }
  });
}
