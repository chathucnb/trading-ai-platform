import type { ReactNode } from 'react';
import TradingNavbar from '@/components/trading/TradingNavbar';
import PriceTickerBar from '@/components/forex/dashboard/PriceTickerBar';
import QueryProvider from '@/components/forex/layout/QueryProvider';

export const metadata = {
  title: 'TradingAI — Multi-Agent Trading Advisory',
  description: 'AI-powered forex & crypto trading signals with real-time news analysis and cross-verification.',
};

export default function TradingLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <TradingNavbar />
        <PriceTickerBar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </QueryProvider>
  );
}
