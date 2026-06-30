// ── Service Worker — Mes Sport ────────────────────────────────
// Stratégie :
//   - App shell (HTML, manifest, exercices, firebase-sync) : cache-first
//   - Polices Google : cache-first après premier chargement
//
// ⚠️ 20260630-1540 est remplacé automatiquement par la date du jour
//    lors de chaque upload via le script de déploiement
//    → force tous les navigateurs à vider l'ancien cache

const CACHE_APP = 'sport-app-20260630-1540';

const APP_SHELL = [
  './sport_app.html',
  './manifest.json',
  './icon.svg',
  './exercices_data.js',
  './firebase-sync.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap',
];

// ── Install : mise en cache du shell ──────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_APP)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate : nettoyage des anciens caches ───────────────────
self.addEventListener('activate', event => {
  const VALID = [CACHE_APP];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !VALID.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch : cache-first pour tout l'app shell ─────────────────
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Polices CDN → cache-first
  if (url.startsWith('https://fonts.')) {
    event.respondWith(
      caches.match(event.request).then(r => r || fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_APP).then(c => c.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  // App shell → cache-first
  event.respondWith(
    caches.match(event.request)
      .then(r => r || fetch(event.request))
  );
});