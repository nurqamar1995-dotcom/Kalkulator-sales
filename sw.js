const CACHE_NAME = 'retail-assistant-v4.3'; // Versi dinaikkan agar HP otomatis sadar ada update

const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'main.js',
    'manifest.json',
    'kalkulator_sales.png',
    'qris_toko.png'
];

// Tahap Install: Memaksa Service Worker baru langsung aktif tanpa menunggu
self.addEventListener('install', event => {
    self.skipWaiting(); // <--- JURUS 1: Paksa Update
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Membuka cache dan menyimpan file...');
                return cache.addAll(urlsToCache);
            })
    );
});

// Tahap Activate: Menghapus cache/memori versi lama dan langsung mengambil alih kontrol
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Jika nama cache tidak sama dengan versi terbaru, hapus yang lama!
                    if (cacheName !== CACHE_NAME) {
                        console.log('Menghapus cache versi lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim(); // <--- JURUS 2: Ambil alih layar sekarang juga
        })
    );
});

// Tahap Fetch: Mengambil data dari Cache dulu (Offline), jika tidak ada baru dari Internet
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Jika file ditemukan di cache (offline), tampilkan!
                if (response) {
                    return response;
                }
                // Jika tidak ada di cache, download dari internet
                return fetch(event.request);
            })
    );
});
