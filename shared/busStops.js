/**
 * Singapore Bus Stops metadata and LTA DataMall formatting helpers
 */

export const KNOWN_BUS_STOPS = [
  // SMU / Bras Basah / Dhoby Ghaut / City Hall
  { code: '04121', name: 'SMU', road: 'Stamford Rd', description: 'Outside Singapore Management University', lat: 1.2968, lng: 103.8504 },
  { code: '04168', name: 'Cosmic Insurance Bldg / SMU', road: 'Bras Basah Rd', description: 'Opposite SMU Campus', lat: 1.2962, lng: 103.8509 },
  { code: '08057', name: 'Dhoby Ghaut Stn Exit B', road: 'Orchard Rd', description: 'Dhoby Ghaut MRT interchange', lat: 1.2993, lng: 103.8449 },
  { code: '08031', name: 'Dhoby Ghaut Stn', road: 'Penang Rd', description: 'Penang Road near Dhoby Ghaut', lat: 1.2988, lng: 103.8454 },
  { code: '08041', name: 'YMCA', road: 'Orchard Rd', description: 'Near Fort Canning & Dhoby Ghaut', lat: 1.2983, lng: 103.8475 },
  { code: '01012', name: 'Hotel Rendezvous', road: 'Bras Basah Rd', description: 'Near Bencoolen MRT', lat: 1.2980, lng: 103.8501 },
  { code: '01013', name: 'Bencoolen Stn Exit B', road: 'Bencoolen St', description: 'Downtown Line Bencoolen', lat: 1.2987, lng: 103.8517 },
  { code: '04179', name: 'Bras Basah Cplx', road: 'Victoria St', description: 'Near Bras Basah Complex', lat: 1.2965, lng: 103.8532 },
  { code: '04149', name: 'St. Andrew\'s Cath', road: 'North Bridge Rd', description: 'City Hall MRT Exit B', lat: 1.2928, lng: 103.8521 },
  { code: '04111', name: 'National Library', road: 'Victoria St', description: 'National Library Building', lat: 1.2977, lng: 103.8543 },
  { code: '03223', name: 'Raffles Hotel', road: 'Bras Basah Rd', description: 'Historic Raffles Hotel', lat: 1.2952, lng: 103.8540 },
  { code: '03129', name: 'Opp The Treasury', road: 'High St', description: 'Civil District / Parliament', lat: 1.2897, lng: 103.8499 },

  // Hill Street / Clarke Quay / Chinatown / Outram
  { code: '04223', name: 'Old Hill St Police Stn', road: 'Hill St', description: 'Outside former Hill St Police Station', lat: 1.2906, lng: 103.8491 },
  { code: '04229', name: 'Opp Old Hill St Police Stn', road: 'Hill St', description: 'Opposite Hill St Police Station', lat: 1.2902, lng: 103.8495 },
  { code: '03019', name: 'Opp Clarke Quay Stn', road: 'Eu Tong Sen St', description: 'Near Clarke Quay Central', lat: 1.2882, lng: 103.8465 },
  { code: '03059', name: 'Clarke Quay Stn Exit E', road: 'New Bridge Rd', description: 'Clarke Quay North East Line', lat: 1.2879, lng: 103.8468 },
  { code: '05013', name: 'Chinatown Stn Exit E', road: 'Eu Tong Sen St', description: 'Chinatown Point', lat: 1.2842, lng: 103.8441 },
  { code: '05022', name: 'Chinatown Stn Exit C', road: 'New Bridge Rd', description: 'People\'s Park Complex', lat: 1.2838, lng: 103.8444 },
  { code: '05411', name: 'Opp Sri Mariamman Tp', road: 'South Bridge Rd', description: 'Chinatown heritage area', lat: 1.2825, lng: 103.8458 },
  { code: '06011', name: 'Outram Park Stn Exit 1', road: 'Outram Rd', description: 'Outram Park MRT Interchange', lat: 1.2801, lng: 103.8398 },
  { code: '06029', name: 'Opp Outram Park Stn', road: 'Eu Tong Sen St', description: 'Outram Park North East Line', lat: 1.2805, lng: 103.8402 },
  { code: '10039', name: 'Kampong Bahru Ter', road: 'Spooner Rd', description: 'Kampong Bahru Bus Terminal', lat: 1.2762, lng: 103.8341 },
  { code: '10099', name: 'Bukit Merah Int', road: 'Bukit Merah Central', description: 'Bukit Merah Bus Interchange', lat: 1.2825, lng: 103.8174 },
  { code: '10091', name: 'Blk 201', road: 'Jln Bukit Merah', description: 'Jalan Bukit Merah', lat: 1.2818, lng: 103.8188 },

  // Bugis / Rochor / Little India
  { code: '01112', name: 'Bugis Stn Exit D', road: 'Rochor Rd', description: 'Bugis MRT interchange', lat: 1.3005, lng: 103.8562 },
  { code: '04119', name: 'Bugis Stn Exit A', road: 'Victoria St', description: 'Bugis Junction', lat: 1.3002, lng: 103.8558 },
  { code: '01519', name: 'The Verge', road: 'Serangoon Rd', description: 'Little India', lat: 1.3056, lng: 103.8524 },

  // Orchard / Somerset / Tanglin
  { code: '09048', name: 'Midpoint Orchard', road: 'Orchard Rd', description: 'Orchard shopping belt', lat: 1.3015, lng: 103.8384 },
  { code: '09037', name: 'Opp 313@Somerset', road: 'Orchard Rd', description: 'Somerset MRT', lat: 1.3008, lng: 103.8391 },
  { code: '09022', name: 'Orchard Stn / Lucky Plaza', road: 'Orchard Rd', description: 'Orchard MRT Exit D', lat: 1.3040, lng: 103.8335 },
  { code: '09023', name: 'Orchard Stn / Tangs', road: 'Orchard Blvd', description: 'Orchard MRT Exit A', lat: 1.3038, lng: 103.8328 },
  { code: '10169', name: 'Orchard Plaza', road: 'Orchard Rd', description: 'Near Somerset', lat: 1.3011, lng: 103.8402 },
  { code: '09169', name: 'Delfi Orchard', road: 'Orchard Rd', description: 'Upper Orchard shopping', lat: 1.3069, lng: 103.8298 },
  { code: '09149', name: 'Opp British Council', road: 'Napier Rd', description: 'Tanglin / Embassy row', lat: 1.3072, lng: 103.8241 },
  { code: '09219', name: 'Far East Plaza', road: 'Scotts Rd', description: 'Scotts Road near Orchard MRT', lat: 1.3071, lng: 103.8338 },
  { code: '09212', name: 'Royal Plaza On Scotts', road: 'Scotts Rd', description: 'Near Grand Hyatt', lat: 1.3065, lng: 103.8332 },

  // Holland / Commonwealth / Queenstown / Clementi
  { code: '13019', name: 'Gleneagles Hosp', road: 'Napier Rd', description: 'Outside Gleneagles Hospital', lat: 1.3078, lng: 103.8202 },
  { code: '13021', name: 'Opp Botanic Gardens', road: 'Holland Rd', description: 'Singapore Botanic Gardens UNESCO Site', lat: 1.3092, lng: 103.8165 },
  { code: '11261', name: 'Holland Village Stn', road: 'Holland Ave', description: 'Holland Village Circle Line', lat: 1.3120, lng: 103.7963 },
  { code: '11169', name: 'Commonwealth Stn', road: 'Commonwealth Ave', description: 'Commonwealth East-West Line', lat: 1.3025, lng: 103.7981 },
  { code: '10018', name: 'Queenstown Stn Exit B', road: 'Commonwealth Ave', description: 'Queenstown MRT', lat: 1.2948, lng: 103.8058 },
  { code: '11361', name: 'Buona Vista Stn Exit C', road: 'Commonwealth Ave', description: 'Buona Vista MRT Interchange', lat: 1.3068, lng: 103.7904 },
  { code: '19031', name: 'Dover Stn Exit A', road: 'Commonwealth Ave West', description: 'Dover East-West Line', lat: 1.3115, lng: 103.7785 },
  { code: '19029', name: 'Singapore Poly', road: 'Commonwealth Ave West', description: 'Singapore Polytechnic Gate 1', lat: 1.3105, lng: 103.7761 },
  { code: '17171', name: 'Clementi Stn Exit A', road: 'Commonwealth Ave West', description: 'Clementi MRT', lat: 1.3151, lng: 103.7650 },
  { code: '17179', name: 'Clementi Int', road: 'Clementi Ave 3', description: 'Clementi Bus Interchange', lat: 1.3155, lng: 103.7645 },
  { code: '16009', name: 'Kent Ridge Ter', road: 'Clementi Rd', description: 'NUS Kent Ridge Terminal', lat: 1.2941, lng: 103.7712 },
  { code: '11511', name: 'Opp Queensway Shop Ctr', road: 'Queensway', description: 'Queensway Shopping Centre', lat: 1.2885, lng: 103.8035 },

  // Bukit Timah / Bukit Batok / Choa Chu Kang
  { code: '40081', name: 'Stevens Stn Exit 2', road: 'Whitley Rd', description: 'Stevens MRT Interchange', lat: 1.3202, lng: 103.8262 },
  { code: '51111', name: 'Opp Trevose Pk', road: 'Whitley Rd', description: 'Whitley Road flyover', lat: 1.3235, lng: 103.8278 },
  { code: '41012', name: 'Botanic Gardens Stn', road: 'Bukit Timah Rd', description: 'Downtown / Circle Line', lat: 1.3225, lng: 103.8155 },
  { code: '41041', name: 'Coronation Plaza', road: 'Bukit Timah Rd', description: 'Bukit Timah shopping strip', lat: 1.3242, lng: 103.8115 },
  { code: '41051', name: 'Tan Kah Kee Stn', road: 'Bukit Timah Rd', description: 'Hwa Chong / Nanyang', lat: 1.3260, lng: 103.8075 },
  { code: '41081', name: 'Sixth Ave Stn', road: 'Bukit Timah Rd', description: 'Sixth Avenue Downtown Line', lat: 1.3312, lng: 103.7972 },
  { code: '42051', name: 'King Albert Park Stn', road: 'Bukit Timah Rd', description: 'KAP Mall / Rail Corridor', lat: 1.3358, lng: 103.7835 },
  { code: '42091', name: 'Beauty World Stn Exit B', road: 'Upper Bukit Timah Rd', description: 'Beauty World Centre', lat: 1.3418, lng: 103.7758 },
  { code: '43179', name: 'Blk 288E', road: 'Bukit Batok East Ave 6', description: 'Bukit Batok East', lat: 1.3482, lng: 103.7602 },
  { code: '43009', name: 'Bukit Batok Int', road: 'Bukit Batok Central', description: 'Bukit Batok Bus Interchange', lat: 1.3502, lng: 103.7495 },
  { code: '44141', name: 'Phoenix Stn', road: 'Upper Bukit Timah Rd', description: 'Phoenix LRT', lat: 1.3788, lng: 103.7578 },
  { code: '44029', name: 'Bukit Panjang Stn Exit A/LRT', road: 'Woodlands Rd', description: 'Hillion Mall / Interchange', lat: 1.3792, lng: 103.7618 },
  { code: '44281', name: 'Opp Teck Whye Stn', road: 'Choa Chu Kang Way', description: 'Teck Whye LRT', lat: 1.3812, lng: 103.7535 },
  { code: '44009', name: 'Choa Chu Kang Int', road: 'Choa Chu Kang Loop', description: 'Lot One Shoppers\' Mall', lat: 1.3852, lng: 103.7445 },

  // Jurong East / Boon Lay
  { code: '28009', name: 'Jurong East Int', road: 'Jurong Gateway Rd', description: 'Jurong East Bus Interchange', lat: 1.3335, lng: 103.7422 },
  { code: '28211', name: 'Opp Parc Oasis', road: 'Jurong East Ave 1', description: 'Jurong East Ave 1', lat: 1.3445, lng: 103.7375 },
  { code: '28229', name: 'Blk 347', road: 'Jurong East Ave 1', description: 'Jurong East residential', lat: 1.3488, lng: 103.7325 },
  { code: '28431', name: 'Chinese Garden Stn Exit A', road: 'Boon Lay Way', description: 'Chinese Garden MRT', lat: 1.3425, lng: 103.7328 },
  { code: '28301', name: 'Lakeside Stn', road: 'Boon Lay Way', description: 'Lakeside MRT', lat: 1.3442, lng: 103.7212 },
  { code: '22009', name: 'Boon Lay Int', road: 'Jurong West Central 3', description: 'Jurong Point / Boon Lay Interchange', lat: 1.3395, lng: 103.7058 },

  // Marina Bay / CBD / Suntec
  { code: '02049', name: 'Raffles Place Stn Exit F', road: 'Robinson Rd', description: 'Central Business District', lat: 1.2838, lng: 103.8512 },
  { code: '03509', name: 'The Sail', road: 'Marina Blvd', description: 'Downtown MRT / Marina Bay', lat: 1.2818, lng: 103.8535 },
  { code: '03511', name: 'Marina Bay Sands Hotel', road: 'Bayfront Ave', description: 'Bayfront MRT', lat: 1.2835, lng: 103.8605 },
  { code: '02099', name: 'Marina Ctr Ter', road: 'Raffles Blvd', description: 'Marina Centre Bus Terminal', lat: 1.2915, lng: 103.8592 },
  { code: '80059', name: 'Suntec City', road: 'Temasek Blvd', description: 'Suntec Convention Centre', lat: 1.2938, lng: 103.8578 },
  { code: '80019', name: 'Opp National Stadium', road: 'Nicoll Highway', description: 'Singapore Sports Hub', lat: 1.3042, lng: 103.8745 },

  // East Hubs (Marine Parade, Bedok, Tampines, Pasir Ris, Changi)
  { code: '83139', name: 'Parkway Parade', road: 'Marine Parade Rd', description: 'Marine Parade Central', lat: 1.3015, lng: 103.9052 },
  { code: '83111', name: 'Opp Parkway Parade', road: 'Marine Parade Rd', description: 'Marine Parade MRT', lat: 1.3022, lng: 103.9048 },
  { code: '82069', name: 'Roxy Sq', road: 'East Coast Rd', description: 'Katong heritage area', lat: 1.3052, lng: 103.9035 },
  { code: '84009', name: 'Bedok Int', road: 'Bedok North Ave 1', description: 'Bedok Mall / Bus Interchange', lat: 1.3242, lng: 103.9302 },
  { code: '84039', name: 'Bedok Stn Exit B', road: 'New Upper Changi Rd', description: 'Bedok Town Centre', lat: 1.3235, lng: 103.9308 },
  { code: '84031', name: 'Bedok Stn Exit A', road: 'New Upper Changi Rd', description: 'Opp Bedok Stn', lat: 1.3238, lng: 103.9298 },
  { code: '76199', name: 'Tampines Stn / Int', road: 'Tampines Ave 4', description: 'Tampines MRT & Hub', lat: 1.3538, lng: 103.9452 },
  { code: '77009', name: 'Pasir Ris Int', road: 'Pasir Ris Central', description: 'White Sands / Pasir Ris Interchange', lat: 1.3725, lng: 103.9492 },
  { code: '95029', name: 'Changi Airport PTB2', road: 'Airport Blvd', description: 'Changi Airport Terminal 2 Basement', lat: 1.3575, lng: 103.9892 },
  { code: '99009', name: 'Changi Village Ter', road: 'Changi Village Rd', description: 'Changi Village Bus Terminal', lat: 1.3888, lng: 103.9875 },

  // North / North-East Hubs (Ang Mo Kio, Bishan, Hougang, Woodlands, Yishun)
  { code: '53009', name: 'Bishan Int', road: 'Bishan Place', description: 'Junction 8 / Bishan Interchange', lat: 1.3505, lng: 103.8488 },
  { code: '53079', name: 'Opp Junction 8', road: 'Bishan St 13', description: 'Bishan Central', lat: 1.3508, lng: 103.8495 },
  { code: '64009', name: 'Ang Mo Kio Int', road: 'Ang Mo Kio Ave 8', description: 'AMK Hub / Interchange', lat: 1.3695, lng: 103.8495 },
  { code: '64019', name: 'Hougang Central Int', road: 'Hougang Central', description: 'Hougang Central Bus Interchange', lat: 1.3712, lng: 103.8925 },
  { code: '60011', name: 'Kovan Stn Exit C', road: 'Upper Serangoon Rd', description: 'Heartland Mall / Kovan', lat: 1.3602, lng: 103.8855 },
  { code: '61011', name: 'Serangoon Stn Exit B', road: 'Upper Serangoon Rd', description: 'NEX / Serangoon Interchange', lat: 1.3498, lng: 103.8735 },
  { code: '60121', name: 'Woodleigh Stn Exit A', road: 'Upper Serangoon Rd', description: 'The Woodleigh Mall', lat: 1.3392, lng: 103.8712 },
  { code: '60079', name: 'Potong Pasir Stn Exit B', road: 'Upper Serangoon Rd', description: 'Potong Pasir MRT', lat: 1.3315, lng: 103.8688 },
  { code: '46009', name: 'Woodlands Temp Int', road: 'Woodlands Sq', description: 'Woodlands MRT & Interchange', lat: 1.4365, lng: 103.7865 },
  { code: '59009', name: 'Yishun Int', road: 'Yishun Ave 2', description: 'Northpoint City / Yishun', lat: 1.4295, lng: 103.8355 }
];

