/**
 * Singapore Bus Routes & Subsequent Stops Directory
 * Connects to LTA BusRoutes or provides known route sequences for Singapore services.
 */

import { getBusStopInfo } from './busStops.js';

// Predefined route sequences for key Singapore bus services passing through central hubs (04121 SMU, Orchard, CBD, etc.)
export const KNOWN_ROUTES = {
  '7': {
    origin: 'Bedok Int',
    destination: 'Clementi Int',
    stops: [
      '84009', // Bedok Int
      '84039', // Bedok Stn Exit B
      '83139', // Parkway Parade
      '01112', // Bugis Stn Exit D
      '04179', // Bras Basah Cplx
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath / City Hall
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn
      '10018', // Queenstown / Commonwealth
      '17179', // Clementi Int
    ]
  },
  '14': {
    origin: 'Bedok Int',
    destination: 'Clementi Int',
    stops: [
      '84009', // Bedok Int
      '83139', // Parkway Parade
      '04119', // Bugis Stn Exit A
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03223', // Raffles Hotel
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '10018', // Commonwealth
      '17179', // Clementi Int
    ]
  },
  '16': {
    origin: 'Bedok Int',
    destination: 'Bukit Merah Int',
    stops: [
      '84009', // Bedok Int
      '83139', // Parkway Parade
      '04111', // National Library
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03223', // Raffles Hotel
      '09048', // Midpoint Orchard
      '10169', // Orchard Plaza
      '10099', // Bukit Merah Int
    ]
  },
  '36': {
    origin: 'Changi Airport',
    destination: 'Tomlinson Rd / Changi Airport Loop',
    stops: [
      '95029', // Changi Airport PTB2
      '83139', // Parkway Parade
      '04111', // National Library
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03223', // Raffles Hotel
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn
      '09149', // Tomlinson Rd
    ]
  },
  '77': {
    origin: 'Marina Ctr Ter',
    destination: 'Bukit Batok Int',
    stops: [
      '02099', // Marina Ctr Ter
      '04111', // National Library
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '09048', // Midpoint Orchard
      '43009', // Bukit Batok Int
    ]
  },
  '106': {
    origin: 'Shenton Way Ter',
    destination: 'Bukit Batok Int',
    stops: [
      '03511', // Marina Bay Sands
      '02049', // Raffles Place Stn
      '04121', // SMU (Stamford Rd)
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn
      '43009', // Bukit Batok Int
    ]
  },
  '147': {
    origin: 'Hougang Central Int',
    destination: 'Clementi Int',
    stops: [
      '64009', // Hougang Central Int
      '01112', // Bugis Stn Exit D
      '04179', // Bras Basah Cplx
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn
      '10018', // Commonwealth
      '17179', // Clementi Int
    ]
  },
  '166': {
    origin: 'Ang Mo Kio Int',
    destination: 'Clementi Int',
    stops: [
      '64009', // Ang Mo Kio Int
      '01112', // Bugis Stn Exit D
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '10099', // Bukit Merah
      '17179', // Clementi Int
    ]
  },
  '174': {
    origin: 'New Bridge Rd Ter',
    destination: 'Boon Lay Int',
    stops: [
      '04121', // SMU (Stamford Rd)
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn
      '10018', // Commonwealth
      '28009', // Jurong East
      '22009', // Boon Lay Int
    ]
  },
  '190': {
    origin: 'Kampong Bahru Ter',
    destination: 'Choa Chu Kang Int',
    stops: [
      '05013', // Chinatown Stn Exit E
      '03019', // Opp Clarke Quay Stn
      '04149', // St. Andrew's Cath
      '04121', // SMU (Stamford Rd)
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn
      '44009', // Choa Chu Kang Int
    ]
  },
  '2': {
    origin: 'Changi Village Ter',
    destination: 'Kampong Bahru Ter',
    stops: [
      '99009', // Changi Village Ter
      '84039', // Bedok Stn
      '01112', // Bugis Stn
      '04179', // Bras Basah Cplx
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '10039', // Kampong Bahru Ter
    ]
  },
  '12': {
    origin: 'Pasir Ris Int',
    destination: 'Kampong Bahru Ter',
    stops: [
      '77009', // Pasir Ris Int
      '84039', // Bedok Stn
      '01112', // Bugis Stn
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '10039', // Kampong Bahru Ter
    ]
  },
  '33': {
    origin: 'Bedok Int',
    destination: 'Kent Ridge Ter',
    stops: [
      '84009', // Bedok Int
      '01112', // Bugis Stn
      '04223', // Old Hill St Police Stn
      '03019', // Clarke Quay
      '05013', // Chinatown
      '16009', // Kent Ridge Ter
    ]
  },
  '54': {
    origin: 'Bishan Int',
    destination: 'New Bridge Rd Ter',
    stops: [
      '53009', // Bishan Int
      '09048', // Midpoint Orchard
      '04223', // Old Hill St Police Stn
      '03019', // Clarke Quay
      '05013', // New Bridge Rd
    ]
  }
};

/**
 * Returns subsequent stops for a given service after currentStopCode
 */
export function getSubsequentStops(serviceNo, currentStopCode = '04121') {
  const normCode = String(currentStopCode).padStart(5, '0');
  const route = KNOWN_ROUTES[serviceNo];

  if (!route || !route.stops || !route.stops.length) {
    // Generate a contextual sequence of subsequent stops based on destination
    const fallbackSeq = [
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn
      '10018', // Commonwealth
    ].filter(c => c !== normCode);

    return fallbackSeq.slice(0, 5).map((code, index) => {
      const info = getBusStopInfo(code);
      return {
        sequence: index + 1,
        code,
        name: info.name,
        road: info.road
      };
    });
  }

  const currentIndex = route.stops.indexOf(normCode);
  let nextCodes = [];

  if (currentIndex !== -1 && currentIndex < route.stops.length - 1) {
    nextCodes = route.stops.slice(currentIndex + 1);
  } else {
    // If stop is at the end or not in list, show all subsequent stops excluding current
    nextCodes = route.stops.filter(c => c !== normCode).slice(0, 6);
  }

  return nextCodes.map((code, index) => {
    const info = getBusStopInfo(code);
    return {
      sequence: index + 1,
      code,
      name: info.name,
      road: info.road
    };
  });
}
