const CACHE_NAME = '010io-nexus-v1';
const urlsToCache = [
  '/',
  '/assets/css/enhanced-styles.css',
  '/assets/js/github-integration.js',
  '/assets/js/web-llm-chat.js',
  '/assets/js/auto-update-portfolio.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});