export function getBusStopInfo(code) {
  const normalized = String(code || '').trim().padStart(5, '0');
  const found = KNOWN_BUS_STOPS.find(s => s.code === normalized);
  if (found) {
    return found;
  }
  return {
    code: normalized,
    name: `Bus Stop ${normalized}`,
    road: 'Singapore',
    description: ''
  };
}

/**
 * Filter bus stops for autocomplete & search
 */
export function searchBusStops(query = '', limit = 6) {
  const clean = query.trim().toLowerCase();
  if (!clean) {
    // Return top popular recommendations
    return KNOWN_BUS_STOPS.slice(0, limit);
  }

  // Exact code match or prefix match gets top priority
  const matches = KNOWN_BUS_STOPS.filter(s => {
    return (
      s.code.startsWith(clean) ||
      s.code.includes(clean) ||
      s.name.toLowerCase().includes(clean) ||
      s.road.toLowerCase().includes(clean) ||
      (s.description && s.description.toLowerCase().includes(clean))
    );
  });

  // Sort: stops whose code or name starts with query first
  matches.sort((a, b) => {
    const aCodeStarts = a.code.startsWith(clean);
    const bCodeStarts = b.code.startsWith(clean);
    if (aCodeStarts && !bCodeStarts) return -1;
    if (!aCodeStarts && bCodeStarts) return 1;

    const aNameStarts = a.name.toLowerCase().startsWith(clean);
    const bNameStarts = b.name.toLowerCase().startsWith(clean);
    if (aNameStarts && !bNameStarts) return -1;
    if (!aNameStarts && bNameStarts) return 1;

    return 0;
  });

  return matches.slice(0, limit);
}

