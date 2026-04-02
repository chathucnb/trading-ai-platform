import type { ReactNode } from 'react';
import ForexNavbar from '@/components/forex/layout/ForexNavbar';
import PriceTickerBar from '@/components/forex/dashboard/PriceTickerBar';
import QueryProvider from '@/components/forex/layout/QueryProvider';

export const metadata = {
  title: 'ForexAI — Real-Time Trading Analysis',
  description: 'Real-time forex charts, technical analysis, and AI-powered entry/exit signals.',
};

export default function ForexLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <ForexNavbar />
        <PriceTickerBar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </QueryProvider>
  );
}
