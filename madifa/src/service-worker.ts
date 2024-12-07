/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

// Take control of all pages immediately
clientsClaim()

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST)

// Set up App Shell-style routing
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$')
registerRoute(
  // Return false if the route shouldn't be handled by this strategy
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== 'navigate') {
      return false
    }

    if (url.pathname.startsWith('/_')) {
      return false
    }

    if (url.pathname.match(fileExtensionRegexp)) {
      return false
    }

    return true
  },
  createHandlerBoundToURL('/index.html')
)

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
)

// Cache static assets (JS, CSS, fonts)
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
)

// Handle offline fallback
self.addEventListener('install', (event) => {
  const offlinePage = new Request('/offline.html')
  event.waitUntil(
    fetch(offlinePage).then((response) => {
      return caches.open('offline').then((cache) => {
        return cache.put(offlinePage, response)
      })
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html').then(response => {
          return response || new Response('Offline page not found', {
            status: 404,
            statusText: 'Not Found'
          })
        })
      })
    )
  }
}) 