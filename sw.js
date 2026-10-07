/* NYC Live Music — service worker.
   Strategy: network-first for the two pages and for the archive data (so a fresh
   build always wins), cache-first for icons and the manifest. Falls back to the
   last good copy when the device is offline. */
const CACHE = 'nyc-live-music-v2';
const SHELL = [
  './',
  './index.html',
  './archive.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .catch(function () { /* a missing shell file must not block install */ })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // ticket links, APIs: straight to network

  var isArchivePage = /archive\.html$/.test(url.pathname);
  var isArchiveData = /archive\.json$/.test(url.pathname);
  var isPage = req.mode === 'navigate' ||
               url.pathname.endsWith('/') ||
               url.pathname.endsWith('index.html') ||
               isArchivePage;

  // Network-first for anything that changes on a refresh. Each response is
  // cached under its own stable key, so opening the archive can never overwrite
  // the offline copy of the calendar.
  if (isPage || isArchiveData) {
    var key = isArchiveData ? './archive.json'
            : isArchivePage ? './archive.html'
            : './index.html';
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(key, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(key).then(function (m) {
          if (m) return m;
          if (isArchiveData) return Response.error();
          return caches.match('./index.html').then(function (x) { return x || caches.match('./'); });
        });
      })
    );
    return;
  }

  // Icons and the manifest: cache-first, they are versioned by name.
  e.respondWith(
    caches.match(req).then(function (m) {
      return m || fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
