const CACHE_NAME = 'retail-assistant-v3';
const urlsToCache = [
    'index.html',
    'manifest.json',
    'kalkulator_sales.png',
    'qris_toko.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
