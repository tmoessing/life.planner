import { useState, useEffect } from 'react';
import type { BucketlistItem } from '@/types';

interface SimpleBucketlistMapProps {
  items: BucketlistItem[];
}

// Get coordinates for each location
const getCoordinates = (item: BucketlistItem): [number, number] => {
  const country = item.country?.toLowerCase() || '';
  const state = item.state?.toLowerCase() || '';
  const city = item.city?.toLowerCase() || '';
  
  // More accurate coordinate mapping
  if (country.includes('united states') || country.includes('usa')) {
    if (state.includes('california')) return [34.0522, -118.2437]; // Los Angeles
    if (state.includes('new york')) return [40.7128, -74.0060]; // New York City
    if (state.includes('florida')) return [25.7617, -80.1918]; // Miami
    if (state.includes('texas')) return [29.7604, -95.3698]; // Houston
    if (state.includes('washington')) return [47.6062, -122.3321]; // Seattle
    if (state.includes('illinois')) return [41.8781, -87.6298]; // Chicago
    return [39.8283, -98.5795]; // Center of US
  }
  
  if (country.includes('canada')) return [56.1304, -106.3468]; // Center of Canada
  if (country.includes('mexico')) return [23.6345, -102.5528]; // Center of Mexico
  if (country.includes('united kingdom') || country.includes('england')) return [51.5074, -0.1278]; // London
  if (country.includes('france')) return [48.8566, 2.3522]; // Paris
  if (country.includes('germany')) return [51.1657, 10.4515]; // Berlin
  if (country.includes('italy')) return [41.8719, 12.5674]; // Rome
  if (country.includes('spain')) return [40.4637, -3.7492]; // Madrid
  if (country.includes('japan')) return [35.6762, 139.6503]; // Tokyo
  if (country.includes('china')) return [35.8617, 104.1954]; // Beijing
  if (country.includes('india')) return [20.5937, 78.9629]; // New Delhi
  if (country.includes('australia')) return [-25.2744, 133.7751]; // Sydney
  if (country.includes('brazil')) return [-14.2350, -51.9253]; // Brasília
  if (country.includes('argentina')) return [-38.4161, -63.6167]; // Buenos Aires
  if (country.includes('south africa')) return [-30.5595, 22.9375]; // Cape Town
  
  // Default to center of world if location not recognized (better than random)
  return [0, 0];
};

