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
  formatType,
  findNearestBusStops,
  formatDistance,
  calculateDistanceMeters
} from '../shared/busStops.js';
import { KNOWN_ROUTES, getSubsequentStops } from '../shared/busRoutes.js';
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
  X,
  ChevronDown,
  ChevronUp,
  Navigation,
  Flag,
  LocateFixed,
  Compass,
  Crosshair,
  Sparkles
} from 'lucide-react';

interface SubsequentStop {
  sequence: number;
  code: string;
  name: string;
  road: string;
  isTerminus?: boolean;
  distance?: number;
}

interface NearbyStop {
  code: string;
  name: string;
  road: string;
  description?: string;
  lat?: number;
  lng?: number;
  distanceMeters?: number;
  distanceText?: string;
}

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
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [stopFilter, setStopFilter] = useState<string>('');
  const [routeCache, setRouteCache] = useState<Record<string, { destination: string; stops: SubsequentStop[] }>>({});
  const [routeLoading, setRouteLoading] = useState<boolean>(false);

  // GPS Location Tracker states
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyStops, setNearbyStops] = useState<NearbyStop[]>([]);
  const [gpsToast, setGpsToast] = useState<{ message: string; code: string } | null>(null);

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

  const detectGpsLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        try {
          const res = await fetch(`/api/stops?lat=${lat}&lng=${lng}&limit=6`);
          let stopsList: NearbyStop[] = [];

          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.stops) && json.stops.length > 0) {
              stopsList = json.stops;
            }
          }

          if (!stopsList.length) {
            stopsList = findNearestBusStops(lat, lng, 6, KNOWN_BUS_STOPS);
          }

          if (stopsList.length > 0) {
            const nearest = stopsList[0];
            setNearbyStops(stopsList);
            selectStop(nearest.code, nearest);
            const distNotice = nearest.distanceText ? ` (${nearest.distanceText} away)` : '';
            setGpsToast({
              message: `Auto-detected nearest bus stop: ${nearest.name} [${nearest.code}]${distNotice}`,
              code: nearest.code
            });
            setTimeout(() => setGpsToast(null), 6000);
          } else {
            setGpsError('No Singapore bus stops found near your current location.');
          }
        } catch {
          const localNearest = findNearestBusStops(lat, lng, 6, KNOWN_BUS_STOPS);
          if (localNearest.length > 0) {
            const nearest = localNearest[0];
            setNearbyStops(localNearest);
            selectStop(nearest.code, nearest);
            setGpsToast({
              message: `Auto-detected nearest bus stop: ${nearest.name} [${nearest.code}] (${nearest.distanceText} away)`,
              code: nearest.code
            });
            setTimeout(() => setGpsToast(null), 6000);
          } else {
            setGpsError('Unable to match nearest bus stop for your coordinates.');
          }
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Location permission denied. Please allow location permissions in your browser to auto-detect nearest stop.');
        } else if (err.code === 2) {
          setGpsError('Location unavailable. GPS signal could not be acquired.');
        } else if (err.code === 3) {
          setGpsError('Location request timed out. Please try clicking GPS again.');
        } else {
          setGpsError('Failed to retrieve your current location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, []);

  const handleToggleSubsequent = async (svcNo: string) => {
    if (expandedService === svcNo) {
      setExpandedService(null);
      setStopFilter('');
      return;
    }
    setExpandedService(svcNo);
    setStopFilter('');

    const cacheKey = `${svcNo}-${currentStopCode}`;
    if (!routeCache[cacheKey]) {
      setRouteLoading(true);
      try {
        const res = await fetch(`/api/route?service=${encodeURIComponent(svcNo)}&currentStop=${encodeURIComponent(currentStopCode)}`);
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.stops) && json.stops.length > 0) {
            setRouteCache(prev => ({
              ...prev,
              [cacheKey]: {
                destination: json.destination || '',
                stops: json.stops
              }
            }));
          }
        }
      } catch {
        // Fallback to local shared bus routes
      } finally {
        setRouteLoading(false);
      }
    }
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
              type="button"
              onClick={detectGpsLocation}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-xs font-semibold text-sky-300 transition-all shadow-sm"
              title="Auto-detect nearest Singapore bus stop using GPS"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-sky-400 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Detecting...' : 'GPS Nearest Stop'}</span>
            </button>
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

        {/* GPS Location Tracker Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-sky-950/40 border border-sky-500/30 shadow-md space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className={`w-4 h-4 text-sky-400 ${gpsLoading ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    GPS Location Tracker
                  </h3>
                  {userCoords && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      GPS Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {userCoords 
                    ? `Current coordinates: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`
                    : 'Auto-detect nearest bus stop based on your real-time GPS location.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={detectGpsLocation}
              disabled={gpsLoading}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold shadow-md transition-all shrink-0"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Acquiring GPS...' : 'Auto-Detect Nearest Stop'}</span>
            </button>
          </div>

          {/* GPS Success Toast */}
          {gpsToast && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{gpsToast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setGpsToast(null)}
                className="text-emerald-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* GPS Error Alert */}
          {gpsError && (
            <div className="p-2.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{gpsError}</span>
              </div>
              <button
                type="button"
                onClick={() => setGpsError(null)}
                className="text-amber-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Nearby Bus Stops Carousel / Quick Selector */}
          {nearbyStops.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                  <LocateFixed className="w-3 h-3" />
                  <span>Nearby Stops ({nearbyStops.length} within walking distance)</span>
                </span>
                <span className="text-[10px] text-slate-400">Click to switch arrival board</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {nearbyStops.map((stop) => {
                  const isSelected = currentStopCode === stop.code;
                  return (
                    <button
                      key={stop.code}
                      type="button"
                      onClick={() => selectStop(stop.code, stop)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap flex items-center gap-2 border transition-all ${
                        isSelected
                          ? 'bg-sky-500/20 text-sky-200 border-sky-500/60 font-semibold shadow-sm'
                          : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:border-slate-700 border-slate-800'
                      }`}
                    >
                      <span className="font-mono font-bold text-[11px] text-sky-400">
                        {stop.code}
                      </span>
                      <span>{stop.name}</span>
                      {stop.distanceText && (
                        <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-mono">
                          {stop.distanceText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
              activeBusData.services.map((svc) => {
                const isExpanded = expandedService === svc.serviceNo;
                const cacheKey = `${svc.serviceNo}-${currentStopCode}`;
                const cached = routeCache[cacheKey];
                const allSubsequentStops: SubsequentStop[] = cached?.stops || getSubsequentStops(svc.serviceNo, currentStopCode);
                const destinationName = cached?.destination || (KNOWN_ROUTES as Record<string, { destination?: string }>)[svc.serviceNo]?.destination || 'Terminus';
                const filteredStops = stopFilter.trim()
                  ? allSubsequentStops.filter((s) =>
                      s.name.toLowerCase().includes(stopFilter.toLowerCase()) ||
                      s.code.includes(stopFilter) ||
                      s.road.toLowerCase().includes(stopFilter.toLowerCase())
                    )
                  : allSubsequentStops;

                return (
                  <div key={svc.serviceNo} className="divide-y divide-slate-800/40">
                    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-14 text-center py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 font-bold text-sky-300 text-base shrink-0">
                          {svc.serviceNo}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {svc.operator && (
                              <span className="text-xs text-slate-400 font-medium">{svc.operator}</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleSubsequent(svc.serviceNo)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border ${
                                isExpanded 
                                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm' 
                                  : 'bg-slate-800/90 hover:bg-slate-700 text-sky-400 border-slate-700/60'
                              }`}
                              title="View all subsequent stops along the route"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>{isExpanded ? 'Hide Stops' : 'All Subsequent Stops'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
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

                    {/* Subsequent Stops Container */}
                    {isExpanded && (
                      <div className="px-5 py-4 bg-slate-950/95 border-t border-slate-800/80 space-y-3">
                        {/* Header bar with count, terminus and filter */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sky-300 text-xs flex items-center gap-1.5">
                                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                                <span>Bus {svc.serviceNo} Route</span>
                              </span>
                              <span className="text-slate-400 text-xs">→</span>
                              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                <span>Dest: {destinationName}</span>
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 font-mono border border-sky-500/30">
                                {allSubsequentStops.length} subsequent stops
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Showing all remaining stops after {stopInfo.name}. Click any stop to view its arrivals.
                            </p>
                          </div>

                          {/* Filter inside dropdown */}
                          <div className="relative min-w-[200px] max-w-xs">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                            <input
                              type="text"
                              value={stopFilter}
                              onChange={(e) => setStopFilter(e.target.value)}
                              placeholder="Filter route stops..."
                              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                            {stopFilter && (
                              <button
                                type="button"
                                onClick={() => setStopFilter('')}
                                className="absolute right-2 top-2 text-slate-400 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {routeLoading && (
                          <div className="text-xs text-sky-400 py-2 flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Loading route details...</span>
                          </div>
                        )}

                        {/* Scrollable list of ALL subsequent stops */}
                        {filteredStops.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[30rem] overflow-y-auto pr-1">
                            {filteredStops.map((stop) => {
                              const isTerminus = stop.isTerminus || stop.sequence === allSubsequentStops.length;
                              return (
                                <button
                                  key={`${stop.code}-${stop.sequence}`}
                                  type="button"
                                  onClick={() => selectStop(stop.code, stop)}
                                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all group ${
                                    isTerminus
                                      ? 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/40'
                                      : 'bg-slate-900/90 hover:bg-slate-800 hover:border-sky-500/40 border-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                                      isTerminus
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                        : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
                                    }`}>
                                      +{stop.sequence}
                                    </span>
                                    <div className="truncate">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <p className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                                          {stop.name}
                                        </p>
                                        {isTerminus && (
                                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium shrink-0">
                                            Terminus
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400 truncate">
                                        Stop {stop.code} • {stop.road}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 shrink-0 ml-2 transition-colors" />
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No stops found matching &quot;{stopFilter}&quot;.
                            <button
                              type="button"
                              onClick={() => setStopFilter('')}
                              className="ml-2 text-sky-400 underline hover:text-sky-300"
                            >
                              Reset filter
                            </button>
                          </div>
                        )}

                        {/* Footer action bar */}
                        <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                          <span>
                            Showing all {allSubsequentStops.length} stops from current stop to {destinationName}. Click any stop to view arrivals.
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedService(null)}
                            className="text-sky-400 hover:text-sky-300 underline font-medium self-start sm:self-auto"
                          >
                            Close route
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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
