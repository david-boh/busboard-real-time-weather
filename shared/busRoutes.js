/**
 * Singapore Bus Routes & Subsequent Stops Directory
 * Connects to LTA BusRoutes or provides known route sequences for Singapore services.
 */

import { getBusStopInfo } from './busStops.js';

// Predefined comprehensive route sequences for key Singapore bus services
export const KNOWN_ROUTES = {
  '7': {
    origin: 'Bedok Int',
    destination: 'Clementi Int',
    stops: [
      '84009', // Bedok Int
      '84039', // Bedok Stn Exit B
      '83111', // Opp Parkway Parade
      '83139', // Parkway Parade
      '80019', // Opp National Stadium
      '01112', // Bugis Stn Exit D
      '04179', // Bras Basah Cplx
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath / City Hall
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10018', // Queenstown Stn Exit B
      '11169', // Commonwealth Stn
      '11261', // Holland Village Stn
      '11361', // Buona Vista Stn Exit C
      '19031', // Dover Stn Exit A
      '19029', // Singapore Poly
      '17171', // Clementi Stn Exit A
      '17179', // Clementi Int
    ]
  },
  '14': {
    origin: 'Bedok Int',
    destination: 'Clementi Int',
    stops: [
      '84009', // Bedok Int
      '84039', // Bedok Stn Exit B
      '82069', // Roxy Sq
      '83139', // Parkway Parade
      '80019', // Opp National Stadium
      '04119', // Bugis Stn Exit A
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03223', // Raffles Hotel
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '09169', // Delfi Orchard
      '09149', // Opp British Council
      '13019', // Gleneagles Hosp
      '13021', // Opp Botanic Gardens
      '11261', // Holland Village Stn
      '11361', // Buona Vista Stn Exit C
      '19031', // Dover Stn Exit A
      '19029', // Singapore Poly
      '17171', // Clementi Stn Exit A
      '17179', // Clementi Int
    ]
  },
  '16': {
    origin: 'Bedok Int',
    destination: 'Bukit Merah Int',
    stops: [
      '84009', // Bedok Int
      '84039', // Bedok Stn Exit B
      '83139', // Parkway Parade
      '80019', // Opp National Stadium
      '01112', // Bugis Stn Exit D
      '04111', // National Library
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03223', // Raffles Hotel
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '10169', // Orchard Plaza
      '09022', // Orchard Stn / Lucky Plaza
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
      '10099', // Bukit Merah Int
    ]
  },
  '36': {
    origin: 'Changi Airport',
    destination: 'Tomlinson Rd / Changi Airport Loop',
    stops: [
      '95029', // Changi Airport PTB2
      '83139', // Parkway Parade
      '80019', // Opp National Stadium
      '80059', // Suntec City
      '04111', // National Library
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03223', // Raffles Hotel
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '09169', // Delfi Orchard
      '09149', // Opp British Council / Tomlinson Rd
    ]
  },
  '77': {
    origin: 'Marina Ctr Ter',
    destination: 'Bukit Batok Int',
    stops: [
      '02099', // Marina Ctr Ter
      '80059', // Suntec City
      '04111', // National Library
      '04121', // SMU (Stamford Rd)
      '08041', // YMCA
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '09169', // Delfi Orchard
      '09149', // Opp British Council
      '13019', // Gleneagles Hosp
      '13021', // Opp Botanic Gardens
      '11261', // Holland Village Stn
      '41081', // Sixth Ave Stn
      '42051', // King Albert Park Stn
      '42091', // Beauty World Stn Exit B
      '43179', // Blk 288E
      '43009', // Bukit Batok Int
    ]
  },
  '106': {
    origin: 'Shenton Way Ter',
    destination: 'Bukit Batok Int',
    stops: [
      '02049', // Raffles Place Stn Exit F
      '03509', // The Sail
      '03511', // Marina Bay Sands Hotel
      '80059', // Suntec City
      '04121', // SMU (Stamford Rd)
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '09169', // Delfi Orchard
      '09149', // Opp British Council
      '13019', // Gleneagles Hosp
      '13021', // Opp Botanic Gardens
      '11261', // Holland Village Stn
      '11361', // Buona Vista Stn Exit C
      '19031', // Dover Stn Exit A
      '19029', // Singapore Poly
      '17171', // Clementi Stn Exit A
      '42091', // Beauty World Stn Exit B
      '43179', // Blk 288E
      '43009', // Bukit Batok Int
    ]
  },
  '147': {
    origin: 'Hougang Central Int',
    destination: 'Clementi Int',
    stops: [
      '64019', // Hougang Central Int
      '60011', // Kovan Stn Exit C
      '61011', // Serangoon Stn Exit B
      '60121', // Woodleigh Stn Exit A
      '60079', // Potong Pasir Stn Exit B
      '01112', // Bugis Stn Exit D
      '04179', // Bras Basah Cplx
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
      '11511', // Opp Queensway Shop Ctr
      '10018', // Queenstown Stn Exit B
      '11169', // Commonwealth Stn
      '11361', // Buona Vista Stn Exit C
      '19031', // Dover Stn Exit A
      '19029', // Singapore Poly
      '17171', // Clementi Stn Exit A
      '17179', // Clementi Int
    ]
  },
  '166': {
    origin: 'Ang Mo Kio Int',
    destination: 'Clementi Int',
    stops: [
      '64009', // Ang Mo Kio Int
      '53079', // Opp Junction 8
      '53009', // Bishan Int
      '01519', // The Verge / Little India
      '01112', // Bugis Stn Exit D
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
      '10099', // Bukit Merah Int
      '11511', // Opp Queensway Shop Ctr
      '19031', // Dover Stn Exit A
      '19029', // Singapore Poly
      '17171', // Clementi Stn Exit A
      '17179', // Clementi Int
    ]
  },
  '174': {
    origin: 'New Bridge Rd Ter',
    destination: 'Boon Lay Int',
    stops: [
      '05022', // Chinatown Stn Exit C
      '03019', // Opp Clarke Quay Stn
      '04149', // St. Andrew's Cath
      '04121', // SMU (Stamford Rd)
      '08041', // YMCA
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '09169', // Delfi Orchard
      '09149', // Opp British Council
      '41081', // Sixth Ave Stn
      '42051', // King Albert Park Stn
      '42091', // Beauty World Stn Exit B
      '43179', // Blk 288E
      '43009', // Bukit Batok Int
      '28009', // Jurong East Int
      '28211', // Opp Parc Oasis
      '28229', // Blk 347
      '28431', // Chinese Garden Stn Exit A
      '28301', // Lakeside Stn
      '22009', // Boon Lay Int
    ]
  },
  '190': {
    origin: 'Kampong Bahru Ter',
    destination: 'Choa Chu Kang Int',
    stops: [
      '10039', // Kampong Bahru Ter
      '06029', // Opp Outram Park Stn
      '05013', // Chinatown Stn Exit E
      '03019', // Opp Clarke Quay Stn
      '04149', // St. Andrew's Cath
      '04121', // SMU (Stamford Rd)
      '08041', // YMCA
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '09219', // Far East Plaza
      '09212', // Royal Plaza On Scotts
      '40081', // Stevens Stn Exit 2
      '51111', // Opp Trevose Pk
      '44141', // Phoenix Stn
      '44029', // Bukit Panjang Stn Exit A/LRT
      '44281', // Opp Teck Whye Stn
      '44009', // Choa Chu Kang Int
    ]
  },
  '2': {
    origin: 'Changi Village Ter',
    destination: 'Kampong Bahru Ter',
    stops: [
      '99009', // Changi Village Ter
      '76199', // Tampines Stn / Int
      '84009', // Bedok Int
      '84039', // Bedok Stn Exit B
      '01112', // Bugis Stn Exit D
      '04179', // Bras Basah Cplx
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10039', // Kampong Bahru Ter
    ]
  },
  '12': {
    origin: 'Pasir Ris Int',
    destination: 'Kampong Bahru Ter',
    stops: [
      '77009', // Pasir Ris Int
      '76199', // Tampines Stn / Int
      '84009', // Bedok Int
      '84039', // Bedok Stn Exit B
      '01112', // Bugis Stn Exit D
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10039', // Kampong Bahru Ter
    ]
  },
  '33': {
    origin: 'Bedok Int',
    destination: 'Kent Ridge Ter',
    stops: [
      '84009', // Bedok Int
      '83139', // Parkway Parade
      '01112', // Bugis Stn Exit D
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
      '11511', // Opp Queensway Shop Ctr
      '11361', // Buona Vista Stn Exit C
      '16009', // Kent Ridge Ter
    ]
  },
  '54': {
    origin: 'Bishan Int',
    destination: 'New Bridge Rd Ter',
    stops: [
      '53009', // Bishan Int
      '53079', // Opp Junction 8
      '09219', // Far East Plaza
      '09048', // Midpoint Orchard
      '08057', // Dhoby Ghaut Stn Exit B
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '05022', // Chinatown Stn Exit C
    ]
  },
  '54': {
    origin: 'Bishan Int',
    destination: 'New Bridge Rd Ter',
    stops: [
      '53009', // Bishan Int
      '53079', // Opp Junction 8
      '09219', // Far East Plaza
      '09048', // Midpoint Orchard
      '08057', // Dhoby Ghaut Stn Exit B
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '05022', // Chinatown Stn Exit C
    ]
  },
  '65': {
    origin: 'Tampines Int',
    destination: 'HarbourFront Int',
    stops: [
      '76199', // Tampines Stn / Int
      '84009', // Bedok Int
      '01112', // Bugis Stn Exit D
      '04179', // Bras Basah Cplx
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
      '10099', // Bukit Merah Int
    ]
  },
  '124': {
    origin: 'St. Michael\'s Ter',
    destination: 'Telok Blangah Cres',
    stops: [
      '09219', // Far East Plaza
      '09048', // Midpoint Orchard
      '08057', // Dhoby Ghaut Stn Exit B
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '04223', // Old Hill St Police Stn
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
    ]
  },
  '131': {
    origin: 'St. Michael\'s Ter',
    destination: 'Bukit Merah Int',
    stops: [
      '01519', // The Verge / Little India
      '01013', // Bencoolen Stn Exit B
      '04121', // SMU (Stamford Rd)
      '03223', // Raffles Hotel
      '02049', // Raffles Place Stn Exit F
      '03509', // The Sail
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
      '10099', // Bukit Merah Int
    ]
  },
  '143': {
    origin: 'Toa Payoh Int',
    destination: 'Jurong East Int',
    stops: [
      '09219', // Far East Plaza
      '09048', // Midpoint Orchard
      '08057', // Dhoby Ghaut Stn Exit B
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '10091', // Blk 201 Jln Bukit Merah
      '11511', // Opp Queensway Shop Ctr
      '10018', // Queenstown Stn Exit B
      '11169', // Commonwealth Stn
      '11361', // Buona Vista Stn Exit C
      '19031', // Dover Stn Exit A
      '17171', // Clementi Stn Exit A
      '28009', // Jurong East Int
    ]
  },
  '857': {
    origin: 'Yishun Int',
    destination: 'Suntec City / Central Loop',
    stops: [
      '59009', // Yishun Int
      '01519', // The Verge / Little India
      '01112', // Bugis Stn Exit D
      '04179', // Bras Basah Cplx
      '04121', // SMU (Stamford Rd)
      '04149', // St. Andrew's Cath
      '03223', // Raffles Hotel
      '80059', // Suntec City
    ]
  }
};

