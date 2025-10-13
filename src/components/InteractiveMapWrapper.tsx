import React, { Suspense, lazy } from 'react';
import { SimpleBucketlistMap } from './views/SimpleBucketlistMap';
import type { BucketlistItem } from '@/types';

// Lazy load the real map to avoid initial React 19 issues
const RealBucketlistMap = lazy(() => import('./views/RealBucketlistMap').then(module => ({ default: module.RealBucketlistMap })));

interface InteractiveMapWrapperProps {
  items: BucketlistItem[];
}

export function InteractiveMapWrapper({ items }: InteractiveMapWrapperProps) {
  const [useRealMap, setUseRealMap] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Try to use real map first, fallback to simple map on error
  if (useRealMap && !hasError) {
    return (
      <Suspense 
        fallback={
          <div className="h-96 w-full rounded-lg overflow-hidden border shadow-lg bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">🗺️</div>
              <p className="text-sm text-gray-600">Loading interactive map...</p>
            </div>
          </div>
        }
      >
        <ErrorBoundary onError={() => setHasError(true)}>
          <RealBucketlistMap items={items} />
        </ErrorBoundary>
      </Suspense>
    );
  }

  // Fallback to simple map
  return <SimpleBucketlistMap items={items} />;
}

// Simple error boundary for the wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('Interactive map error, falling back to simple map:', error);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return <SimpleBucketlistMap items={[]} />;
    }

    return this.props.children;
  }
}
