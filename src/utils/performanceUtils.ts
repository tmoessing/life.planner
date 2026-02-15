import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';

/**
 * Performance optimization utilities
 */

// Memoization utilities
export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

// Debounce hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
};

// Virtual scrolling utilities
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  options: VirtualScrollOptions
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const { itemHeight, containerHeight, overscan = 5 } = options;

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Intersection Observer hook
export const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, options]);

  return observerRef.current;
};

// Lazy loading hook
export const useLazyLoading = <T>(
  items: T[],
  batchSize: number = 20
) => {
  const [loadedCount, setLoadedCount] = useState(batchSize);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loadedCount >= items.length) return;

    setIsLoading(true);

    // Simulate async loading
    setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + batchSize, items.length));
      setIsLoading(false);
    }, 100);
  }, [loadedCount, items.length, batchSize]);

  const visibleItems = items.slice(0, loadedCount);
  const hasMore = loadedCount < items.length;

  return {
    visibleItems,
    hasMore,
    isLoading,
    loadMore
  };
};

// Performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef<number>(0);

  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    startTime: startTime.current
  };
};

// Memory optimization utilities
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);

  return { addCleanup };
};

// Batch updates utility
export const useBatchUpdates = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const batchUpdate = useCallback((update: any) => {
    setUpdates(prev => [...prev, update]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Process all batched updates
      setUpdates([]);
    }, 16); // ~60fps
  }, []);

  return { updates, batchUpdate };
};

// Optimized search
export const useOptimizedSearch = <T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  debounceMs: number = 300
) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items;

    return items.filter(item => searchFn(item, debouncedQuery));
  }, [items, debouncedQuery, searchFn]);

  return {
    query,
    setQuery,
    filteredItems,
    isSearching: query !== debouncedQuery
  };
};

// Optimized sorting
export const useOptimizedSort = <T>(
  items: T[],
  sortFn: (a: T, b: T) => number,
  dependencies: React.DependencyList = []
) => {
  return useMemo(() => {
    return [...items].sort(sortFn);
  }, [items, ...dependencies]);
};

// Optimized filtering
export const useOptimizedFilter = <T>(
  items: T[],
  filterFn: (item: T) => boolean,
  dependencies: React.DependencyList = []
) => {
  return useMemo(() => {
    return items.filter(filterFn);
  }, [items, ...dependencies]);
};

// Optimized grouping
export const useOptimizedGroup = <T, K extends string | number>(
  items: T[],
  groupFn: (item: T) => K,
  dependencies: React.DependencyList = []
) => {
  return useMemo(() => {
    return items.reduce((groups, item) => {
      const key = groupFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }, [items, ...dependencies]);
};

// Performance metrics
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  useEffect(() => {
    const measurePerformance = () => {
      if ('memory' in performance && (performance as any).memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    };

    const interval = setInterval(measurePerformance, 1000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
};

// Component optimization wrapper
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    memo?: boolean;
    shouldUpdate?: (prevProps: P, nextProps: P) => boolean;
  } = {}
) => {
  const { memo = true, shouldUpdate } = options;

  if (memo) {
    return React.memo(Component, shouldUpdate);
  }

  return Component;
};

// Bundle size optimization
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>
) => {
  return React.lazy(importFn);
};

// Tree shaking optimization
export const createTreeShakeableModule = <T>(module: T) => {
  return module;
};

// Export usePerformanceOptimization as an alias for withPerformanceOptimization
export const usePerformanceOptimization = withPerformanceOptimization;
