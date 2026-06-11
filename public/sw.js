// public/sw.js
// Service worker mínimo: apenas habilita a instalação como PWA.
// Sem cache — todas as requisições seguem direto para a rede.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // Passthrough proposital: nenhuma resposta customizada/cache.
})
