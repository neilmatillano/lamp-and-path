// Le Sentier service worker: keeps the whole app on the device so it opens offline.
const VERSION = "le-sentier-3";
const SHELL = [
  "/", "/app.js", "/manifest.webmanifest",
  "/icons/icon-192.png", "/icons/icon.svg", "/icons/icon-maskable.svg", "/icons/apple-touch-icon.png", "/icons/favicon-64.png"
];
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,500;0,7..72,700;1,7..72,500&family=Figtree:wght@400;500;600;700&display=swap";
const FONT_CACHE = "lamp-fonts-v2";

// Fetch the Google Fonts stylesheet and every font file it points to, so text looks right offline.
async function cacheFonts() {
  try {
    const cache = await caches.open(FONT_CACHE);
    if (await cache.match(FONT_CSS)) return;
    const res = await fetch(FONT_CSS, { mode: "cors" });
    if (!res.ok) return;
    const css = await res.clone().text();
    await cache.put(FONT_CSS, res);
    const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]);
    await Promise.all(urls.map(u => fetch(u, { mode: "cors" }).then(r => r.ok && cache.put(u, r)).catch(() => {})));
  } catch (e) { /* offline during install: fonts are cached on a later visit */ }
}

self.addEventListener("install", event => {
  event.waitUntil(Promise.all([
    caches.open(VERSION).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))),
    cacheFonts()
  ]));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== FONT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(caches.open(FONT_CACHE).then(c => c.match(req.url).then(hit => hit || fetch(req).then(res => {
      if (res.ok) c.put(req.url, res.clone());
      return res;
    }))));
    return;
  }
  if (url.origin !== self.location.origin) return; // passage links go straight to the web
  if (req.mode === "navigate") {
    event.respondWith(caches.match("/").then(hit => hit || fetch(req)));
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
