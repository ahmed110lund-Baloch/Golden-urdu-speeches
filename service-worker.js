const CACHE_NAME = 'golden-speeches-v4';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon/icon-192x192.png',
  './icon/icon-512x512.png',

  // تمام 30 تقریریں cache کریں
  './speech1.html',
  './speech2.html',
  './speech3.html',
  './speech4.html',
  './speech5.html',
  './speech6.html',
  './speech7.html',
  './speech8.html',
  './speech9.html',
  './speech10.html',
  './speech11.html',
  './speech12.html',
  './speech13.html',
  './speech14.html',
  './speech15.html',
  './speech16.html',
  './speech17.html',
  './speech18.html',
  './speech19.html',
  './speech20.html',
  './speech21.html',
  './speech22.html',
  './speech23.html',
  './speech24.html',
  './speech25.html',
  './speech26.html',
  './speech27.html',
  './speech28.html',
  './speech29.html',
  './speech30.html'
];

// انسٹال کے دوران تمام فائلیں cache میں شامل کریں
self.addEventListener('install', event => {
  console.log('🔧 Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app files...');
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
