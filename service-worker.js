const CACHE_NAME = 'golden-speeches-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './speech1.html',
  './speech10.html'
];

// انسٹال کے دوران تمام فائلیں cache میں شامل کریں
self.addEventListener('install', event => {
  console.log('🔧 Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // فوراً activate ہو
  );
});

// پرانے cache delete کریں
self.addEventListener('activate', event => {
  console.log('⚙️ Activating service worker...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// fetch requests کو cache یا network سے handle کریں
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // صرف GET requests handle کریں
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('✅ Cache hit:', event.request.url);
          return response;
        }
        console.log('🌐 Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // صرف کامیاب requests کو cache میں ڈالیں
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return networkResponse;
          })
          .catch(() => caches.match('./index.html')); // offline fallback
      })
  );
});
