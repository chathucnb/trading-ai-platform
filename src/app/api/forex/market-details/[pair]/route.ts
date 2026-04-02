import { NextRequest, NextResponse } from 'next/server';
import { getForexApiClient } from '@/lib/forex/data/forexApiClient';
import { calcATR } from '@/lib/forex/indicators';
import { getSessionStatus } from '@/lib/forex/utils/sessionDetector';
import { calcPipValue } from '@/lib/forex/utils/pipCalculator';
import { MAJOR_PAIRS } from '@/types/forex/pairs';
import type { MarketDetails } from '@/types/forex/pairs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pair: string }> }
) {
  const { pair: rawPair } = await params;
  const symbol = decodeURIComponent(rawPair);
  const pairDef = MAJOR_PAIRS.find((p) => p.symbol === symbol);
  if (!pairDef) {
    return NextResponse.json({ error: 'Unknown pair' }, { status: 404 });
  }

  try {
    const client = getForexApiClient();
    const [price, candles] = await Promise.all([
      client.getLivePrice(symbol),
      client.getCandles(symbol, 'H1', 20),
    ]);

    const atr = calcATR(candles) ?? 0;
    const atrPips = Math.round(atr / pairDef.pipSize * 10) / 10;
    const volatility = atrPips < 20 ? 'LOW' : atrPips < 50 ? 'MEDIUM' : 'HIGH';
    const pipValue = calcPipValue(pairDef);

    const details: MarketDetails = {
      symbol,
      spread: price?.spread ?? 2,
      pipValue,
      atr14: Math.round(atr * 100000) / 100000,
      atr14Pips: atrPips,
      volatilityLabel: volatility as MarketDetails['volatilityLabel'],
      swapLong: -3.5,   // placeholder (would come from broker API)
      swapShort: 1.2,
      sessionStatus: getSessionStatus(),
    };

    return NextResponse.json(details, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch (err) {
    console.error('[API/market-details]', err);
    return NextResponse.json({ error: 'Failed to fetch market details' }, { status: 500 });
  }
}
