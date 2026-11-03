// Service worker: guarda la app en caché para que funcione sin conexión.
// Sube la versión cada vez que cambies index.html para que los móviles se actualicen.
const CACHE = "miturno-v3.12.0";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/turno-sol.jpg",
  "./icons/turno-atardecer.jpg",
  "./icons/turno-luna.jpg",
  "./icons/turno-amanecer.jpg",
  "./icons/turno-dia.jpg",
  "./icons/turno-noche.jpg",
  "./icons/empresa-wys.png"
];

// "reload" se salta la caché de 10 minutos de GitHub Pages: así se guarda la versión recién publicada
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero para la página (sin caché del navegador, para recibir siempre la última versión);
// si no hay conexión, la copia guardada.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // la app pide "sin caché" cuando busca actualizaciones: eso va directo a internet
  if (e.request.cache === "no-store" || e.request.cache === "reload") return;
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request.url, { cache: "no-store", credentials: "same-origin" })
        .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); } return r; })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
  }
});
