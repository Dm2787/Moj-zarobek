const CACHE_NAME = 'czas-pracy-v7'; // Zmieniłem wersję na v3, żeby zmusić przeglądarkę do odświeżenia cache
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png' // Dopasuj nazwę pliku, jeśli na serwerze nazywa się inaczej
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zapisuję pliki aplikacji do trybu offline');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Usuwam stary cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((res) => {
      return res || fetch(evt.request);
    })
  );
});
