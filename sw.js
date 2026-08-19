const CACHE_NAME = 'czas-pracy-v20';

// Pliki niezbędne do startu aplikacji w trybie offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png'
];

// Instalacja i zapisanie kluczowych plików w pamięci podręcznej
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Czyszczenie starych wersji pamięci podręcznej
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Obsługa zapytań sieciowych
self.addEventListener('fetch', (evt) => {
  // Ignoruj zapytania inne niż GET (np. logowanie Supabase, zapis danych POST/PUT)
  if (evt.request.method !== 'GET') return;

  // Ignoruj zapytania do zewnętrznych API (Supabase, Pogoda Nominatim / Open-Meteo)
  const url = new URL(evt.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(evt.request).then((networkResponse) => {
        return networkResponse;
      });
    })
  );
});
