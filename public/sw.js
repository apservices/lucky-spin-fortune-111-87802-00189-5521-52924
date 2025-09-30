/**
 * Service Worker for PWA functionality
 * Handles caching, offline support, and performance optimization
 */

const CACHE_NAME = 'zodiac-fortune-v1.0.0';
const RUNTIME_CACHE = 'zodiac-runtime-v1.0.0';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/config/gameParameters.json',
  // Critical sprites
  '/src/assets/sprites/tiger-idle.webp',
  '/src/assets/sprites/fox-idle.webp',
  '/src/assets/sprites/frog-idle.webp',
  '/src/assets/sprites/envelope-idle.webp',
  '/src/assets/sprites/orange-idle.webp',
  '/src/assets/sprites/scroll-idle.webp'
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/config/',
  '/api/'
];

// Cache-first resources (use cache if available)
const CACHE_FIRST = [
  '/src/assets/',
  '/fonts/',
  '/images/'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Precaching assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Precaching complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Cleanup complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle different caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first strategy for dynamic content
  if (NETWORK_FIRST.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST.some(pattern => url.pathname.startsWith(pattern))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale-while-revalidate for other requests
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Network-first strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache-first failed:', request.url, error);
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 * Return cached version immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Background fetch failed:', request.url, error);
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  return fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'game-data-sync') {
    event.waitUntil(syncGameData());
  }
});

async function syncGameData() {
  try {
    // Sync any queued game actions when back online
    console.log('Syncing game data...');
    // Implementation would go here
  } catch (error) {
    console.error('Game data sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Play Now',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Zodiac Fortune', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});