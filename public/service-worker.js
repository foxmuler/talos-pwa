const CACHE_NAME = 'talos-v1.6';
const urlsToCache = [
  '/',
  '/index.html',
  '/bundle.js',
  '/manifest.webmanifest',
  '/capacitor.js',
  '/icon.svg',
  '/favicon.svg',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching initial assets');
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(urlToCache).catch(err => {
                console.warn(`Failed to cache ${urlToCache}:`, err);
            });
        });
        return Promise.all(cachePromises);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then(response => {
                        return response || new Response("Network error and no cache available.", {
                           status: 404,
                           statusText: "Not Found"
                       });
                    });
            })
    );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});