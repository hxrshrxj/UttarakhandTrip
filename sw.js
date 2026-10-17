const SHELL_CACHE = "uttarakhand-shell-v9";
const PHOTO_CACHE = "uttarakhand-photos-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./ui.js",
  "./pwa.js",
  "./manifest.webmanifest",
  "./icons/app-icon.svg",
  "./icons/app-icon-192.png",
  "./icons/app-icon-512.png"
];
const MAX_CACHED_PHOTOS = 48;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then(async (cache) => {
    await Promise.all(SHELL_FILES.map(async (file) => {
      try { await cache.add(file); } catch { /* A missing optional asset must not prevent the itinerary shell installing. */ }
    }));
  }));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("uttarakhand-shell-") && key !== SHELL_CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "SAVE_DAY_PHOTOS") {
    event.waitUntil((async () => {
      const urls = [...new Set(event.data.urls || [])];
      const results = [];
      for (const url of urls) {
        try {
          const response = await updateCachedPhoto(new Request(url, { mode: "no-cors" }), false);
          results.push(response.ok || response.type === "opaque" ? url : null);
        }
        catch { results.push(null); }
      }
      const savedUrls = results.filter(Boolean);
      const cache = await caches.open(PHOTO_CACHE);
      await trimPhotoCache(cache);
      event.ports[0]?.postMessage({ saved: savedUrls.length, total: urls.length, savedUrls });
    })());
  }
  if (event.data?.type === "CHECK_CACHED_PHOTOS") {
    event.waitUntil((async () => {
      const cache = await caches.open(PHOTO_CACHE);
      const urls = [...new Set(event.data.urls || [])];
      const cachedUrls = [];
      for (const url of urls) if (await cache.match(url, { ignoreVary: true })) cachedUrls.push(url);
      event.ports[0]?.postMessage({ cachedUrls });
    })());
  }
});

async function trimPhotoCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_CACHED_PHOTOS) {
    await Promise.all(keys.slice(0, keys.length - MAX_CACHED_PHOTOS).map((key) => cache.delete(key)));
  }
}

async function updateCachedPhoto(request, trim = true) {
  const cache = await caches.open(PHOTO_CACHE);
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    await cache.put(request, response.clone());
    if (trim) await trimPhotoCache(cache);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(SHELL_CACHE);
        cache.put("./index.html", response.clone());
        return response;
      } catch {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  if (request.destination === "image" && url.origin !== self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(PHOTO_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        return await updateCachedPhoto(request);
      } catch {
        return Response.error();
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || Response.error();
      }
    })());
  }
});
