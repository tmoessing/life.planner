import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BucketlistItem } from '@/types';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for completed vs in-progress items
const createCustomIcon = (isCompleted: boolean) => {
  const color = isCompleted ? '#10B981' : '#F59E0B'; // Green for completed, Yellow for in-progress
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      transform: rotate(-45deg);
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${isCompleted ? '✓' : '●'}
      </div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

interface RealBucketlistMapProps {
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
  if (country.includes('france')) return [46.2276, 2.2137]; // Paris
  if (country.includes('germany')) return [51.1657, 10.4515]; // Berlin
  if (country.includes('italy')) return [41.8719, 12.5674]; // Rome
  if (country.includes('spain')) return [40.4637, -3.7492]; // Madrid
  if (country.includes('japan')) return [36.2048, 138.2529]; // Tokyo
  if (country.includes('china')) return [35.8617, 104.1954]; // Beijing
  if (country.includes('india')) return [20.5937, 78.9629]; // New Delhi
  if (country.includes('australia')) return [-25.2744, 133.7751]; // Sydney
  if (country.includes('brazil')) return [-14.2350, -51.9253]; // Brasília
  if (country.includes('argentina')) return [-38.4161, -63.6167]; // Buenos Aires
  if (country.includes('south africa')) return [-30.5595, 22.9375]; // Cape Town
  
  // Default to a random location if country not recognized
  return [20 + Math.random() * 40, -100 + Math.random() * 200];
};

// Component to fit map bounds to show all markers
function FitBounds({ items }: { items: BucketlistItem[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (items.length > 0) {
      const coordinates = items.map(item => getCoordinates(item));
      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [items, map]);
  
  return null;
}

// Map component that handles React 19 compatibility issues
function MapComponent({ items, selectedItem, setSelectedItem }: { 
  items: BucketlistItem[], 
  selectedItem: BucketlistItem | null, 
  setSelectedItem: (item: BucketlistItem | null) => void 
}) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
      zoomControl={true}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      dragging={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Fit bounds to show all markers */}
      <FitBounds items={items} />
      
      {/* Location Markers */}
      {items.map((item) => {
        const coords = getCoordinates(item);
        return (
          <Marker
            key={item.id}
            position={coords}
            icon={createCustomIcon(item.completed)}
            eventHandlers={{
              click: () => setSelectedItem(selectedItem?.id === item.id ? null : item),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${item.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium">
                    {item.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                {(item.city || item.state || item.country) && (
                  <p className="text-xs text-gray-500">
                    📍 {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export function RealBucketlistMap({ items }: RealBucketlistMapProps) {
  const [selectedItem, setSelectedItem] = useState<BucketlistItem | null>(null);
  
  // Filter only location items
  const locationItems = items.filter(item => item.bucketlistType === 'location');
  
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
  
  if (locationItems.length === 0) {
    return (
      <div className="space-y-4">
        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-blue-600">ℹ️</div>
            <h3 className="text-sm font-semibold text-blue-800">Demo Mode</h3>
          </div>
          <p className="text-xs text-blue-700">
            Showing sample locations. Add your own location-type bucketlist items to see them on the map!
          </p>
        </div>
        
        {/* Real Interactive Map */}
        <div className="h-96 w-full rounded-lg overflow-hidden border shadow-lg">
          <MapComponent 
            items={displayItems} 
            selectedItem={selectedItem} 
            setSelectedItem={setSelectedItem} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Real Interactive Map */}
      <div className="h-96 w-full rounded-lg overflow-hidden border shadow-lg">
        <MapComponent 
          items={displayItems} 
          selectedItem={selectedItem} 
          setSelectedItem={setSelectedItem} 
        />
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