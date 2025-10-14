import type { BucketlistItem } from '@/types';

/**
 * Get coordinates for a bucketlist item based on its location data
 * @param item - The bucketlist item with location information
 * @returns [latitude, longitude] coordinates
 */
export const getCoordinates = (item: BucketlistItem): [number, number] => {
  const country = item.country?.toLowerCase() || '';
  const state = item.state?.toLowerCase() || '';
  const city = item.city?.toLowerCase() || '';
  
  // More accurate coordinate mapping
  if (country.includes('united states') || country.includes('usa') || country.includes('us')) {
    // US States with major cities
    if (state.includes('california') || state.includes('ca')) {
      if (city.includes('los angeles') || city.includes('la')) return [34.0522, -118.2437]; // Los Angeles
      if (city.includes('san francisco') || city.includes('sf')) return [37.7749, -122.4194]; // San Francisco
      if (city.includes('san diego')) return [32.7157, -117.1611]; // San Diego
      return [36.7783, -119.4179]; // Center of California
    }
    if (state.includes('new york') || state.includes('ny')) {
      if (city.includes('new york') || city.includes('nyc')) return [40.7128, -74.0060]; // New York City
      if (city.includes('buffalo')) return [42.8864, -78.8784]; // Buffalo
      return [42.1657, -74.9481]; // Center of New York
    }
    if (state.includes('florida') || state.includes('fl')) {
      if (city.includes('miami')) return [25.7617, -80.1918]; // Miami
      if (city.includes('orlando')) return [28.5383, -81.3792]; // Orlando
      if (city.includes('tampa')) return [27.9506, -82.4572]; // Tampa
      return [27.7663, -82.6404]; // Center of Florida
    }
    if (state.includes('texas') || state.includes('tx')) {
      if (city.includes('houston')) return [29.7604, -95.3698]; // Houston
      if (city.includes('dallas')) return [32.7767, -96.7970]; // Dallas
      if (city.includes('austin')) return [30.2672, -97.7431]; // Austin
      return [31.9686, -99.9018]; // Center of Texas
    }
    if (state.includes('washington') || state.includes('wa')) {
      if (city.includes('seattle')) return [47.6062, -122.3321]; // Seattle
      if (city.includes('spokane')) return [47.6588, -117.4260]; // Spokane
      return [47.7511, -120.7401]; // Center of Washington
    }
    if (state.includes('illinois') || state.includes('il')) {
      if (city.includes('chicago')) return [41.8781, -87.6298]; // Chicago
      if (city.includes('springfield')) return [39.7817, -89.6501]; // Springfield
      return [40.3363, -89.0022]; // Center of Illinois
    }
    if (state.includes('utah') || state.includes('ut')) {
      if (city.includes('provo')) return [40.2338, -111.6585]; // Provo
      if (city.includes('salt lake city') || city.includes('salt lake')) return [40.7608, -111.8910]; // Salt Lake City
      if (city.includes('ogden')) return [41.2230, -111.9738]; // Ogden
      if (city.includes('st. george') || city.includes('st george')) return [37.0965, -113.5684]; // St. George
      return [39.3200, -111.0937]; // Center of Utah
    }
    if (state.includes('kansas') || state.includes('ks')) {
      if (city.includes('wichita')) return [37.6872, -97.3301]; // Wichita
      if (city.includes('kansas city')) return [39.1142, -94.6275]; // Kansas City
      if (city.includes('topeka')) return [39.0558, -95.6890]; // Topeka
      return [38.5266, -96.7265]; // Center of Kansas
    }
    if (state.includes('colorado') || state.includes('co')) {
      if (city.includes('denver')) return [39.7392, -104.9903]; // Denver
      if (city.includes('colorado springs')) return [38.8339, -104.8214]; // Colorado Springs
      if (city.includes('boulder')) return [40.0150, -105.2705]; // Boulder
      return [39.0598, -105.3111]; // Center of Colorado
    }
    if (state.includes('nevada') || state.includes('nv')) {
      if (city.includes('las vegas')) return [36.1699, -115.1398]; // Las Vegas
      if (city.includes('reno')) return [39.5296, -119.8138]; // Reno
      if (city.includes('carson city')) return [39.1638, -119.7674]; // Carson City
      return [38.4199, -117.1219]; // Center of Nevada
    }
    if (state.includes('arizona') || state.includes('az')) {
      if (city.includes('phoenix')) return [33.4484, -112.0740]; // Phoenix
      if (city.includes('tucson')) return [32.2226, -110.9747]; // Tucson
      if (city.includes('flagstaff')) return [35.1983, -111.6513]; // Flagstaff
      return [34.0489, -111.0937]; // Center of Arizona
    }
    if (state.includes('pennsylvania') || state.includes('pa')) {
      if (city.includes('philadelphia')) return [39.9526, -75.1652]; // Philadelphia
      if (city.includes('pittsburgh')) return [40.4406, -79.9959]; // Pittsburgh
      if (city.includes('allentown')) return [40.6084, -75.4901]; // Allentown
      if (city.includes('erie')) return [42.1292, -80.0851]; // Erie
      if (city.includes('reading')) return [40.3356, -75.9269]; // Reading
      return [41.2033, -77.1945]; // Center of Pennsylvania
    }
    if (state.includes('ohio') || state.includes('oh')) {
      if (city.includes('columbus')) return [39.9612, -82.9988]; // Columbus
      if (city.includes('cleveland')) return [41.4993, -81.6944]; // Cleveland
      if (city.includes('cincinnati')) return [39.1031, -84.5120]; // Cincinnati
      if (city.includes('toledo')) return [41.6528, -83.5379]; // Toledo
      return [40.3888, -82.7649]; // Center of Ohio
    }
    if (state.includes('michigan') || state.includes('mi')) {
      if (city.includes('detroit')) return [42.3314, -83.0458]; // Detroit
      if (city.includes('grand rapids')) return [42.9634, -85.6681]; // Grand Rapids
      if (city.includes('warren')) return [42.5145, -83.0147]; // Warren
      if (city.includes('sterling heights')) return [42.5803, -83.0302]; // Sterling Heights
      return [44.3148, -85.6024]; // Center of Michigan
    }
    if (state.includes('indiana') || state.includes('in')) {
      if (city.includes('indianapolis')) return [39.7684, -86.1581]; // Indianapolis
      if (city.includes('fort wayne')) return [41.0793, -85.1394]; // Fort Wayne
      if (city.includes('evansville')) return [37.9748, -87.5558]; // Evansville
      return [39.8494, -86.2583]; // Center of Indiana
    }
    return [39.8283, -98.5795]; // Center of US
  }
  
  // International locations with city-specific coordinates
  if (country.includes('canada')) {
    if (city.includes('toronto')) return [43.6532, -79.3832]; // Toronto
    if (city.includes('vancouver')) return [49.2827, -123.1207]; // Vancouver
    if (city.includes('montreal')) return [45.5017, -73.5673]; // Montreal
    if (city.includes('calgary')) return [51.0447, -114.0719]; // Calgary
    return [56.1304, -106.3468]; // Center of Canada
  }
  
  if (country.includes('mexico')) {
    if (city.includes('mexico city') || city.includes('ciudad de mexico')) return [19.4326, -99.1332]; // Mexico City
    if (city.includes('cancun')) return [21.1619, -86.8515]; // Cancun
    if (city.includes('guadalajara')) return [20.6597, -103.3496]; // Guadalajara
    return [23.6345, -102.5528]; // Center of Mexico
  }
  
  if (country.includes('united kingdom') || country.includes('england') || country.includes('uk')) {
    if (city.includes('london')) return [51.5074, -0.1278]; // London
    if (city.includes('manchester')) return [53.4808, -2.2426]; // Manchester
    if (city.includes('birmingham')) return [52.4862, -1.8904]; // Birmingham
    if (city.includes('edinburgh')) return [55.9533, -3.1883]; // Edinburgh
    return [54.7024, -3.2766]; // Center of UK
  }
  
  if (country.includes('france')) {
    if (city.includes('paris')) return [48.8566, 2.3522]; // Paris
    if (city.includes('lyon')) return [45.7640, 4.8357]; // Lyon
    if (city.includes('marseille')) return [43.2965, 5.3698]; // Marseille
    return [46.2276, 2.2137]; // Center of France
  }
  
  if (country.includes('germany')) {
    if (city.includes('berlin')) return [52.5200, 13.4050]; // Berlin
    if (city.includes('munich') || city.includes('münchen')) return [48.1351, 11.5820]; // Munich
    if (city.includes('hamburg')) return [53.5511, 9.9937]; // Hamburg
    if (city.includes('frankfurt')) return [50.1109, 8.6821]; // Frankfurt
    return [51.1657, 10.4515]; // Center of Germany
  }
  
  if (country.includes('italy')) {
    if (city.includes('rome')) return [41.9028, 12.4964]; // Rome
    if (city.includes('milan') || city.includes('milano')) return [45.4642, 9.1900]; // Milan
    if (city.includes('florence') || city.includes('firenze')) return [43.7696, 11.2558]; // Florence
    if (city.includes('venice') || city.includes('venezia')) return [45.4408, 12.3155]; // Venice
    return [41.8719, 12.5674]; // Center of Italy
  }
  
  if (country.includes('spain')) {
    if (city.includes('madrid')) return [40.4168, -3.7038]; // Madrid
    if (city.includes('barcelona')) return [41.3851, 2.1734]; // Barcelona
    if (city.includes('seville') || city.includes('sevilla')) return [37.3891, -5.9845]; // Seville
    return [40.4637, -3.7492]; // Center of Spain
  }
  
  if (country.includes('japan')) {
    if (city.includes('tokyo')) return [35.6762, 139.6503]; // Tokyo
    if (city.includes('osaka')) return [34.6937, 135.5023]; // Osaka
    if (city.includes('kyoto')) return [35.0116, 135.7681]; // Kyoto
    if (city.includes('yokohama')) return [35.4437, 139.6380]; // Yokohama
    return [36.2048, 138.2529]; // Center of Japan
  }
  
  if (country.includes('china')) {
    if (city.includes('beijing') || city.includes('peking')) return [39.9042, 116.4074]; // Beijing
    if (city.includes('shanghai')) return [31.2304, 121.4737]; // Shanghai
    if (city.includes('guangzhou')) return [23.1291, 113.2644]; // Guangzhou
    if (city.includes('shenzhen')) return [22.5431, 114.0579]; // Shenzhen
    return [35.8617, 104.1954]; // Center of China
  }
  
  if (country.includes('india')) {
    if (city.includes('mumbai') || city.includes('bombay')) return [19.0760, 72.8777]; // Mumbai
    if (city.includes('delhi') || city.includes('new delhi')) return [28.6139, 77.2090]; // Delhi
    if (city.includes('bangalore') || city.includes('bengaluru')) return [12.9716, 77.5946]; // Bangalore
    if (city.includes('kolkata') || city.includes('calcutta')) return [22.5726, 88.3639]; // Kolkata
    return [20.5937, 78.9629]; // Center of India
  }
  
  if (country.includes('australia')) {
    if (city.includes('sydney')) return [-33.8688, 151.2093]; // Sydney
    if (city.includes('melbourne')) return [-37.8136, 144.9631]; // Melbourne
    if (city.includes('brisbane')) return [-27.4698, 153.0251]; // Brisbane
    if (city.includes('perth')) return [-31.9505, 115.8605]; // Perth
    return [-25.2744, 133.7751]; // Center of Australia
  }
  
  if (country.includes('brazil')) {
    if (city.includes('sao paulo') || city.includes('são paulo')) return [-23.5505, -46.6333]; // São Paulo
    if (city.includes('rio de janeiro')) return [-22.9068, -43.1729]; // Rio de Janeiro
    if (city.includes('brasilia') || city.includes('brasília')) return [-15.7801, -47.9292]; // Brasília
    return [-14.2350, -51.9253]; // Center of Brazil
  }
  
  if (country.includes('argentina')) {
    if (city.includes('buenos aires')) return [-34.6118, -58.3960]; // Buenos Aires
    if (city.includes('cordoba') || city.includes('córdoba')) return [-31.4201, -64.1888]; // Córdoba
    return [-38.4161, -63.6167]; // Center of Argentina
  }
  
  if (country.includes('south africa')) {
    if (city.includes('cape town')) return [-33.9249, 18.4241]; // Cape Town
    if (city.includes('johannesburg')) return [-26.2041, 28.0473]; // Johannesburg
    if (city.includes('durban')) return [-29.8587, 31.0218]; // Durban
    return [-30.5595, 22.9375]; // Center of South Africa
  }
  
  // Default to center of world if location not recognized (better than random)
  return [0, 0];
};

