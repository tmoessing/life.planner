import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BucketlistItem } from '@/types';
import { getCoordinates, getItemsInSameLocation, calculateOffsetCoordinates } from '@/utils/coordinateMapping';
import { formatLocationDisplay } from '@/utils/formatting';
import 'leaflet/dist/leaflet.css';

// Hook to detect dark mode
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

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
  const isDark = useDarkMode();
  
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={isDark 
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      />
      
      {/* Fit bounds to show all markers */}
      <FitBounds items={items} />
      
      {/* Location Markers */}
      {items.map((item) => {
        const coords = getCoordinates(item);
        
        // Group items by location to handle multiple items in same city
        const itemsInSameLocation = getItemsInSameLocation(items, item);
        const itemIndex = itemsInSameLocation.findIndex(otherItem => otherItem.id === item.id);
        const totalInLocation = itemsInSameLocation.length;
        
        // Add small offset for multiple items in same location
        const adjustedCoords = calculateOffsetCoordinates(coords, itemIndex, totalInLocation, 0.01);
        
        return (
          <Marker
            key={item.id}
            position={adjustedCoords}
            icon={createCustomIcon(item.completed)}
            eventHandlers={{
              click: () => setSelectedItem(selectedItem?.id === item.id ? null : item),
            }}
          >
            <Popup>
              <div className="p-2 max-w-sm bg-background text-foreground">
                {/* Location header */}
                {(item.city || item.state || item.country) && (
                  <div className="mb-3 pb-2 border-b border-border">
                    <h2 className="font-bold text-lg text-foreground">
                      📍 {formatLocationDisplay(item.city, item.state, item.country)}
                    </h2>
                    {totalInLocation > 1 && (
                      <p className="text-sm text-muted-foreground">
                        {totalInLocation} {totalInLocation === 1 ? 'item' : 'items'} in this location
                      </p>
                    )}
                  </div>
                )}
                
                {/* All items in this location */}
                <div className="space-y-3">
                  {itemsInSameLocation.map((locationItem) => (
                    <div key={locationItem.id} className={`p-2 rounded-lg border ${
                      locationItem.completed 
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                        : 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                          locationItem.completed ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-1 truncate text-foreground">{locationItem.title}</h3>
                          {locationItem.description && (
                            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{locationItem.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              locationItem.completed 
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' 
                                : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {locationItem.completed ? 'Completed' : 'In Progress'}
                            </span>
                            {locationItem.priority && (
                              <span className="text-xs text-muted-foreground">
                                {locationItem.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Demo Mode</h3>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Showing sample locations. Add your own location-type bucketlist items to see them on the map!
          </p>
        </div>
        
        {/* Real Interactive Map */}
        <div className="h-96 w-full rounded-lg overflow-hidden border border-border shadow-lg">
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
      <div className="h-96 w-full rounded-lg overflow-hidden border border-border shadow-lg">
        <MapComponent 
          items={displayItems} 
          selectedItem={selectedItem} 
          setSelectedItem={setSelectedItem} 
        />
      </div>
      
      {/* Selected Item Details */}
      {selectedItem && (
        <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-foreground">{selectedItem.title}</h3>
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
            <span className="text-sm font-medium text-foreground">
              {selectedItem.completed ? 'Completed' : 'In Progress'}
            </span>
          </div>
          {(selectedItem.city || selectedItem.state || selectedItem.country) && (
            <p className="text-xs text-muted-foreground">
              📍 {formatLocationDisplay(selectedItem.city, selectedItem.state, selectedItem.country)}
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