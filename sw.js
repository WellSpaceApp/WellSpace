// WellSpace Service Worker — v3
const CACHE_NAME = 'wellspace-v3';

// Don't cache anything — always load fresh from network
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Delete ALL old caches
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Always go to network first, never serve stale cache
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin !== location.origin) return;
  event.respondWith(fetch(event.request));
});
