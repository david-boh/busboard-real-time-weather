/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { fetchWeatherForecast } from '../shared/weather.js';
import { getAdvice } from '../api/bus.js';
import { 
  KNOWN_BUS_STOPS, 
  getBusStopInfo, 
  searchBusStops,
  formatLoad, 
  formatType 
} from '../shared/busStops.js';
import { 
  Bus, 
  CloudSun, 
  Rss, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  MapPin,
  ArrowRight,
  Search,
  Users,
  Layers,
  Info,
  Check,
  X
} from 'lucide-react';

interface BusService {
  serviceNo: string;
  operator?: string;
  next1: number | null;
  next2: number | null;
  next3?: number | null;
  load1?: string;
  type1?: string;
  feature1?: string;
  load2?: string;
  type2?: string;
  feature2?: string;
  load3?: string;
  type3?: string;
  feature3?: string;
}

interface BusData {
  busStopCode: string;
  services: BusService[];
  nextBus: {
    serviceNo: string;
    minutes: number;
    load?: string;
    type?: string;
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
  const [currentStopCode, setCurrentStopCode] = useState<string>('04121');
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [busData, setBusData] = useState<BusData | null>(null);
  const [busError, setBusError] = useState<{ source: string; status: number; message: string } | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [copiedFeed, setCopiedFeed] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  const [remoteRecommendations, setRemoteRecommendations] = useState<Array<{ code: string; name: string; road: string; description?: string }>>([]);
  const [isSearchingStops, setIsSearchingStops] = useState<boolean>(false);
  const [selectedStopDetails, setSelectedStopDetails] = useState<{ code: string; name: string; road: string; description?: string } | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live bus stops recommendations from /api/stops
  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      setIsSearchingStops(true);
      try {
        const res = await fetch(`/api/stops?q=${encodeURIComponent(searchInput)}&limit=10`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && Array.isArray(json.stops) && json.stops.length > 0) {
            setRemoteRecommendations(json.stops);
          }
        }
      } catch {
        // Fallback to local
      } finally {
        if (isMounted) setIsSearchingStops(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchInput]);

  // Autocomplete suggestions list (combining remote results and local fallback)
  const recommendations = useMemo(() => {
    if (remoteRecommendations.length > 0) {
      return remoteRecommendations;
    }
    return searchBusStops(searchInput, 8);
  }, [remoteRecommendations, searchInput]);

