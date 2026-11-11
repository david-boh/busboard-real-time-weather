# Project Prompts & Conversation History

This document collates all prompts submitted during the development and iteration of the **SG Bus 04121 & Weather RSS** application.

---

## Prompt 1: Initial Implementation of RSS 2.0 Feed

```text
ROLE: You are a senior full-stack developer working in this existing Vite + React project, the app we built yesterday.
GOAL: Add an RSS 2.0 feed of this app's own live reading, so that Zapier can watch it. Change nothing else on the screen.
1) api/feed.js in the PROJECT ROOT, a sibling of package.json and of api/bus.js and api/health.js, never inside src/. It answers GET /api/feed with status 200 and the header Content-Type: application/rss+xml; charset=utf-8.
2) The feed is one <rss version="2.0"> with one <channel>: <title>, <link> (this site's address, built from the request's Host header), <description> and <lastBuildDate>. The channel holds one <item> only, the reading made now.
3) The item:
   <title>: the advice our screen gives, Leave now or Wait, then the next bus at stop 04121 with its service number and minutes, then NEA's 2-hour forecast for City, for example: Wait: bus 7 in 9 min, City: Showers
   <description>: For every service at stop 04121, the next two buses in minutes, then NEA's forecast for City and the period it covers, then the time of the reading in Singapore time.
   <link>: this site's address with ?reading= and the same rounded quarter-hour time as the guid, so that the link changes only when the guid changes.
   <guid isPermaLink="false">: g1-leave- followed by the current time in Singapore (UTC+8) rounded DOWN to the quarter hour, for example g1-leave-2026-11-11T14:15+08:00. It stays the same for the whole quarter hour and changes at :00, :15, :30 and :45.
   <pubDate>: that same rounded time in RFC 822 format, for example Wed, 11 Nov 2026 14:15:00 +0800.
4) Reuse the code that api/bus.js and our second service already use to fetch and simplify the data, and import that code into api/feed.js. Do not fetch this site's own address from inside the function. If our second service is called only from the browser today, move that call into a shared module that both the screen and api/feed.js import, and check that the screen still works.
5) Read every key with process.env, the same way api/bus.js does. Never write a key, any part of it, or its length into the feed or into an error message.
6) If a source fails or a key is missing, still answer 200 with valid RSS. The item title then starts with "Check failed:" and names the source and its HTTP status, so that the failure reaches my inbox.
7) Escape &, < and > in every text field. Put plain text in <description>, with no HTML inside it.
8) Set Cache-Control: s-maxage=20, stale-while-revalidate=40, the same as the bus response.
9) Register the same handler in server.ts as app.get("/api/feed"), importing the shared handler without copying it, so that the AI Studio preview runs it too.
When you finish, list every file you changed, and show me the feed for one reading.
```

---

## Prompt 2: Push to GitHub Repository

```text
push https://[REDACTED_TOKEN]@https://github.com/david-boh/busboard-real-time-weather.git
[Media attachment: Screenshot containing GitHub Personal Access Token]
```

---

## Prompt 3: Add Serverless Weather Connection

```text
Add a serverless connection that pulls live data using the following endpoints: https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
```

---

## Prompt 4: Collate Prompts

```text
Collate all the prompts into filename Prompts.md
```

---

## Prompt 5: Seat Availability, Vehicle Type, Bus Stop Search & Location Verification

```text
For the bus arrival timing, can you add in availaiblity of seats for each bus? or if its single deck etc. Can you add in a search box to allow user to key in other bus stops. Also can you verify the location for 04121, its not old hill street
```

---

## Prompt 6: Remove Quick Stops, Bus Stop Number & Name Top Left, Search Autocomplete

```text
can you remove the quick stops, and add the bus stop number as well as name on top left. for the search can it have auto complete or recommendation logic. keep everything else unchanged.
```

---

## Prompt 7: Publish to GitHub

```text
publish to github
```


