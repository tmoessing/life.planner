// Map configuration utility
// This allows for easy switching between map implementations

export interface MapConfig {
  useSimpleMap: boolean;
  reason?: string;
}

export const getMapConfig = (): MapConfig => {
  // Check for React 19 compatibility issues
  const isReact19 = typeof window !== 'undefined' && 
    window.React?.version?.startsWith('19');
  
  // Check if react-leaflet is causing issues
  const hasReactLeafletIssues = isReact19;
  
  if (hasReactLeafletIssues) {
    return {
      useSimpleMap: true,
      reason: 'React 19 compatibility issues with react-leaflet'
    };
  }
  
  // Default to simple map for stability
  return {
    useSimpleMap: true,
    reason: 'Using simple map for better stability and performance'
  };
};

// Environment-based configuration
export const MAP_CONFIG = {
  // Set to true to force React Leaflet (when compatibility is fixed)
  FORCE_REACT_LEAFLET: false,
  
  // Set to true to enable automatic detection
  AUTO_DETECT_COMPATIBILITY: true,
  
  // Fallback to simple map on errors
  FALLBACK_ON_ERROR: true
};
