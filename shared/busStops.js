/**
 * Singapore Bus Stops metadata and LTA DataMall formatting helpers
 */

export const KNOWN_BUS_STOPS = [
  // SMU / Bras Basah / Dhoby Ghaut
  { code: '04121', name: 'SMU', road: 'Stamford Rd', description: 'Outside Singapore Management University' },
  { code: '04168', name: 'Cosmic Insurance Bldg / SMU', road: 'Bras Basah Rd', description: 'Opposite SMU Campus' },
  { code: '08057', name: 'Dhoby Ghaut Stn Exit B', road: 'Orchard Rd', description: 'Dhoby Ghaut MRT interchange' },
  { code: '08031', name: 'Dhoby Ghaut Stn', road: 'Penang Rd', description: 'Penang Road near Dhoby Ghaut' },
  { code: '01012', name: 'Hotel Rendezvous', road: 'Bras Basah Rd', description: 'Near Bencoolen MRT' },
  { code: '01013', name: 'Bencoolen Stn Exit B', road: 'Bencoolen St', description: 'Downtown Line Bencoolen' },
  { code: '04179', name: 'Bras Basah Cplx', road: 'Victoria St', description: 'Near Bras Basah Complex' },

  // Hill Street / City Hall / Clarke Quay
  { code: '04223', name: 'Old Hill St Police Stn', road: 'Hill St', description: 'Outside former Hill St Police Station' },
  { code: '04229', name: 'Opp Old Hill St Police Stn', road: 'Hill St', description: 'Opposite Hill St Police Station' },
  { code: '04111', name: 'National Library', road: 'Victoria St', description: 'National Library Building' },
  { code: '03019', name: 'Opp Clarke Quay Stn', road: 'Eu Tong Sen St', description: 'Near Clarke Quay Central' },
  { code: '03059', name: 'Clarke Quay Stn Exit E', road: 'New Bridge Rd', description: 'Clarke Quay North East Line' },
  { code: '04149', name: 'St. Andrew\'s Cath', road: 'North Bridge Rd', description: 'City Hall MRT' },
  { code: '03223', name: 'Raffles Hotel', road: 'Bras Basah Rd', description: 'Historic Raffles Hotel' },

  // Bugis / Rochor
  { code: '01112', name: 'Bugis Stn Exit D', road: 'Rochor Rd', description: 'Bugis MRT interchange' },
  { code: '04119', name: 'Bugis Stn Exit A', road: 'Victoria St', description: 'Bugis Junction' },
  { code: '01519', name: 'The Verge', road: 'Serangoon Rd', description: 'Little India' },

  // Orchard / Somerset
  { code: '09048', name: 'Midpoint Orchard', road: 'Orchard Rd', description: 'Orchard shopping belt' },
  { code: '09037', name: 'Opp 313@Somerset', road: 'Orchard Rd', description: 'Somerset MRT' },
  { code: '09022', name: 'Orchard Stn / Lucky Plaza', road: 'Orchard Rd', description: 'Orchard MRT Exit D' },
  { code: '09023', name: 'Orchard Stn / Tangs', road: 'Orchard Blvd', description: 'Orchard MRT Exit A' },
  { code: '10169', name: 'Orchard Plaza', road: 'Orchard Rd', description: 'Near Somerset' },

  // Marina Bay / Raffles Place / Tanjong Pagar
  { code: '02049', name: 'Raffles Place Stn Exit F', road: 'Robinson Rd', description: 'Central Business District' },
  { code: '03509', name: 'The Sail', road: 'Marina Blvd', description: 'Downtown MRT / Marina Bay' },
  { code: '03511', name: 'Marina Bay Sands Hotel', road: 'Bayfront Ave', description: 'Bayfront MRT' },
  { code: '05411', name: 'Opp Sri Mariamman Tp', road: 'South Bridge Rd', description: 'Chinatown heritage area' },
  { code: '05013', name: 'Chinatown Stn Exit E', road: 'Eu Tong Sen St', description: 'Chinatown Point' },
  { code: '03129', name: 'Opp The Treasury', road: 'High St', description: 'Civil District / Parliament' },

  // East / West / North Hubs
  { code: '83139', name: 'Parkway Parade', road: 'Marine Parade Rd', description: 'Marine Parade Central' },
  { code: '84039', name: 'Bedok Stn Exit B', road: 'New Upper Changi Rd', description: 'Bedok Town Centre' },
  { code: '76199', name: 'Tampines Stn / Int', road: 'Tampines Ave 4', description: 'Tampines MRT & Hub' },
  { code: '28009', name: 'Jurong East Int', road: 'Jurong Gateway Rd', description: 'Jurong East Bus Interchange' },
  { code: '46009', name: 'Woodlands Temp Int', road: 'Woodlands Sq', description: 'Woodlands MRT & Interchange' },
  { code: '59009', name: 'Yishun Int', road: 'Yishun Ave 2', description: 'Northpoint City / Yishun' },
  { code: '64009', name: 'Ang Mo Kio Int', road: 'Ang Mo Kio Ave 8', description: 'AMK Hub / Interchange' }
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
