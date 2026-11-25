/* Service worker: aplikacja działa offline.
 * Strategia „najpierw sieć”: przy internecie zawsze najnowsza wersja (zapytanie
 * warunkowe, więc tanie), bez internetu – kopia z pamięci podręcznej.
 * Po zmianie listy plików podbij VERSION. */
const VERSION = 'wp-v8';
const ASSETS = [
  './', 'index.html', 'css/style.css',
  'js/config.js', 'js/course-a2.js', 'js/course.js', 'js/core.js', 'js/sync.js', 'js/lesson.js', 'js/app.js',
  'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
];
const NETWORK_TIMEOUT = 4000;

self.addEventListener('install', e => {
  // cache: 'reload' – pomija pamięć HTTP przeglądarki, żeby nie zapisać starej wersji
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    const cached = () => cache.match(e.request, { ignoreSearch: true });
    try {
      const res = await Promise.race([
        fetch(e.request, { cache: 'no-cache' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), NETWORK_TIMEOUT)),
      ]);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch {
      return (await cached()) || Response.error();
    }
  })());
});
