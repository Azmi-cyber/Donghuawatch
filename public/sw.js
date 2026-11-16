// Service worker minimal: syarat agar situs bisa dipasang sebagai aplikasi. Tidak menyimpan cache.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
