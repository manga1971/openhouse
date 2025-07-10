const CACHE_NAME = 'audioform-v1';
const urlsToCache = [
  '/', // Or '/index.html' if you rename dashboard.html
  '/dashboard.html',
  '/settings.html',
  '/recording.html',
  '/edit.html',
  '/templates.html',
  '/template-editor.html',
  '/style.css',
  '/manifest.json',
  '/audio/start-recording.mp3',
  '/audio/stop-recording.mp3',
  '/audio/pause-recording.mp3',
  '/audio/resume-recording.mp3',
  // Adaugă aici și căile către iconițele PWA
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  // CDN-urile (Tailwind, Font Awesome) nu se cachează de obicei aici,
  // ele sunt gestionate de cache-ul browserului sau de CDN-ul în sine.
  // Dacă vrei offline complet, ar trebui să le incluzi local.
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache during install:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request);
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        // Poți returna o pagină offline personalizată aici
        // return caches.match('/offline.html');
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

console.log('Service Worker loaded.');