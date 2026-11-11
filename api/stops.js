/**
 * Serverless endpoint for Singapore Bus Stops Directory
 * Connects to LTA DataMall: https://datamall2.mytransport.sg/ltaodataservice/BusStops
 */

import { KNOWN_BUS_STOPS } from '../shared/busStops.js';

// In-memory cache for LTA bus stops to avoid repeated external calls
let cachedStops = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchAllLtaBusStops() {
  const apiKey =
    process.env.LTA_API_KEY ||
    process.env.DATAMALL_API_KEY ||
    process.env.LTA_DATAMALL_KEY ||
    process.env.LTA_KEY ||
    process.env.ACCOUNT_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'Missing API key',
      stops: KNOWN_BUS_STOPS
    };
  }

  // Check cache
  if (cachedStops && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return {
      success: true,
      stops: cachedStops
    };
  }

  const allStops = [];
  let skip = 0;
  const batchSize = 500;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = `https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`;
      const response = await fetch(url, {
        headers: {
          'AccountKey': apiKey,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        break;
      }

      const json = await response.json();
      const records = json.value || [];
      if (!records.length) {
        break;
      }

      for (const item of records) {
        allStops.push({
          code: item.BusStopCode,
          name: item.Description,
          road: item.RoadName,
          latitude: item.Latitude,
          longitude: item.Longitude
        });
      }

      if (records.length < batchSize) {
        hasMore = false;
      } else {
        skip += batchSize;
        // Limit max pagination to prevent timeout in serverless
        if (skip >= 6000) break;
      }
    }

    if (allStops.length > 0) {
      cachedStops = allStops;
      cacheTimestamp = Date.now();
      return {
        success: true,
        stops: allStops
      };
    }
  } catch {
    // If external fetch fails, fallback to bundled stops
  }

  return {
    success: false,
    stops: cachedStops || KNOWN_BUS_STOPS
  };
}

export async function searchStops(query = '', limit = 10) {
  const clean = String(query || '').trim().toLowerCase();
  const max = Math.min(Math.max(parseInt(String(limit), 10) || 10, 1), 50);

  // Try to load full LTA stops if available, or fallback to known stops
  const result = await fetchAllLtaBusStops();
  const pool = result.stops && result.stops.length > 0 ? result.stops : KNOWN_BUS_STOPS;

  if (!clean) {
    return pool.slice(0, max);
  }

  // Filter matches by code, name, or road
  const matches = pool.filter(s => {
    const code = String(s.code || '').toLowerCase();
    const name = String(s.name || '').toLowerCase();
    const road = String(s.road || '').toLowerCase();

    return code.startsWith(clean) || code.includes(clean) || name.includes(clean) || road.includes(clean);
  });

  // Ranking: Code prefix match > Name prefix match > Others
  matches.sort((a, b) => {
    const aCode = String(a.code || '').toLowerCase();
    const bCode = String(b.code || '').toLowerCase();
    const aName = String(a.name || '').toLowerCase();
    const bName = String(b.name || '').toLowerCase();

    const aCodeStarts = aCode.startsWith(clean);
    const bCodeStarts = bCode.startsWith(clean);
    if (aCodeStarts && !bCodeStarts) return -1;
    if (!aCodeStarts && bCodeStarts) return 1;

    const aNameStarts = aName.startsWith(clean);
    const bNameStarts = bName.startsWith(clean);
    if (aNameStarts && !bNameStarts) return -1;
    if (!aNameStarts && bNameStarts) return 1;

    return 0;
  });

  return matches.slice(0, max);
}

export default async function stopsHandler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  const query = req.query?.q || req.query?.search || '';
  const limit = req.query?.limit || 10;
  const code = req.query?.code;

  if (code) {
    const formattedCode = String(code).trim().padStart(5, '0');
    const result = await fetchAllLtaBusStops();
    const pool = result.stops && result.stops.length > 0 ? result.stops : KNOWN_BUS_STOPS;
    const found = pool.find(s => s.code === formattedCode);

    if (found) {
      return res.status(200).json(found);
    }
    return res.status(200).json({
      code: formattedCode,
      name: `Bus Stop ${formattedCode}`,
      road: 'Singapore'
    });
  }

  const results = await searchStops(query, limit);

  return res.status(200).json({
    query,
    count: results.length,
    stops: results
  });
}
