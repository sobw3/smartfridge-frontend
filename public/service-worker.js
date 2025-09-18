/* eslint-disable no-restricted-globals */

// Este código é do Create React App e gerencia o cache do seu PWA.

const CACHE_NAME = 'smartfridge-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
  // Adicione aqui outros arquivos estáticos importantes, se houver.
];

// Evento de Instalação: Salva os arquivos essenciais no cache.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: Intercepta as requisições.
// Tenta pegar do cache primeiro. Se não conseguir (offline),
// tenta pegar da rede. Se conseguir da rede, atualiza o cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrar no cache, retorna do cache
        if (response) {
          return response;
        }

        // Se não, busca na rede
        return fetch(event.request).then(
          (response) => {
            // Se a resposta da rede for inválida, não guarda no cache.
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta para poder guardar no cache e retornar ao navegador.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Evento de Ativação: Limpa caches antigos se houver uma nova versão.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});