  // Fetch stop metadata if custom code selected
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/stops?code=${encodeURIComponent(currentStopCode)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (isMounted && data && data.name) {
          setSelectedStopDetails(data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [currentStopCode]);

  // Fallback demo data for 04121 (SMU - Stamford Rd) or other stops
  const demoBusData: BusData = useMemo(() => {
    const isSMU = currentStopCode === '04121';
    if (isSMU) {
      return {
        busStopCode: '04121',
        services: [
          { serviceNo: '7', operator: 'SBST', next1: 3, next2: 14, next3: 26, load1: 'SEA', type1: 'DD', feature1: 'WAB', load2: 'SDA', type2: 'DD', feature2: 'WAB' },
          { serviceNo: '14', operator: 'SBST', next1: 6, next2: 17, next3: 29, load1: 'SDA', type1: 'DD', feature1: 'WAB', load2: 'SEA', type2: 'DD', feature2: 'WAB' },
          { serviceNo: '16', operator: 'SBST', next1: 8, next2: 20, next3: 31, load1: 'SEA', type1: 'SD', feature1: 'WAB', load2: 'SEA', type2: 'SD', feature2: 'WAB' },
          { serviceNo: '36', operator: 'GAS', next1: 11, next2: 24, next3: 35, load1: 'SEA', type1: 'SD', feature1: 'WAB', load2: 'SEA', type2: 'SD', feature2: 'WAB' },
          { serviceNo: '77', operator: 'Tower Transit', next1: 5, next2: 18, next3: 28, load1: 'SDA', type1: 'SD', feature1: 'WAB', load2: 'SEA', type2: 'SD', feature2: 'WAB' },
          { serviceNo: '106', operator: 'Tower Transit', next1: 2, next2: 12, next3: 22, load1: 'SEA', type1: 'DD', feature1: 'WAB', load2: 'SEA', type2: 'DD', feature2: 'WAB' },
          { serviceNo: '147', operator: 'SBST', next1: 4, next2: 15, next3: 25, load1: 'SEA', type1: 'DD', feature1: 'WAB', load2: 'SDA', type2: 'DD', feature2: 'WAB' },
          { serviceNo: '166', operator: 'SBST', next1: 9, next2: 22, next3: 34, load1: 'SEA', type1: 'DD', feature1: 'WAB', load2: 'SEA', type2: 'DD', feature2: 'WAB' },
          { serviceNo: '174', operator: 'SBST', next1: 7, next2: 19, next3: 30, load1: 'LSD', type1: 'DD', feature1: 'WAB', load2: 'SEA', type2: 'DD', feature2: 'WAB' },
          { serviceNo: '190', operator: 'SMRT', next1: 1, next2: 9, next3: 18, load1: 'SEA', type1: 'BD', feature1: 'WAB', load2: 'SDA', type2: 'DD', feature2: 'WAB' }
        ],
        nextBus: {
          serviceNo: '190',
          minutes: 1,
          load: 'SEA',
          type: 'BD'
        },
        advice: 'Leave now',
        readingTime: new Date().toISOString()
      };
    }

    return {
      busStopCode: currentStopCode,
      services: [
        { serviceNo: '2', operator: 'SBST', next1: 4, next2: 15, load1: 'SEA', type1: 'DD', feature1: 'WAB', load2: 'SDA', type2: 'SD' },
        { serviceNo: '12', operator: 'GAS', next1: 2, next2: 14, load1: 'SEA', type1: 'DD', feature1: 'WAB', load2: 'SEA', type2: 'DD' },
        { serviceNo: '33', operator: 'SBST', next1: 9, next2: 21, load1: 'SDA', type1: 'SD', feature1: 'WAB', load2: 'SEA', type2: 'SD' },
        { serviceNo: '54', operator: 'SBST', next1: 12, next2: 25, load1: 'SEA', type1: 'SD', feature1: 'WAB', load2: 'SEA', type2: 'SD' },
        { serviceNo: '147', operator: 'SBST', next1: 7, next2: 19, load1: 'LSD', type1: 'DD', feature1: 'WAB', load2: 'SEA', type2: 'DD' }
      ],
      nextBus: {
        serviceNo: '12',
        minutes: 2,
        load: 'SEA',
        type: 'DD'
      },
      advice: 'Leave now',
      readingTime: new Date().toISOString()
    };
  }, [currentStopCode]);

  const loadData = useCallback(async (stopCode: string) => {
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
        const weatherRes = await fetchWeatherForecast('City');
        if (weatherRes.success && weatherRes.data) {
          setWeatherData(weatherRes.data as WeatherData);
          setWeatherError(null);
        } else {
          setWeatherError(`Failed to fetch weather: ${weatherRes.error || 'Unknown error'}`);
        }
      }
    } catch (err) {
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

    // 2. Fetch bus data from backend API for selected stop
    try {
      const res = await fetch(`/api/bus?busStopCode=${encodeURIComponent(stopCode)}`);
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
    loadData(currentStopCode);
    const interval = setInterval(() => loadData(currentStopCode), 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, [loadData, currentStopCode]);

  const activeBusData = (demoMode || !busData) && busError ? demoBusData : (busData || demoBusData);
  const advice = activeBusData ? getAdvice(activeBusData.nextBus?.minutes) : 'Wait';
  const isLeaveNow = advice === 'Leave now';

  const stopInfo = useMemo(() => {
    if (selectedStopDetails && selectedStopDetails.code === currentStopCode) {
      return selectedStopDetails;
    }
    return getBusStopInfo(currentStopCode);
  }, [selectedStopDetails, currentStopCode]);

  const selectStop = (code: string, details?: { code: string; name: string; road: string; description?: string }) => {
    const formatted = String(code).trim().padStart(5, '0');
    if (details) {
      setSelectedStopDetails(details);
    }
    setCurrentStopCode(formatted);
    setSearchInput('');
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;

    if (recommendations.length > 0) {
      selectStop(recommendations[0].code);
    } else {
      selectStop(clean);
    }
  };

  const copyFeedUrl = () => {
    const feedUrl = `${window.location.origin}/api/feed`;
    navigator.clipboard.writeText(feedUrl);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Top Header - Bus Stop Number & Name on top left */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold tracking-wider uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Singapore Bus Arrival Board</span>
            </div>
            
            {/* Bus Stop Number as well as Name prominently together */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-mono font-black text-xl sm:text-2xl border border-sky-500/40 tracking-wider shadow-sm">
                {currentStopCode}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {stopInfo.name}
              </h1>
            </div>

            <p className="text-xs text-slate-400">
              {stopInfo.road} {stopInfo.description ? `• ${stopInfo.description}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => loadData(currentStopCode)}
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

        {/* Verified Location Notice for 04121 */}
        {currentStopCode === '04121' && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-950/40 border border-sky-800/50 text-xs text-sky-200">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Location Verified: </span>
              Bus Stop <code className="bg-sky-900/50 px-1 py-0.5 rounded text-sky-300 font-mono">04121</code> is officially <strong>SMU (Singapore Management University)</strong> along <strong>Stamford Road</strong> (near Dhoby Ghaut / Bras Basah), not Old Hill Street. Passing buses include <strong>7, 14, 16, 36, 77, 106, 147, 166, 174, 190</strong>.
            </div>
          </div>
        )}

        {/* Bus Stop Search Box with Autocomplete & Recommendations */}
        <div ref={searchContainerRef} className="relative z-30">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search bus stop number or name (e.g. 04121, SMU, Dhoby Ghaut, Clarke Quay)..."
              className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all shadow-lg"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-20 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
            >
              Select
            </button>
          </form>

          {/* Autocomplete / Recommendations Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
              <div className="px-4 py-2 bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{searchInput ? 'Suggested Matching Stops' : 'Popular & Recommended Stops'}</span>
                <span>{isSearchingStops ? 'Searching...' : 'Select to View'}</span>
              </div>

              {recommendations.length > 0 ? (
                recommendations.map((stop) => {
                  const isSelected = currentStopCode === stop.code;
                  return (
                    <button
                      key={stop.code}
                      type="button"
                      onClick={() => selectStop(stop.code, stop)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors ${
                        isSelected ? 'bg-sky-500/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-center py-1 rounded bg-slate-950 font-mono font-bold text-sky-400 text-xs border border-slate-800">
                          {stop.code}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                            {stop.name}
                            {stop.code === '04121' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-normal">
                                Default Feed
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            {stop.road} {stop.description ? `• ${stop.description}` : ''}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center">
                  <p className="text-xs text-slate-400">
                    No predefined stops match &quot;{searchInput}&quot;.
                  </p>
                  {/^\d+$/.test(searchInput.trim()) && (
                    <button
                      type="button"
                      onClick={() => selectStop(searchInput.trim())}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
                    >
                      <span>Load Bus Stop {searchInput.trim().padStart(5, '0')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

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
                Action Recommendation • Stop {currentStopCode}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mt-1">
                {advice}
              </h2>
              <p className="text-sm mt-2 opacity-90 max-w-md">
                {activeBusData?.nextBus
                  ? `Next bus (${activeBusData.nextBus.serviceNo}) arrives in ${activeBusData.nextBus.minutes} min at ${stopInfo.name}.`
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

                {/* Next bus Deck & Seat info */}
                {activeBusData?.nextBus && (
                  <div className="flex items-center gap-1.5 mt-2 justify-end">
                    {activeBusData.nextBus.type && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {formatType(activeBusData.nextBus.type).short}
                      </span>
                    )}
                    {activeBusData.nextBus.load && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${formatLoad(activeBusData.nextBus.load).badgeClass}`}>
                        {formatLoad(activeBusData.nextBus.load).label}
                      </span>
                    )}
                  </div>
                )}
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
                Feed aligns with quarter-hour intervals (:00, :15, :30, :45).
              </p>
            </div>
          </div>
        </div>

        {/* Legend for Seat Availability & Bus Types */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-300">Seats:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px]">
              Seats Avail
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px]">
              Standing
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px]">
              Crowded
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-300">Decks:</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
              1-Deck
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
              Double Deck
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
              Bendy
            </span>
          </div>
        </div>

        {/* Bus Services Table with Seat Availability & Deck Information */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Bus className="w-4 h-4 text-sky-400" />
              <span>Services at {stopInfo.name} ({currentStopCode})</span>
            </div>
            <span className="text-xs text-slate-400">
              Timings, Decks &amp; Seat Availability
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {activeBusData?.services && activeBusData.services.length > 0 ? (
              activeBusData.services.map((svc) => (
                <div
                  key={svc.serviceNo}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-14 text-center py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 font-bold text-sky-300 text-base">
                      {svc.serviceNo}
                    </span>
                    <div>
                      {svc.operator && (
                        <span className="text-xs text-slate-400 block">{svc.operator}</span>
                      )}
                      <span className="text-[11px] text-slate-500 block">
                        {svc.feature1 === 'WAB' ? 'Wheelchair Accessible' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Arrival Cards for Next 1 and Next 2 */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    {/* Next 1 */}
                    <div className="flex flex-col items-start p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 min-w-[120px]">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">Next:</span>
                        <span className={svc.next1 !== null && svc.next1 <= 5 ? 'text-emerald-400 font-bold text-sm' : 'text-white font-semibold text-sm'}>
                          {svc.next1 !== null ? `${svc.next1} min` : '—'}
                        </span>
                      </div>
                      {svc.next1 !== null && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {formatType(svc.type1).short}
                          </span>
                          <span className={`text-[10px] px-1 py-0.5 rounded border ${formatLoad(svc.load1).badgeClass}`}>
                            {formatLoad(svc.load1).label}
                          </span>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block shrink-0" />

                    {/* Next 2 */}
                    <div className="flex flex-col items-start p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 min-w-[120px]">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">Then:</span>
                        <span className="text-slate-200 font-semibold text-sm">
                          {svc.next2 !== null ? `${svc.next2} min` : '—'}
                        </span>
                      </div>
                      {svc.next2 !== null && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {formatType(svc.type2).short}
                          </span>
                          <span className={`text-[10px] px-1 py-0.5 rounded border ${formatLoad(svc.load2).badgeClass}`}>
                            {formatLoad(svc.load2).label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No bus services found for stop {currentStopCode}.
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
              <span className="text-slate-400">Preview with sample {stopInfo.name} timings &amp; seat info:</span>
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
              <span>Zapier RSS 2.0 Feed (Stop 04121 - SMU)</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Ready
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Configure Zapier&apos;s &quot;RSS by Zapier&quot; trigger to watch this endpoint. The feed monitors default bus stop <strong>04121 (SMU)</strong> and the GUID updates strictly at :00, :15, :30, and :45 past the hour.
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
