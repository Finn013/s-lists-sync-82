
const CACHE_NAME = 's-list-app-v3';
const BASE_PATH = '/s-lists-sync';
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icon-48.png`,
  `${BASE_PATH}/icon-72.png`,
  `${BASE_PATH}/icon-96.png`,
  `${BASE_PATH}/icon-144.png`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Принудительно активируем новый SW
        return self.skipWaiting();
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Принудительно берем контроль над всеми клиентами
      return self.clients.claim();
    })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Обрабатываем только GET запросы
  if (event.request.method !== 'GET') {
    return;
  }

  // Проверяем, что запрос относится к нашему домену
  if (!event.request.url.includes(location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кешированную версию или загружаем из сети
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Проверяем что ответ валидный
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Клонируем ответ для кеширования
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // В случае ошибки сети, возвращаем offline страницу для навигации
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_PATH}/`);
          }
        });
      })
  );
});

// Обработка событий PWA
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('Before install prompt fired');
});

self.addEventListener('appinstalled', (event) => {
  console.log('App was installed');
});
