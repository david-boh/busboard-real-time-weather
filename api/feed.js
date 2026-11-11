/**
 * RSS 2.0 Feed endpoint for live Bus Stop 04121 and NEA Weather reading
 * Complies with Zapier polling requirements.
 */

import { fetchBusArrivals } from './bus.js';
import { fetchWeatherForecast } from '../shared/weather.js';

export function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getSingaporeTime(date = new Date()) {
  // Singapore is UTC+8 with no Daylight Saving Time
  const sgMs = date.getTime() + (8 * 60 * 60 * 1000);
  const sgDate = new Date(sgMs);

  const year = sgDate.getUTCFullYear();
  const month = String(sgDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(sgDate.getUTCDate()).padStart(2, '0');
  const hours = String(sgDate.getUTCHours()).padStart(2, '0');
  const rawMin = sgDate.getUTCMinutes();
  const seconds = String(sgDate.getUTCSeconds()).padStart(2, '0');

  // Round down to the quarter hour: :00, :15, :30, :45
  const roundedMinNum = Math.floor(rawMin / 15) * 15;
  const roundedMin = String(roundedMinNum).padStart(2, '0');

  const roundedIso = `${year}-${month}-${day}T${hours}:${roundedMin}+08:00`;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[sgDate.getUTCDay()];
  const monthName = months[sgDate.getUTCMonth()];

  // RFC 822 format for pubDate (matches rounded quarter-hour time)
  // e.g. Wed, 11 Nov 2026 14:15:00 +0800
  const pubDateRfc822 = `${dayName}, ${day} ${monthName} ${year} ${hours}:${roundedMin}:00 +0800`;

  // RFC 822 format for channel lastBuildDate (current timestamp)
  const lastBuildDateRfc822 = `${dayName}, ${day} ${monthName} ${year} ${hours}:${String(rawMin).padStart(2, '0')}:${seconds} +0800`;

  // Plain text Singapore reading timestamp
  const readingTimeSgt = `${day} ${monthName} ${year} ${hours}:${String(rawMin).padStart(2, '0')}:${seconds} +08:00`;

  return {
    roundedIso,
    pubDateRfc822,
    lastBuildDateRfc822,
    readingTimeSgt
  };
}

export function getSiteUrl(req) {
  const host =
    req?.headers?.['x-forwarded-host'] ||
    req?.headers?.host ||
    req?.get?.('host') ||
    'localhost:3000';

  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const isSecure = req?.secure || req?.connection?.encrypted;
  const proto = forwardedProto || (isSecure ? 'https' : (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'));

  return `${proto}://${host}`;
}

export default async function feedHandler(req, res) {
  // Always answer 200 with valid RSS, with Cache-Control and Content-Type headers
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');

  const siteUrl = getSiteUrl(req);
  const timeInfo = getSingaporeTime();

  // Fetch both services in parallel
  const [busResult, weatherResult] = await Promise.all([
    fetchBusArrivals('04121'),
    fetchWeatherForecast('City')
  ]);

  let itemTitle = '';
  let itemDescription = '';

  // Check if either source failed or key is missing
  if (!busResult.success) {
    // Title starts with "Check failed:" and names source and HTTP status
    itemTitle = `Check failed: ${busResult.source} ${busResult.status}`;
    itemDescription = `Check failed: ${busResult.source} returned HTTP status ${busResult.status}.\n${busResult.error || 'Failed to retrieve bus timings'}\nTime of reading: ${timeInfo.readingTimeSgt}`;
  } else if (!weatherResult.success) {
    itemTitle = `Check failed: ${weatherResult.source} ${weatherResult.status}`;
    itemDescription = `Check failed: ${weatherResult.source} returned HTTP status ${weatherResult.status}.\n${weatherResult.error || 'Failed to retrieve weather forecast'}\nTime of reading: ${timeInfo.readingTimeSgt}`;
  } else {
    // Both sources succeeded!
    const busData = busResult.data;
    const weatherData = weatherResult.data;
    const nextBus = busData.nextBus;
    const advice = busData.advice; // 'Leave now' or 'Wait'
    const forecast = weatherData.forecast;

    if (nextBus) {
      itemTitle = `${advice}: bus ${nextBus.serviceNo} in ${nextBus.minutes} min, City: ${forecast}`;
    } else {
      itemTitle = `${advice}: no upcoming bus at stop 04121, City: ${forecast}`;
    }

    // Description: for every service at stop 04121, the next two buses in minutes,
    // then NEA's forecast for City and the period it covers,
    // then the time of the reading in Singapore time.
    const serviceLines = busData.services.map(s => {
      const times = [];
      if (s.next1 !== null && s.next1 !== undefined) times.push(`${s.next1} min`);
      if (s.next2 !== null && s.next2 !== undefined) times.push(`${s.next2} min`);
      const timingStr = times.length > 0 ? times.join(', ') : 'No timings';
      return `Bus ${s.serviceNo}: ${timingStr}`;
    });

    const periodStr = weatherData.validPeriod?.text || `${weatherData.validPeriod?.start} to ${weatherData.validPeriod?.end}`;
    const weatherLine = `NEA 2-hour forecast for City: ${forecast} (${periodStr})`;
    const timeLine = `Time of reading: ${timeInfo.readingTimeSgt}`;

    itemDescription = [...serviceLines, weatherLine, timeLine].join('\n');
  }

  // Build the link and guid
  const itemLink = `${siteUrl}/?reading=${timeInfo.roundedIso}`;
  const itemGuid = `g1-leave-${timeInfo.roundedIso}`;
  const itemPubDate = timeInfo.pubDateRfc822;

  const channelTitle = 'Bus Stop 04121 & Weather';
  const channelDesc = 'Live bus departure advice for stop 04121 and NEA 2-hour weather forecast';

  const rssXml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(channelDesc)}</description>
    <lastBuildDate>${escapeXml(timeInfo.lastBuildDateRfc822)}</lastBuildDate>
    <item>
      <title>${escapeXml(itemTitle)}</title>
      <description>${escapeXml(itemDescription)}</description>
      <link>${escapeXml(itemLink)}</link>
      <guid isPermaLink="false">${escapeXml(itemGuid)}</guid>
      <pubDate>${escapeXml(itemPubDate)}</pubDate>
    </item>
  </channel>
</rss>`;

  return res.status(200).send(rssXml);
}
