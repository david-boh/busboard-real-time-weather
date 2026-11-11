/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { fetchWeatherForecast } from '../shared/weather.js';
import { getAdvice } from '../api/bus.js';
import { 
  Bus, 
  CloudSun, 
  Rss, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface BusService {
  serviceNo: string;
  operator?: string;
  next1: number | null;
  next2: number | null;
  next3?: number | null;
  load1?: string;
  type1?: string;
}

interface BusData {
  busStopCode: string;
  services: BusService[];
  nextBus: {
    serviceNo: string;
    minutes: number;
  } | null;
  advice: 'Leave now' | 'Wait';
  readingTime: string;
}

interface WeatherData {
  area: string;
  forecast: string;
  validPeriod: {
    start: string;
    end: string;
    text: string;
  };
  updatedAt: string;
}

export default function App() {
  const [busData, setBusData] = useState<BusData | null>(null);
  const [busError, setBusError] = useState<{ source: string; status: number; message: string } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [copiedFeed, setCopiedFeed] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // Sample data used if LTA API key is not yet set in environment
  const demoBusData: BusData = {
    busStopCode: '04121',
    services: [
      { serviceNo: '2', operator: 'SBST', next1: 4, next2: 15 },
      { serviceNo: '12', operator: 'GAS', next1: 2, next2: 14 },
      { serviceNo: '33', operator: 'SBST', next1: 9, next2: 21 },
      { serviceNo: '54', operator: 'SBST', next1: 12, next2: 25 },
      { serviceNo: '147', operator: 'SBST', next1: 7, next2: 19 },
      { serviceNo: '190', operator: 'SMRT', next1: 5, next2: 16 }
    ],
    nextBus: {
      serviceNo: '12',
      minutes: 2
    },
    advice: 'Leave now',
    readingTime: new Date().toISOString()
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    // 1. Fetch live 2-hour weather forecast via serverless connection /api/weather
    try {
      const res = await fetch('/api/weather?area=City');
      if (res.ok) {
        const json = await res.json();
        setWeatherData({
          area: json.area,
          forecast: json.forecast,
          validPeriod: json.validPeriod,
          updatedAt: json.updateTimestamp || new Date().toISOString()
        });
        setWeatherError(null);
      } else {
        // Fallback to direct client call if serverless proxy has an issue
        const weatherRes = await fetchWeatherForecast('City');
        if (weatherRes.success && weatherRes.data) {
          setWeatherData(weatherRes.data as WeatherData);
          setWeatherError(null);
        } else {
          setWeatherError(`Failed to fetch weather: ${weatherRes.error || 'Unknown error'}`);
        }
      }
    } catch (err) {
      // Fallback
      try {
        const weatherRes = await fetchWeatherForecast('City');
        if (weatherRes.success && weatherRes.data) {
          setWeatherData(weatherRes.data as WeatherData);
          setWeatherError(null);
        } else {
          setWeatherError(err instanceof Error ? err.message : 'Network error');
        }
      } catch (clientErr) {
        setWeatherError(clientErr instanceof Error ? clientErr.message : 'Network error');
      }
    }

    // 2. Fetch bus data from backend API
    try {
      const res = await fetch('/api/bus?busStopCode=04121');
      if (res.ok) {
        const json = await res.json();
        setBusData(json);
        setBusError(null);
      } else {
        const errorJson = await res.json().catch(() => ({}));
        setBusError({
          source: errorJson.source || 'LTA',
          status: res.status,
          message: errorJson.message || 'LTA API key not configured or request failed'
        });
      }
    } catch {
      setBusError({
        source: 'LTA',
        status: 503,
        message: 'Unable to reach backend bus endpoint'
      });
    }

    const now = new Date();
    setLastRefreshed(now.toLocaleTimeString('en-SG', { timeZone: 'Asia/Singapore' }));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [loadData]);

  const activeBusData = (demoMode || !busData) && busError ? demoBusData : (busData || demoBusData);
  const advice = activeBusData ? getAdvice(activeBusData.nextBus?.minutes) : 'Wait';
  const isLeaveNow = advice === 'Leave now';

  const copyFeedUrl = () => {
    const feedUrl = `${window.location.origin}/api/feed`;
    navigator.clipboard.writeText(feedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <MapPin className="w-4 h-4" />
              <span>Singapore Bus Stop 04121</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Old Hill St Police Stn
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <a
              href="/api/weather?area=City"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-xs font-medium text-sky-300 transition-colors"
            >
              <CloudSun className="w-3.5 h-3.5" />
              <span>Weather API</span>
            </a>
            <a
              href="/api/feed"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-medium text-amber-300 transition-colors"
            >
              <Rss className="w-3.5 h-3.5" />
              <span>RSS Feed</span>
            </a>
          </div>
        </header>

        {/* Big Advice Banner */}
        <div
          className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 border shadow-2xl transition-all ${
            isLeaveNow
              ? 'bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-slate-950 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40'
              : 'bg-gradient-to-br from-amber-950/80 via-amber-900/40 to-slate-950 border-amber-500/50 text-amber-100 shadow-amber-950/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold opacity-80">
                Action Recommendation
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                {advice}
              </h2>
              <p className="text-sm mt-2 opacity-90 max-w-md">
                {activeBusData?.nextBus
                  ? `Next bus (${activeBusData.nextBus.serviceNo}) arrives in ${activeBusData.nextBus.minutes} min at stop 04121.`
                  : 'No upcoming buses scheduled right now.'}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="inline-block p-4 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-sm">
                <span className="block text-xs uppercase text-slate-400 font-semibold mb-1">
                  Next Departure
                </span>
                <span className="text-3xl font-extrabold text-white">
                  Bus {activeBusData?.nextBus?.serviceNo || '—'}
                </span>
                <span className="block text-sm font-semibold text-sky-400 mt-0.5">
                  {activeBusData?.nextBus?.minutes !== undefined
                    ? `in ${activeBusData.nextBus.minutes} min`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Weather & Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weather Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
                <CloudSun className="w-4 h-4" />
                <span>NEA 2-Hour Forecast</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Area: City
              </span>
            </div>

            {weatherData ? (
              <div>
                <p className="text-2xl font-bold text-white tracking-tight">
                  {weatherData.forecast}
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{weatherData.validPeriod.text}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-red-400">
                {weatherError || 'Loading weather forecast...'}
              </p>
            )}
          </div>

          {/* Reading Timestamp & System Info */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>Reading Timestamp</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                SGT (UTC+8)
              </span>
            </div>

            <div>
              <p className="text-lg font-bold text-white font-mono">
                {lastRefreshed ? `${lastRefreshed} SGT` : 'Reading now...'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Feed updates and aligns with quarter-hour intervals (:00, :15, :30, :45).
              </p>
            </div>
          </div>
        </div>

        {/* Bus Services Table */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Bus className="w-4 h-4 text-sky-400" />
              <span>Services at Stop 04121</span>
            </div>
            <span className="text-xs text-slate-400">
              Next 2 buses in minutes
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {activeBusData?.services && activeBusData.services.length > 0 ? (
              activeBusData.services.map((svc) => (
                <div
                  key={svc.serviceNo}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-center py-1 rounded bg-sky-500/10 border border-sky-500/30 font-bold text-sky-300 text-sm">
                      {svc.serviceNo}
                    </span>
                    {svc.operator && (
                      <span className="text-xs text-slate-400">{svc.operator}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-normal">Next:</span>
                      <span className={svc.next1 !== null && svc.next1 <= 5 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                        {svc.next1 !== null ? `${svc.next1} min` : '—'}
                      </span>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-normal">Then:</span>
                      <span className="text-slate-300">
                        {svc.next2 !== null ? `${svc.next2} min` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No bus services found.
              </div>
            )}
          </div>
        </div>

        {/* API Status Notice */}
        {busError && (
          <div className="rounded-xl p-4 bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-200">
                  LTA DataMall Status: HTTP {busError.status}
                </p>
                <p className="text-slate-400">
                  {busError.message}. Per requirements, <code className="text-amber-300">/api/feed</code> responds with HTTP 200 and title <code className="text-amber-300">&quot;Check failed: {busError.source} {busError.status}&quot;</code> so Zapier alerts your inbox.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Preview with sample stop 04121 timings:</span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium transition-colors"
              >
                {demoMode ? 'View Live Mode' : 'Toggle Sample Data'}
              </button>
            </div>
          </div>
        )}

        {/* Zapier / RSS Integration Card */}
        <div className="rounded-xl p-5 bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Rss className="w-4 h-4" />
              <span>Zapier RSS 2.0 Feed</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Ready
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Configure Zapier&apos;s &quot;RSS by Zapier&quot; trigger to watch this endpoint. The GUID updates strictly at :00, :15, :30, and :45 past the hour.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/feed`}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none"
            />
            <button
              onClick={copyFeedUrl}
              className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors shrink-0"
            >
              {copiedFeed ? 'Copied!' : 'Copy URL'}
            </button>
            <a
              href="/api/feed"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Open feed in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
