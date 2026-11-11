/**
 * Singapore Bus Stops metadata and LTA DataMall formatting helpers
 */

export const KNOWN_BUS_STOPS = [
  { code: '04121', name: 'SMU', road: 'Stamford Rd', description: 'Outside Singapore Management University' },
  { code: '04223', name: 'Old Hill St Police Stn', road: 'Hill St', description: 'Outside former Hill St Police Station' },
  { code: '04229', name: 'Opp Old Hill St Police Stn', road: 'Hill St', description: 'Opposite Hill St Police Station' },
  { code: '08057', name: 'Dhoby Ghaut Stn Exit B', road: 'Orchard Rd', description: 'Dhoby Ghaut MRT interchange' },
  { code: '08031', name: 'Dhoby Ghaut Stn', road: 'Penang Rd', description: 'At Penang Road' },
  { code: '04179', name: 'Bras Basah Cplx', road: 'Victoria St', description: 'Near Bras Basah Complex' },
  { code: '04168', name: 'Cosmic Insurance Bldg / SMU', road: 'Bras Basah Rd', description: 'Opposite SMU Campus' },
  { code: '01012', name: 'Hotel Rendezvous', road: 'Bras Basah Rd', description: 'Near Bencoolen MRT' },
  { code: '01013', name: 'Bencoolen Stn Exit B', road: 'Bencoolen St', description: 'Bencoolen MRT Downtown Line' },
  { code: '03019', name: 'Opp Clarke Quay Stn', road: 'Eu Tong Sen St', description: 'Near Clarke Quay Central' },
  { code: '03059', name: 'Clarke Quay Stn Exit E', road: 'New Bridge Rd', description: 'Clarke Quay North East Line' },
  { code: '04111', name: 'National Library', road: 'Victoria St', description: 'National Library Building' },
  { code: '01112', name: 'Bugis Stn Exit D', road: 'Rochor Rd', description: 'Bugis MRT interchange' },
  { code: '04119', name: 'Bugis Stn Exit A', road: 'Victoria St', description: 'Bugis Junction' },
  { code: '09048', name: 'Midpoint Orchard', road: 'Orchard Rd', description: 'Orchard shopping belt' },
  { code: '09037', name: 'Opp 313@Somerset', road: 'Orchard Rd', description: 'Somerset MRT' },
  { code: '05013', name: 'Chinatown Stn Exit E', road: 'Eu Tong Sen St', description: 'Chinatown Point' },
  { code: '03223', name: 'Raffles Hotel', road: 'Bras Basah Rd', description: 'Historic Raffles Hotel' },
  { code: '02049', name: 'Raffles Place Stn Exit F', road: 'Robinson Rd', description: 'Central Business District' },
  { code: '83139', name: 'Parkway Parade', road: 'Marine Parade Rd', description: 'Marine Parade Central' }
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
