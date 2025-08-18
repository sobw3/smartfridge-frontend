// Este é um service worker básico, apenas para tornar a app instalável.
// Ele não faz cache offline por enquanto.

self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativado');
});

self.addEventListener('fetch', (event) => {
  // Não faz nada com os pedidos, apenas os deixa passar para a rede.
  // Isto é necessário para que a app seja considerada um PWA.
});
