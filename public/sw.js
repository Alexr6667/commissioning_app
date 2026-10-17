/* Service worker placeholder — offline caching will be added in a later step. */
self.addEventListener('install', (_event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