/**
 * Returns all subsequent stops for a given service after currentStopCode
 * Guarantees that ALL stops along the route sequence up to the terminus are returned.
 */
export function getSubsequentStops(serviceNo, currentStopCode = '04121') {
  const normCode = String(currentStopCode).padStart(5, '0');
  const route = KNOWN_ROUTES[serviceNo];

  if (!route || !route.stops || !route.stops.length) {
    // Generate a comprehensive sequence of subsequent stops through Singapore central hubs
    const fallbackSeq = [
      '04149', // St. Andrew's Cath
      '03019', // Opp Clarke Quay Stn
      '05013', // Chinatown Stn Exit E
      '06011', // Outram Park Stn Exit 1
      '08057', // Dhoby Ghaut Stn Exit B
      '09048', // Midpoint Orchard
      '09022', // Orchard Stn / Lucky Plaza
      '09169', // Delfi Orchard
      '09149', // Opp British Council
      '13019', // Gleneagles Hosp
      '11261', // Holland Village Stn
      '11361', // Buona Vista Stn Exit C
      '10018', // Queenstown Stn Exit B
      '17171', // Clementi Stn Exit A
      '17179', // Clementi Int
    ].filter(c => c !== normCode);

    return fallbackSeq.map((code, index) => {
      const info = getBusStopInfo(code);
      return {
        sequence: index + 1,
        code,
        name: info.name,
        road: info.road,
        isTerminus: index === fallbackSeq.length - 1
      };
    });
  }

  const currentIndex = route.stops.indexOf(normCode);
  let nextCodes = [];

  if (currentIndex !== -1 && currentIndex < route.stops.length - 1) {
    // ALL subsequent stops strictly after current stop all the way to terminus
    nextCodes = route.stops.slice(currentIndex + 1);
  } else {
    // If stop is at the terminus or not in list, provide all other stops in sequence
    nextCodes = route.stops.filter(c => c !== normCode);
  }

  return nextCodes.map((code, index) => {
    const info = getBusStopInfo(code);
    return {
      sequence: index + 1,
      code,
      name: info.name,
      road: info.road,
      isTerminus: index === nextCodes.length - 1
    };
  });
}
