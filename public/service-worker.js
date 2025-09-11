// Nome do cache para armazenar os arquivos do app
const CACHE_NAME = 'smartfridge-cache-v1';

// Arquivos essenciais para o funcionamento offline do app
// Adicione os caminhos corretos após o build do seu projeto React.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
  // Ex: '/static/js/main.<hash>.js', '/static/css/main.<hash>.css'
];

// Evento 'install': é acionado quando o service worker é instalado
self.addEventListener('install', event => {
  // Espera até que o cache seja aberto e todos os arquivos essenciais sejam adicionados
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso.');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Falha ao adicionar arquivos ao cache:', err);
      })
  );
});

// Evento 'fetch': é acionado para cada requisição que a página faz
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET (como POST para APIs)
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // Tenta encontrar a resposta no cache primeiro
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna a resposta do cache
        if (response) {
          return response;
        }

        // Se não encontrar, faz a requisição à rede e adiciona ao cache para uso futuro
        return fetch(event.request).then(
          networkResponse => {
            // Verifica se a resposta é válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clona a resposta para poder ser usada pelo navegador e pelo cache
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});

// Evento 'activate': limpa caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

