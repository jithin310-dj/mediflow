const CACHE_NAME = 'mediflow-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching critical offline assets...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip dev server WebSockets or hot-module-replacement requests
  if (url.pathname.includes('ws') || url.pathname.includes('vite') || url.hostname === 'localhost' && url.port === '3000' && url.pathname.includes('__vite_ping')) {
    return;
  }

  // API Requests: Network First, fallback to cached JSON or default offline structure
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] API Network request failed. Serving from cache or default fallback...');
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If health-check, return offline ok
            if (url.pathname === '/api/health') {
              return new Response(JSON.stringify({ status: "offline-backup", time: new Date().toISOString() }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }

            // Return custom empty-state fallback response for offline APIs
            return new Response(JSON.stringify({ 
              error: "You are currently offline. MediFlow offline backup has been activated.", 
              offline: true 
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Page navigation requests: Serve index.html (SPA routing fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('[Service Worker] Navigation failed, serving index.html fallback...');
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // App static assets (Scripts, Styles, Images, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn('[Service Worker] Resource fetch failed offline:', err);
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
