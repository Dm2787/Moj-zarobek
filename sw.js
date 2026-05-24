const CACHE_NAME = 'czas-pracy-v5'; // Podbicie wersji wymusi na telefonie nadpisanie starego cache
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. Instalacja i natychmiastowy zapis plików aplikacji do pamięci telefonu
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Zapisuję pliki aplikacji do trybu offline...');
      // Bezpieczne dodawanie plików - jeśli brakuje ikony, console.error nie pozwoli wywalić całej instalacji
      return cache.addAll(FILES_TO_CACHE).catch(err => console.error("Błąd zapisu zasobów do cache:", err));
    })
  );
  self.skipWaiting();
});

// 2. Aktywacja i bezwzględne czyszczenie starych wersji cache
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Usuwam stary cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. Obsługa żądań sieciowych i startu w trybie offline
self.addEventListener('fetch', (evt) => {
  const url = evt.request.url;

  // Ignorujemy zapytania o pogodę i lokalizację (nie pozwalamy im zawiesić działania aplikacji bez sieci)
  if (url.includes('open-meteo.com') || url.includes('nominatim.org') || url.includes('ipapi.co')) {
    return; // Pozwól przeglądarce standardowo odpytać sieć (błąd zostanie przechwycony w index.html)
  }

  // Serwowanie plików aplikacji prosto z pamięci urządzenia
  evt.respondWith(
    caches.match(evt.request).then((res) => {
      // Jeśli plik jest w pamięci podręcznej – zwróć go natychmiast (aplikacja startuje bez sieci)
      if (res) {
        return res;
      }
      
      // Jeśli pliku nie ma w cache (np. jakieś zewnętrzne skrypty), pobierz z sieci i zabezpiecz przed crashem
      return fetch(evt.request).catch((err) => {
        console.log("Brak sieci dla zasobu:", url);
        // Zwracamy czystą odpowiedź zamiast błędu blokującego ładowanie interfejsu
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
