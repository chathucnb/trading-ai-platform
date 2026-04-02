/**
 * SSE fallback for environments where WebSocket is blocked.
 * Streams price updates via Server-Sent Events.
 */
import { NextRequest } from 'next/server';
import { getRedisSubscriber, CacheKeys } from '@/lib/forex/cache/redisClient';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') ?? 'EUR/USD';
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sub = getRedisSubscriber();
      const channel = CacheKeys.priceChannel(symbol);

      const onMessage = (_ch: string, msg: string) => {
        controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
      };

      sub.subscribe(channel);
      sub.on('message', onMessage);

      // Keepalive every 25s
      const keepalive = setInterval(() => {
        controller.enqueue(encoder.encode(`: keepalive\n\n`));
      }, 25_000);

      req.signal.addEventListener('abort', () => {
        clearInterval(keepalive);
        sub.unsubscribe(channel);
        sub.off('message', onMessage);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
