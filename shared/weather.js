/**
 * Shared service for NEA (National Environment Agency) 2-Hour Weather Forecast
 * Used by both client (src/App.tsx) and server RSS endpoint (api/feed.js).
 */

export async function fetchWeatherForecast(area = 'City') {
  const targetArea = area.toLowerCase();

  // Try v2 real-time API first, fallback to v1
  const endpoints = [
    'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
    'https://api.data.gov.sg/v1/environment/2-hour-weather-forecast'
  ];

  let lastStatus = 500;
  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json'
        }
      });

      lastStatus = response.status;
      if (!response.ok) {
        continue;
      }

      const json = await response.json();
      const simplified = simplifyWeatherForecast(json, targetArea);
      if (simplified) {
        return {
          success: true,
          data: simplified
        };
      }
    } catch (err) {
      lastError = err;
    }
  }

  return {
    success: false,
    source: 'NEA',
    status: lastStatus,
    error: lastError ? lastError.message : `HTTP ${lastStatus}`
  };
}

export function simplifyWeatherForecast(raw, targetArea = 'city') {
  if (!raw) return null;

  // Structure in v2: { code: 0, data: { items: [ { valid_period, forecasts: [ { area, forecast } ] } ] } }
  // Structure in v1: { items: [ { valid_period, forecasts: [ { area, forecast } ] } ] }
  const items = raw.data?.items || raw.items;
  if (!items || !items.length) return null;

  const firstItem = items[0];
  const forecasts = firstItem.forecasts || [];
  const validPeriod = firstItem.valid_period || {};

  const match = forecasts.find(f => f.area && f.area.toLowerCase() === targetArea.toLowerCase());
  const forecastText = match ? match.forecast : (forecasts[0]?.forecast || 'Fair');

  // Format period text
  let periodText = validPeriod.text;
  if (!periodText && validPeriod.start && validPeriod.end) {
    const formatTime = (iso) => {
      try {
        const d = new Date(iso);
        return d.toLocaleTimeString('en-SG', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Singapore'
        });
      } catch {
        return iso;
      }
    };
    periodText = `${formatTime(validPeriod.start)} to ${formatTime(validPeriod.end)}`;
  }

  return {
    area: match ? match.area : 'City',
    forecast: forecastText,
    validPeriod: {
      start: validPeriod.start || '',
      end: validPeriod.end || '',
      text: periodText || '2-Hour Forecast'
    },
    updatedAt: firstItem.timestamp || new Date().toISOString()
  };
}
