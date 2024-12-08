/// <reference lib="webworker" />

import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

// Add SyncEvent type definition
interface SyncEvent extends Event {
  tag: string
  waitUntil(promise: Promise<any>): void
}

// Take control of all pages immediately
clientsClaim()

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST)

// Clean up old caches
cleanupOutdatedCaches()

// Cache configuration
const CACHE_NAMES = {
  static: 'static-assets-v1',
  images: 'images-v1',
  api: 'api-v1',
  pages: 'pages-v1',
  videos: 'videos-v1'
}

// API routes cache strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Static assets cache strategy
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Image cache strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Video cache strategy
registerRoute(
  ({ request }) => request.destination === 'video',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.videos,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Page cache strategy
const navigationRoute = new NavigationRoute(
  new NetworkFirst({
    cacheName: CACHE_NAMES.pages,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 10 * 60, // 10 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

registerRoute(navigationRoute)

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

// Background sync for failed requests
self.addEventListener('sync', ((event: SyncEvent) => {
  if (event.tag === 'sync-failed-requests') {
    event.waitUntil(syncFailedRequests())
  }
}) as EventListener)

async function syncFailedRequests() {
  try {
    const cache = await caches.open('failed-requests')
    const requests = await cache.keys()

    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await fetch(request)
          if (response.ok) {
            await cache.delete(request)
          }
        } catch (error) {
          console.error('Failed to sync request:', error)
        }
      })
    )
  } catch (error) {
    console.error('Failed to sync failed requests:', error)
  }
}

// Cache cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      cleanupOutdatedCaches(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => !Object.values(CACHE_NAMES).includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      }),
    ])
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