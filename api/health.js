import { getLtaApiKey } from '../shared/env.js';

export default function healthHandler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const hasLtaKey = !!getLtaApiKey();

  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    connections: {
      weather: {
        source: 'NEA / Data.gov.sg',
        endpoint: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
        status: 'online'
      },
      busArrivals: {
        source: 'LTA DataMall',
        endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
        keyConfigured: hasLtaKey,
        status: hasLtaKey ? 'online' : 'key_missing'
      }
    }
  });
}