/**
 * Get a location key for grouping items by location
 * @param item - The bucketlist item
 * @returns A unique key for the location
 */
export const getLocationKey = (item: BucketlistItem): string => {
  return `${item.city || ''}-${item.state || ''}-${item.country || ''}`.toLowerCase();
};

/**
 * Group items by location
 * @param items - Array of bucketlist items
 * @returns Object with location keys and arrays of items
 */
export const groupItemsByLocation = (items: BucketlistItem[]): Record<string, BucketlistItem[]> => {
  const groups: Record<string, BucketlistItem[]> = {};
  
  items.forEach(item => {
    const locationKey = getLocationKey(item);
    if (!groups[locationKey]) {
      groups[locationKey] = [];
    }
    groups[locationKey].push(item);
  });
  
  return groups;
};

/**
 * Get items in the same location as the given item
 * @param items - Array of all bucketlist items
 * @param targetItem - The item to find matches for
 * @returns Array of items in the same location
 */
export const getItemsInSameLocation = (items: BucketlistItem[], targetItem: BucketlistItem): BucketlistItem[] => {
  const targetLocationKey = getLocationKey(targetItem);
  return items.filter(item => getLocationKey(item) === targetLocationKey);
};

/**
 * Calculate offset coordinates for multiple items in the same location
 * @param baseCoords - Base coordinates [lat, lng]
 * @param itemIndex - Index of the item (0-based)
 * @param totalItems - Total number of items in the location
 * @param offsetDistance - Distance to offset in degrees (default: 0.01)
 * @returns Adjusted coordinates [lat, lng]
 */
export const calculateOffsetCoordinates = (
  baseCoords: [number, number],
  itemIndex: number,
  totalItems: number,
  offsetDistance: number = 0.01
): [number, number] => {
  const angle = (itemIndex * 2 * Math.PI) / totalItems;
  const offsetLat = Math.cos(angle) * offsetDistance;
  const offsetLng = Math.sin(angle) * offsetDistance;
  
  return [
    baseCoords[0] + offsetLat,
    baseCoords[1] + offsetLng
  ];
};
