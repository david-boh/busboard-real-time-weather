import { getLtaApiKey } from '../shared/env.js';

export function calculateMinutes(isoDate, now = Date.now()) {
  if (!isoDate) return null;
  const arrivalMs = new Date(isoDate).getTime();
  if (isNaN(arrivalMs)) return null;
  const diffMinutes = Math.round((arrivalMs - now) / 60000);
  return Math.max(0, diffMinutes);
}

export function getAdvice(minutes) {
  if (minutes === null || minutes === undefined) return 'Wait';
  // If next bus is 5 minutes or less away, advice is to leave now to catch it
  return minutes <= 5 ? 'Leave now' : 'Wait';
}

export function simplifyBusArrivals(raw, now = Date.now()) {
  if (!raw || !Array.isArray(raw.Services)) {
    return {
      busStopCode: raw?.BusStopCode || '04121',
      services: [],
      nextBus: null,
      advice: 'Wait',
      readingTime: new Date(now).toISOString()
    };
  }

  const services = raw.Services.map(item => {
    const next1 = calculateMinutes(item.NextBus?.EstimatedArrival, now);
    const next2 = calculateMinutes(item.NextBus2?.EstimatedArrival, now);
    const next3 = calculateMinutes(item.NextBus3?.EstimatedArrival, now);

    return {
      serviceNo: item.ServiceNo,
      operator: item.Operator,
      next1,
      next2,
      next3,
      load1: item.NextBus?.Load || '',
      type1: item.NextBus?.Type || '',
      feature1: item.NextBus?.Feature || '',
      load2: item.NextBus2?.Load || '',
      type2: item.NextBus2?.Type || '',
      feature2: item.NextBus2?.Feature || '',
      load3: item.NextBus3?.Load || '',
      type3: item.NextBus3?.Type || '',
      feature3: item.NextBus3?.Feature || '',
    };
  });

  // Sort services numerically / naturally
  services.sort((a, b) => {
    const numA = parseInt(a.serviceNo, 10);
    const numB = parseInt(b.serviceNo, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.serviceNo.localeCompare(b.serviceNo);
  });

  // Find the earliest bus arriving at the stop
  let earliest = null;
  for (const s of services) {
    if (s.next1 !== null) {
      if (!earliest || s.next1 < earliest.minutes) {
        earliest = {
          serviceNo: s.serviceNo,
          minutes: s.next1
        };
      }
    }
  }

  const advice = earliest ? getAdvice(earliest.minutes) : 'Wait';

  return {
    busStopCode: raw.BusStopCode || '04121',
    services,
    nextBus: earliest,
    advice,
    readingTime: new Date(now).toISOString()
  };
}

export async function fetchBusArrivals(busStopCode = '04121') {
  // Read key via process.env. Never expose or log the key value or length.
  const apiKey = getLtaApiKey();

  if (!apiKey) {
    return {
      success: false,
      source: 'LTA',
      status: 401,
      error: 'API key is missing'
    };
  }

  const url = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'AccountKey': apiKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        source: 'LTA',
        status: response.status,
        error: `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    const simplified = simplifyBusArrivals(data);

    return {
      success: true,
      data: simplified
    };
  } catch (err) {
    return {
      success: false,
      source: 'LTA',
      status: 503,
      error: err instanceof Error ? err.message : 'Network error'
    };
  }
}

export default async function busHandler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const busStopCode = req.query?.busStopCode || '04121';
  const result = await fetchBusArrivals(busStopCode);

  if (!result.success) {
    return res.status(result.status || 500).json({
      error: 'Check failed',
      source: result.source,
      status: result.status,
      message: result.error
    });
  }

  return res.status(200).json(result.data);
}
