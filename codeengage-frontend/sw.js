const CACHE_NAME = 'codeengage-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/css/main.css',
    '/src/js/app.js',
    '/src/assets/logo.png', // Add logo if exists
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // API requests: Network first, no cache (or custom logic)
    if (event.request.url.includes('/api/')) {
        return;
    }

    // Static assets: Cache first
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
