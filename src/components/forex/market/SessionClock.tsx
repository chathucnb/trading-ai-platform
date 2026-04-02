'use client';

import { useEffect, useState } from 'react';
import { getSessionStatus, getSessionLabel } from '@/lib/forex/utils/sessionDetector';

export default function SessionClock() {
  const [status, setStatus] = useState(getSessionStatus());
  const [label, setLabel] = useState(getSessionLabel());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSessionStatus());
      setLabel(getSessionLabel());
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  const sessions = [
    { name: 'Sydney',   active: status.sydney },
    { name: 'Tokyo',    active: status.tokyo },
    { name: 'London',   active: status.london },
    { name: 'New York', active: status.newYork },
  ];

  return (
    <div className="bg-gray-900 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${label === 'Off Market' ? 'bg-gray-500' : 'bg-green-400 animate-pulse'}`} />
        <span className="text-xs font-semibold text-gray-300">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sessions.map((s) => (
          <span
            key={s.name}
            className={`text-xs px-2 py-0.5 rounded-full ${
              s.active
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-800 text-gray-500'
            }`}
          >
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
