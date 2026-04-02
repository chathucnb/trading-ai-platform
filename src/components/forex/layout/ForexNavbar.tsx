'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useForexWebSocket, type WsStatus } from '@/hooks/forex/useForexWebSocket';
import { MAJOR_PAIRS } from '@/types/forex/pairs';

const statusColors: Record<WsStatus, string> = {
  connected:    'bg-green-400',
  connecting:   'bg-yellow-400 animate-pulse',
  disconnected: 'bg-red-400',
};

export default function ForexNavbar() {
  const pathname = usePathname();
  const pairSymbols = MAJOR_PAIRS.map((p) => p.symbol);
  const wsStatus = useForexWebSocket(pairSymbols);

  const links = [
    { href: '/forex/dashboard', label: 'Dashboard' },
    { href: '/forex/signals',   label: 'Signals' },
    { href: '/forex/settings',  label: 'Settings' },
  ];

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-6">
        <Link href="/forex" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm">ForexAI</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname === link.href
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[wsStatus]}`} />
        <span className="text-xs text-gray-400 capitalize">{wsStatus}</span>
      </div>
    </nav>
  );
}
