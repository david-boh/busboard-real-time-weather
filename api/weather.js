/**
 * Serverless connection endpoint for NEA 2-Hour Weather Forecast
 * Live data source: https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
 */

const ENDPOINT_V2 = 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast';
const ENDPOINT_V1 = 'https://api.data.gov.sg/v1/environment/2-hour-weather-forecast';

export async function fetchLiveTwoHourForecast(area = 'City') {
  const targetArea = (area || 'City').toLowerCase();

  const endpoints = [ENDPOINT_V2, ENDPOINT_V1];
  let lastStatus = 500;
  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json',
          'user-agent': 'BusBoard-Weather-Serverless/1.0'
        }
      });

      lastStatus = response.status;
      if (!response.ok) {
        continue;
      }

      const json = await response.json();
      const items = json.data?.items || json.items;
      if (!items || !items.length) {
        continue;
      }

      const currentItem = items[0];
      const validPeriod = currentItem.valid_period || {};
      const forecasts = currentItem.forecasts || [];
      const areaMetadata = json.data?.area_metadata || json.area_metadata || [];

      // Find target forecast
      const targetMatch = forecasts.find(
        f => f.area && f.area.toLowerCase() === targetArea
      ) || forecasts.find(f => f.area?.toLowerCase() === 'city') || forecasts[0];

      return {
        success: true,
        source: url,
        status: 200,
        area: targetMatch ? targetMatch.area : 'City',
        forecast: targetMatch ? targetMatch.forecast : 'Fair',
        validPeriod: {
          start: validPeriod.start || '',
          end: validPeriod.end || '',
          text: validPeriod.text || `${validPeriod.start} to ${validPeriod.end}`
        },
        forecasts,
        areaMetadata,
        updateTimestamp: currentItem.update_timestamp || currentItem.timestamp || new Date().toISOString(),
        raw: json
      };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    success: false,
    source: 'NEA',
    status: lastStatus,
    error: lastError ? lastError.message : `Failed to fetch from NEA (HTTP ${lastStatus})`
  };
}

export default async function weatherHandler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  const area = req.query?.area || 'City';
  const rawOnly = req.query?.raw === 'true' || req.query?.raw === '1';

  const result = await fetchLiveTwoHourForecast(area);

  if (!result.success) {
    return res.status(result.status || 502).json({
      error: 'Failed to fetch 2-hour weather forecast',
      source: result.source,
      status: result.status,
      message: result.error
    });
  }

  if (rawOnly) {
    return res.status(200).json(result.raw);
  }

  return res.status(200).json({
    status: 'ok',
    area: result.area,
    forecast: result.forecast,
    validPeriod: result.validPeriod,
    updateTimestamp: result.updateTimestamp,
    forecasts: result.forecasts,
    areaMetadata: result.areaMetadata,
    dataSource: result.source
  });
}
