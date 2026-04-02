'use client';

import { useSettingsStore } from '@/store/forex/settingsStore';
import { MAJOR_PAIRS } from '@/types/forex/pairs';
import { TIMEFRAME_LABELS, type Timeframe } from '@/types/forex/ohlcv';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Signal Settings */}
        <section className="bg-gray-900 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Signal Filters</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Minimum Confidence: <span className="text-white font-bold">{settings.minConfidence}%</span>
            </label>
            <input
              type="range" min="0" max="100" step="5"
              value={settings.minConfidence}
              onChange={(e) => updateSettings({ minConfidence: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0% (All)</span><span>100% (Perfect only)</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm text-gray-300">Browser notifications for high-confidence signals</span>
            </label>
          </div>
        </section>

        {/* Default Chart Settings */}
        <section className="bg-gray-900 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Default Chart</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Default Pair</label>
            <select
              value={settings.defaultPair}
              onChange={(e) => updateSettings({ defaultPair: e.target.value })}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 w-full"
            >
              {MAJOR_PAIRS.map((p) => (
                <option key={p.symbol} value={p.symbol}>{p.symbol} — {p.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Default Timeframe</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TIMEFRAME_LABELS) as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => updateSettings({ defaultTimeframe: tf })}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    settings.defaultTimeframe === tf
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {TIMEFRAME_LABELS[tf]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* API Configuration */}
        <section className="bg-gray-900 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">API Configuration</h2>
          <div className="text-sm text-gray-400 space-y-2">
            <p>Configure API keys in your <code className="bg-gray-800 px-1.5 py-0.5 rounded text-blue-400">.env.local</code> file:</p>
            <pre className="bg-gray-800 rounded-lg p-3 text-xs text-green-400 overflow-x-auto">
{`TWELVE_DATA_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://forex_user:forex_password@localhost:5432/forex_db`}
            </pre>
            <p className="text-xs text-gray-500">
              Free tiers: Twelve Data (800 credits/day) · Finnhub (60 calls/min)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
