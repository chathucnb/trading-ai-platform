'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type CandlestickData,
  type Time,
  type LineData,
  type SeriesMarker,
} from 'lightweight-charts';
import type { OHLCVCandle } from '@/types/forex/ohlcv';
import type { IndicatorSet } from '@/types/forex/indicators';
import type { TradeSignal } from '@/types/forex/signals';
import { useChartStore } from '@/store/forex/chartStore';

interface Props {
  candles: OHLCVCandle[];
  indicators: IndicatorSet;
  signals: TradeSignal[];
  height?: number;
}

function toChartCandle(c: OHLCVCandle): CandlestickData {
  return { time: c.time as Time, open: c.open, high: c.high, low: c.low, close: c.close };
}

function toLineData(candles: OHLCVCandle[], values: (number | null)[]): LineData[] {
  const result: LineData[] = [];
  const offset = candles.length - values.length;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v != null) {
      result.push({ time: candles[offset + i].time as Time, value: v });
    }
  }
  return result;
}

export default function CandlestickChart({ candles, indicators, signals, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const seriesMap = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const settings = useChartStore((s) => s.settings);

  const initChart = useCallback(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#0f1117' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#374151' },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;
    chartRef.current = chart;

    // Resize observer
    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current?.clientWidth ?? 800 });
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; candleSeriesRef.current = null; markersPluginRef.current = null; seriesMap.current.clear(); };
  }, [height]);

  // Init chart
  useEffect(() => {
    const cleanup = initChart();
    return cleanup;
  }, [initChart]);

  // Update candle data
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;
    candleSeriesRef.current.setData(candles.map(toChartCandle));
  }, [candles]);

  // Update indicator overlays
  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;
    const chart = chartRef.current;

    const overlays: Array<{
      key: string;
      values: (number | null)[];
      color: string;
      width?: 1 | 2 | 3 | 4;
      visible: boolean;
    }> = [
      { key: 'ema9',   values: Array(candles.length - 1).fill(null).concat([indicators.ema9]),   color: '#f59e0b', width: 1, visible: settings.showEma9 },
      { key: 'ema21',  values: Array(candles.length - 1).fill(null).concat([indicators.ema21]),  color: '#3b82f6', width: 1, visible: settings.showEma21 },
      { key: 'ema50',  values: Array(candles.length - 1).fill(null).concat([indicators.ema50]),  color: '#8b5cf6', width: 2, visible: settings.showEma50 },
      { key: 'ema200', values: Array(candles.length - 1).fill(null).concat([indicators.ema200]), color: '#ec4899', width: 2, visible: settings.showEma200 },
    ];

    if (indicators.bb && settings.showBollingerBands) {
      const bb = indicators.bb;
      const bbPad = Array(candles.length - 1).fill(null);
      overlays.push(
        { key: 'bb_upper',  values: [...bbPad, bb.upper],  color: '#6b7280', width: 1, visible: true },
        { key: 'bb_middle', values: [...bbPad, bb.middle], color: '#9ca3af', width: 1, visible: true },
        { key: 'bb_lower',  values: [...bbPad, bb.lower],  color: '#6b7280', width: 1, visible: true }
      );
    }

    for (const overlay of overlays) {
      if (!overlay.visible) {
        const existing = seriesMap.current.get(overlay.key);
        if (existing) { chart.removeSeries(existing); seriesMap.current.delete(overlay.key); }
        continue;
      }
      let series = seriesMap.current.get(overlay.key);
      if (!series) {
        series = chart.addSeries(LineSeries, {
          color: overlay.color,
          lineWidth: overlay.width ?? 1,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        });
        seriesMap.current.set(overlay.key, series);
      }
      const data = toLineData(candles, overlay.values);
      if (data.length > 0) series.setData(data);
    }

    // Signal markers on the candle series (v5 uses createSeriesMarkers plugin)
    if (settings.showSignalMarkers && candleSeriesRef.current) {
      const markers: SeriesMarker<Time>[] = signals
        .filter((s) => s.status === 'ACTIVE')
        .map((s) => ({
          time: Math.floor(s.entry.timestamp / 1000) as Time,
          position: s.direction === 'LONG' ? ('belowBar' as const) : ('aboveBar' as const),
          color: s.direction === 'LONG' ? '#22c55e' : '#ef4444',
          shape: s.direction === 'LONG' ? ('arrowUp' as const) : ('arrowDown' as const),
          text: `${s.direction} ${s.confidence}%`,
        }));

      if (!markersPluginRef.current) {
        markersPluginRef.current = createSeriesMarkers(candleSeriesRef.current, markers);
      } else {
        markersPluginRef.current.setMarkers(markers);
      }
    }
  }, [candles, indicators, signals, settings]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height }}
    />
  );
}
