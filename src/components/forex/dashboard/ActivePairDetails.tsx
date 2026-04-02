'use client';

import { useChartStore } from '@/store/forex/chartStore';
import { useCandles } from '@/hooks/forex/useCandles';
import { useIndicators, useTechnicalSummary } from '@/hooks/forex/useIndicators';
import TechnicalSummary from '@/components/forex/market/TechnicalSummary';
import MarketDetailsPanel from '@/components/forex/market/MarketDetailsPanel';

export default function ActivePairDetails() {
  const activePair      = useChartStore((s) => s.activePair);
  const activeTimeframe = useChartStore((s) => s.activeTimeframe);
  const { data: candles = [] } = useCandles(activePair, activeTimeframe);
  const indicators = useIndicators(candles);
  const rows = useTechnicalSummary(candles, indicators);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Technical Summary</h3>
        <TechnicalSummary rows={rows} />
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Market Details</h3>
        <MarketDetailsPanel symbol={activePair} />
      </div>
    </div>
  );
}