/**
 * LTA DataMall Load Codes:
 * SEA = Seats Available
 * SDA = Standing Available
 * LSD = Limited Standing
 */
export function formatLoad(loadCode) {
  switch (loadCode) {
    case 'SEA':
      return {
        code: 'SEA',
        label: 'Seats Avail',
        fullLabel: 'Seats Available',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      };
    case 'SDA':
      return {
        code: 'SDA',
        label: 'Standing',
        fullLabel: 'Standing Available',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      };
    case 'LSD':
      return {
        code: 'LSD',
        label: 'Crowded',
        fullLabel: 'Limited Standing',
        badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      };
    default:
      return {
        code: loadCode || '',
        label: 'Seats Avail',
        fullLabel: 'Seats Available',
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
      };
  }
}

/**
 * LTA DataMall Bus Vehicle Types:
 * SD = Single Deck
 * DD = Double Deck
 * BD = Bendy Bus
 */
export function formatType(typeCode) {
  switch (typeCode) {
    case 'SD':
      return {
        code: 'SD',
        label: 'Single Deck',
        short: '1-Deck'
      };
    case 'DD':
      return {
        code: 'DD',
        label: 'Double Deck',
        short: 'Double Deck'
      };
    case 'BD':
      return {
        code: 'BD',
        label: 'Bendy Bus',
        short: 'Bendy'
      };
    default:
      return {
        code: typeCode || '',
        label: 'Single Deck',
        short: '1-Deck'
      };
  }
}

/**
 * Haversine formula to compute great-circle distance in meters between two lat/lng coordinates
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    return 99999999;
  }
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters) {
  if (meters === undefined || meters === null || meters > 500000) {
    return 'Distance unavailable';
  }
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Find the nearest bus stops to given GPS coordinates
 */
export function findNearestBusStops(userLat, userLng, limit = 5, pool = KNOWN_BUS_STOPS) {
  if (typeof userLat !== 'number' || typeof userLng !== 'number') {
    return [];
  }

  const stopsWithDist = pool.map(stop => {
    const sLat = typeof stop.lat === 'number' ? stop.lat : parseFloat(stop.latitude);
    const sLng = typeof stop.lng === 'number' ? stop.lng : parseFloat(stop.longitude);
    const dist = calculateDistanceMeters(userLat, userLng, sLat, sLng);
    return {
      ...stop,
      lat: sLat,
      lng: sLng,
      distanceMeters: dist,
      distanceText: formatDistance(dist)
    };
  });

  stopsWithDist.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return stopsWithDist.slice(0, limit);
}

