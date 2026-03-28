/**
 * Service Worker — Minimal caching for PWA installability.
 *
 * Strategy:
 * - Cache-first for static assets (JS, CSS, fonts, images)
 * - Network-first for API calls and HTML pages
 * - Precaches the app shell on install
 */

const CACHE_NAME = "disclosure-v1";
const PRECACHE_URLS = ["/", "/manifest.json"];

/* Install — precache core resources */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

/* Activate — clean up old caches */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* Fetch — network-first for navigation/API, cache-first for assets */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET requests */
  if (request.method !== "GET") return;

  /* Skip external requests */
  if (url.origin !== self.location.origin) return;

  /* API routes — network only (data must be fresh) */
  if (url.pathname.startsWith("/api/")) return;

  /* Static assets — cache first */
  if (
    url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|ico)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  /* HTML pages — network first, fallback to cache */
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
