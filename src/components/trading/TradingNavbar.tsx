'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useForexWebSocket, type WsStatus } from '@/hooks/forex/useForexWebSocket';
import { ALL_PAIRS } from '@/types/forex/pairs';

const statusColors: Record<WsStatus, string> = {
  connected: 'bg-green-400',
  connecting: 'bg-yellow-400 animate-pulse',
  disconnected: 'bg-red-400',
};

export default function TradingNavbar() {
  const pathname = usePathname();
  const pairSymbols = ALL_PAIRS.map((p) => p.symbol);
  const wsStatus = useForexWebSocket(pairSymbols);

  const links = [
    { href: '/trading/dashboard', label: 'Dashboard' },
    { href: '/trading/agents', label: 'Agents' },
    { href: '/trading/news', label: 'News' },
    { href: '/trading/signals', label: 'Signals' },
    { href: '/trading/pricing', label: 'Pricing' },
  ];

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-6">
        <Link href="/trading" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">TradingAI</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded font-medium">PRO</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname?.startsWith(link.href)
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[wsStatus]}`} />
          <span className="text-xs text-gray-400 capitalize">{wsStatus}</span>
        </div>
      </div>
    </nav>
  );
}
