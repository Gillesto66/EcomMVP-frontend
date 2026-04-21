// Auteur : Gilles - Projet : AGC Space - Module : PWA - Service Worker
const CACHE_NAME = 'agcspace-v2'
const STATIC_ASSETS = ['/', '/login', '/register']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ne pas intercepter les requêtes non-GET, chrome-extension, etc.
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // API Django → Network Only (jamais de cache pour les données)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('ngrok')) {
    return // laisser le browser gérer directement
  }

  // Assets statiques Next.js → Cache First
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // Pages HTML → Network First, fallback cache, fallback réseau sans cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || fetch(request))
      )
  )
})
