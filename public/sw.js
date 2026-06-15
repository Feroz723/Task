const CACHE_NAME = "halo-v2";
const SHELL_URLS = [
  "/",
  "/landing",
  "/manifest.webmanifest",
  "/icon.svg",
  "/hero-mockup.png",
  "/theme-cloud.png",
  "/theme-midnight.png",
  "/theme-sakura.png",
  "/theme-forest.png",
  "/theme-sand.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const isNavigation = event.request.mode === "navigate";

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch((err) => {
          if (isNavigation) {
            return caches.match("/");
          }
          throw err;
        });
    })
  );
});
