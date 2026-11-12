/**
 * Serverless endpoint for Bus Routes and Subsequent Stops
 * Connects to LTA DataMall: https://datamall2.mytransport.sg/ltaodataservice/BusRoutes
 */

import { getSubsequentStops, KNOWN_ROUTES } from '../shared/busRoutes.js';
import { getBusStopInfo } from '../shared/busStops.js';
import { getLtaApiKey } from '../shared/env.js';

// Cache for bus routes
const routesCache = new Map();
const ROUTE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchLtaBusRoute(serviceNo) {
  const apiKey = getLtaApiKey();

  if (!apiKey || !serviceNo) {
    return null;
  }

  const cached = routesCache.get(serviceNo);
  if (cached && Date.now() - cached.timestamp < ROUTE_CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `https://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$filter=ServiceNo eq '${encodeURIComponent(serviceNo)}'`;
    const response = await fetch(url, {
      headers: {
        'AccountKey': apiKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const records = json.value || [];
    if (!records.length) return null;

    // Group by direction
    const directions = {};
    for (const item of records) {
      const dir = item.Direction || 1;
      if (!directions[dir]) directions[dir] = [];
      directions[dir].push({
        stopSequence: item.StopSequence,
        busStopCode: item.BusStopCode,
        distance: item.Distance
      });
    }

    // Sort by StopSequence
    Object.keys(directions).forEach(dir => {
      directions[dir].sort((a, b) => a.stopSequence - b.stopSequence);
    });

    routesCache.set(serviceNo, {
      timestamp: Date.now(),
      data: directions
    });

    return directions;
  } catch {
    return null;
  }
}

export default async function routeHandler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  const serviceNo = String(req.query?.service || req.query?.serviceNo || '').trim();
  const currentStop = String(req.query?.currentStop || req.query?.stop || '04121').trim().padStart(5, '0');

  if (!serviceNo) {
    return res.status(400).json({ error: 'service parameter is required' });
  }

  // 1. Try to fetch from live LTA BusRoutes API
  const ltaDirections = await fetchLtaBusRoute(serviceNo);

  if (ltaDirections) {
    // Find which direction contains the currentStop
    let matchedDirection = null;
    let stopIndex = -1;

    for (const dir of Object.keys(ltaDirections)) {
      const stops = ltaDirections[dir];
      const idx = stops.findIndex(s => s.busStopCode === currentStop);
      if (idx !== -1) {
        matchedDirection = dir;
        stopIndex = idx;
        break;
      }
    }

    // If stop was found in a direction, return all subsequent stops
    if (matchedDirection && stopIndex !== -1) {
      const dirStops = ltaDirections[matchedDirection];
      const remainingStops = dirStops.slice(stopIndex + 1);
      const subsequent = remainingStops.map((s, idx) => {
        const info = getBusStopInfo(s.busStopCode);
        return {
          sequence: idx + 1,
          stopSequence: s.stopSequence,
          code: s.busStopCode,
          name: info.name,
          road: info.road,
          distance: s.distance,
          isTerminus: idx === remainingStops.length - 1
        };
      });

      const termStop = dirStops[dirStops.length - 1];
      const termInfo = termStop ? getBusStopInfo(termStop.busStopCode) : null;

      return res.status(200).json({
        serviceNo,
        currentStop,
        direction: matchedDirection,
        destination: termInfo ? termInfo.name : 'Terminus',
        totalSubsequentStops: subsequent.length,
        stops: subsequent,
        source: 'LTA DataMall'
      });
    }
  }

  // 2. Comprehensive fallback from shared/busRoutes.js
  const fallbackStops = getSubsequentStops(serviceNo, currentStop);
  const routeMeta = KNOWN_ROUTES[serviceNo] || {};

  return res.status(200).json({
    serviceNo,
    currentStop,
    destination: routeMeta.destination || 'Terminus',
    origin: routeMeta.origin || 'Interchange',
    totalSubsequentStops: fallbackStops.length,
    stops: fallbackStops,
    source: 'Route Directory'
  });
}
