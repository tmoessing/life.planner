import { useState, useEffect } from 'react';
import type { BucketlistItem } from '@/types';
import { getCoordinates, getLocationKey, getItemsInSameLocation, calculateOffsetCoordinates } from '@/utils/coordinateMapping';

interface SimpleBucketlistMapProps {
  items: BucketlistItem[];
}


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
            
            // Group items by location to handle multiple items in same city
            const itemsInSameLocation = getItemsInSameLocation(displayItems, item);
            const itemIndex = itemsInSameLocation.findIndex(otherItem => otherItem.id === item.id);
            const totalInLocation = itemsInSameLocation.length;
            
            // Add small offset for multiple items in same location
            const adjustedCoords = calculateOffsetCoordinates(coords, itemIndex, totalInLocation, 0.1);
            
            // Convert coordinates to percentage positions for display
            const x = ((adjustedCoords[1] + 180) / 360) * 100; // longitude to x percentage
            const y = ((90 - adjustedCoords[0]) / 180) * 100; // latitude to y percentage
            
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
                title={`${item.title} - ${item.completed ? 'Completed' : 'In Progress'}${totalInLocation > 1 ? ` (${itemIndex + 1}/${totalInLocation} in ${item.city || 'this location'})` : ''}`}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                  {item.completed ? '✓' : '●'}
                </div>
                
                {/* Show count badge for multiple items in same location */}
                {totalInLocation > 1 && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalInLocation}
                  </div>
                )}
                
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
      
      {/* Selected Location Details */}
      {selectedItem && (() => {
        // Find all items in the same location
        const itemsInSameLocation = getItemsInSameLocation(displayItems, selectedItem);
        
        return (
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  📍 {[selectedItem.city, selectedItem.state, selectedItem.country].filter(Boolean).join(', ')}
                </h3>
                {itemsInSameLocation.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    {itemsInSameLocation.length} {itemsInSameLocation.length === 1 ? 'item' : 'items'} in this location
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            {/* All items in this location */}
            <div className="space-y-3">
              {itemsInSameLocation.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg border ${
                  item.completed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                      item.completed ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.completed ? 'Completed' : 'In Progress'}
                        </span>
                        {item.priority && (
                          <span className="text-xs text-muted-foreground">
                            {item.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
      
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
