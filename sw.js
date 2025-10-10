// Service Worker for Life Planner PWA
const CACHE_NAME = 'life-planner-v2';
const STATIC_CACHE = 'life-planner-static-v2';
const DYNAMIC_CACHE = 'life-planner-dynamic-v2';

// Determine base path based on environment
const isProduction = location.hostname !== 'localhost';
const basePath = isProduction ? '/life.planner' : '';

// Essential resources that should be cached immediately
const urlsToCache = [
  `${basePath}/`,
  `${basePath}/index.html`,
  `${basePath}/manifest.json`
];

// Static assets that can be cached
const staticAssets = [
  `${basePath}/lsb.png`
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache resources with better performance
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache essential resources immediately
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching essential resources...');
        return cache.addAll(urlsToCache);
      }),
      
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets...');
        return Promise.allSettled(
          staticAssets.map(url => 
            cache.add(url).catch(err => {
              console.log('Static asset not found:', url);
              return null;
            })
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Helper function to determine cache strategy
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Static assets - cache first
  if (url.pathname.includes('.js') || url.pathname.includes('.css') || 
      url.pathname.includes('.png') || url.pathname.includes('.jpg') || 
      url.pathname.includes('.svg') || url.pathname.includes('.ico')) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // API calls - network first
  if (url.pathname.includes('/api/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // HTML pages - stale while revalidate
  if (request.destination === 'document') {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // Default to cache first
  return CACHE_STRATEGIES.CACHE_FIRST;
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('Network failed for:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(networkResponse => {
    cache.put(request, networkResponse.clone());
    return networkResponse;
  }).catch(() => {
    // Network failed, but we might have cached version
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cached version, wait for network
  return fetchPromise;
}

// Fetch event with optimized caching strategies
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  const strategy = getCacheStrategy(event.request);
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case CACHE_STRATEGIES.CACHE_FIRST:
            return await cacheFirst(event.request);
          case CACHE_STRATEGIES.NETWORK_FIRST:
            return await networkFirst(event.request);
          case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return await staleWhileRevalidate(event.request);
          default:
            return await cacheFirst(event.request);
        }
      } catch (error) {
        console.log('Fetch error for:', event.request.url, error);
        
        // Fallback for navigation requests
        if (event.request.destination === 'document') {
          const fallbackResponse = await caches.match(`${basePath}/index.html`);
          if (fallbackResponse) {
            return fallbackResponse;
          }
        }
        
        return new Response('Service Unavailable', { status: 503 });
      }
    })()
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    })
  );
});
