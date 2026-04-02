'use client';

import dynamic from 'next/dynamic';
import TimeframeSelector from './TimeframeSelector';
import PairSelector from './PairSelector';
import { useChartStore } from '@/store/forex/chartStore';
import { useCandles } from '@/hooks/forex/useCandles';
import { useIndicators, useTechnicalSummary } from '@/hooks/forex/useIndicators';
import { useSignalStore } from '@/store/forex/signalStore';

// Dynamic import to avoid SSR issues with canvas
const CandlestickChart = dynamic(() => import('../charts/CandlestickChart'), { ssr: false });

export default function ChartSection() {
  const activePair      = useChartStore((s) => s.activePair);
  const activeTimeframe = useChartStore((s) => s.activeTimeframe);
  const settings        = useChartStore((s) => s.toggleSetting);
  const chartSettings   = useChartStore((s) => s.settings);
  const toggleSetting   = useChartStore((s) => s.toggleSetting);
  const activeSignals   = useSignalStore((s) => s.activeSignals);

  const { data: candles = [], isLoading } = useCandles(activePair, activeTimeframe);
  const indicators = useIndicators(candles);
  const summaryRows = useTechnicalSummary(candles, indicators);

  const pairSignals = activeSignals.filter((s) => s.symbol === activePair && s.timeframe === activeTimeframe);

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <PairSelector />
          <TimeframeSelector />
        </div>
        <div className="flex items-center gap-2 text-xs">
          {(['showEma50','showEma200','showBollingerBands','showSignalMarkers'] as const).map((key) => (
            <button
              key={key}
              onClick={() => toggleSetting(key)}
              className={`px-2 py-1 rounded border text-xs transition-colors ${
                chartSettings[key]
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                  : 'border-gray-700 text-gray-500 hover:text-gray-300'
              }`}
            >
              {{ showEma50: 'EMA 50', showEma200: 'EMA 200', showBollingerBands: 'BB', showSignalMarkers: 'Signals' }[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-[500px] text-gray-500">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading chart data...
            </div>
          </div>
        ) : candles.length === 0 ? (
          <div className="flex items-center justify-center h-[500px] text-gray-500">
            No data available. Check your API key.
          </div>
        ) : (
          <CandlestickChart
            candles={candles}
            indicators={indicators}
            signals={pairSignals}
            height={500}
          />
        )}
      </div>
    </div>
  );
}