export function SimpleBucketlistMap({ items }: SimpleBucketlistMapProps) {
  const [selectedItem, setSelectedItem] = useState<BucketlistItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter only location items
  const locationItems = items.filter(item => item.bucketlistType === 'location');
  
  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Demo data for testing if no items exist
  const demoItems: BucketlistItem[] = [
    {
      id: 'demo-1',
      title: 'Visit Paris, France',
      description: 'See the Eiffel Tower and explore the city of lights',
      bucketlistType: 'location',
      country: 'France',
      city: 'Paris',
      completed: false,
      priority: 'high',
      status: 'in-progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo-2', 
      title: 'Explore Tokyo, Japan',
      description: 'Experience Japanese culture and cuisine',
      bucketlistType: 'location',
      country: 'Japan',
      city: 'Tokyo',
      completed: true,
      priority: 'medium',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo-3',
      title: 'Visit New York City',
      description: 'See Times Square and Central Park',
      bucketlistType: 'location',
      country: 'United States',
      state: 'New York',
      city: 'New York City',
      completed: false,
      priority: 'high',
      status: 'in-progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  // Use demo data if no real items exist
  const displayItems = locationItems.length > 0 ? locationItems : demoItems;
  
  if (isLoading) {
    return (
      <div className="h-96 w-full rounded-lg overflow-hidden border shadow-lg bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🗺️</div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Demo Notice - only show if using demo data */}
      {locationItems.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-blue-600">ℹ️</div>
            <h3 className="text-sm font-semibold text-blue-800">Demo Mode</h3>
          </div>
          <p className="text-xs text-blue-700">
            Showing sample locations. Add your own location-type bucketlist items to see them on the map!
          </p>
        </div>
      )}
      
      {/* Interactive Map with Real Map Background */}
      <div className="h-96 w-full rounded-lg overflow-hidden border shadow-lg relative bg-gradient-to-br from-blue-100 via-blue-50 to-green-100">
        {/* World Map Background */}
        <div className="absolute inset-0 opacity-30">
          {/* Simplified world map using SVG */}
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
            {/* World map outline */}
            <path d="M50,50 L100,45 L150,50 L200,55 L250,50 L300,45 L350,50 L350,150 L300,155 L250,150 L200,155 L150,150 L100,155 L50,150 Z" 
                  fill="none" stroke="#4A5568" strokeWidth="1" opacity="0.3"/>
            
            {/* Continents */}
            <circle cx="80" cy="60" r="15" fill="#E2E8F0" opacity="0.4"/>
            <circle cx="200" cy="70" r="20" fill="#E2E8F0" opacity="0.4"/>
            <circle cx="320" cy="80" r="12" fill="#E2E8F0" opacity="0.4"/>
            <circle cx="120" cy="140" r="18" fill="#E2E8F0" opacity="0.4"/>
            <circle cx="280" cy="130" r="14" fill="#E2E8F0" opacity="0.4"/>
            
            {/* Grid lines */}
            <line x1="0" y1="50" x2="400" y2="50" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.3"/>
            <line x1="0" y1="100" x2="400" y2="100" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.3"/>
            <line x1="0" y1="150" x2="400" y2="150" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.3"/>
            <line x1="100" y1="0" x2="100" y2="200" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.3"/>
            <line x1="200" y1="0" x2="200" y2="200" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.3"/>
            <line x1="300" y1="0" x2="300" y2="200" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.3"/>
          </svg>
          
          {/* Continent labels */}
          <div className="absolute top-12 left-16 text-xs font-medium text-gray-600 opacity-60">North America</div>
          <div className="absolute top-16 right-20 text-xs font-medium text-gray-600 opacity-60">Europe</div>
          <div className="absolute top-20 right-8 text-xs font-medium text-gray-600 opacity-60">Asia</div>
          <div className="absolute bottom-16 left-20 text-xs font-medium text-gray-600 opacity-60">South America</div>
          <div className="absolute bottom-12 right-16 text-xs font-medium text-gray-600 opacity-60">Australia</div>
        </div>
        
        {/* Map Grid Lines */}
        <div className="absolute inset-0 opacity-10">
          {/* Horizontal lines */}
          <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-400"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400"></div>
          <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-400"></div>
          {/* Vertical lines */}
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-400"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-400"></div>
        </div>
        
        {/* Location markers positioned on the map */}
        <div className="absolute inset-0">
          {displayItems.map((item, index) => {
            const coords = getCoordinates(item);
            // Convert coordinates to percentage positions for display
            const x = ((coords[1] + 180) / 360) * 100; // longitude to x percentage
            const y = ((90 - coords[0]) / 180) * 100; // latitude to y percentage
            
            return (
              <button
                key={item.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-3 border-white shadow-lg transition-all hover:scale-125 hover:z-10 ${
                  item.completed ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
                style={{
                  left: `${Math.max(8, Math.min(92, x))}%`,
                  top: `${Math.max(8, Math.min(92, y))}%`,
                  zIndex: selectedItem?.id === item.id ? 20 : 10,
                }}
                onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                title={`${item.title} - ${item.completed ? 'Completed' : 'In Progress'}`}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                  {item.completed ? '✓' : '●'}
                </div>
                
                {/* Pulse animation for selected item */}
                {selectedItem?.id === item.id && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
        
        {/* Map Title */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-700">Bucketlist Locations</h3>
          <p className="text-xs text-gray-600">
            {displayItems.length} location{displayItems.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      {/* Selected Item Details */}
      {selectedItem && (
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{selectedItem.title}</h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          {selectedItem.description && (
            <p className="text-sm text-muted-foreground mb-3">{selectedItem.description}</p>
          )}
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${selectedItem.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">
              {selectedItem.completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
          {(selectedItem.city || selectedItem.state || selectedItem.country) && (
            <p className="text-xs text-muted-foreground">
              📍 {[selectedItem.city, selectedItem.state, selectedItem.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      )}
      
      {/* Map Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>In Progress ({displayItems.filter(item => !item.completed).length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Completed ({displayItems.filter(item => item.completed).length})</span>
        </div>
      </div>
    </div>
  );
}
