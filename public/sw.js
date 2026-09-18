self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept requests to /game-fs/<gameId>/<path>
  const match = url.pathname.match(/^\/game-fs\/([^\/]+)\/(.+)$/);
  
  if (match) {
    const gameId = decodeURIComponent(match[1]);
    const filePath = decodeURIComponent(match[2]);

    event.respondWith(
      (async () => {
        try {
          // Dynamic import of idb or just hardcode IndexedDB logic to avoid bundling in SW
          const db = await new Promise((resolve, reject) => {
            const request = indexedDB.open('game-fs', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });

          const tx = db.transaction('files', 'readonly');
          const store = tx.objectStore('files');
          const request = store.get([gameId, filePath]);

          const file = await new Promise((resolve, reject) => {
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });

          if (file && file.data) {
            let mimeType = file.mimeType || 'application/octet-stream';
            if (filePath.endsWith('.js')) mimeType = 'application/javascript';
            if (filePath.endsWith('.json')) mimeType = 'application/json';
            if (filePath.endsWith('.png')) mimeType = 'image/png';
            if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) mimeType = 'image/jpeg';
            if (filePath.endsWith('.ogg')) mimeType = 'audio/ogg';
            if (filePath.endsWith('.m4a')) mimeType = 'audio/mp4';
            if (filePath.endsWith('.css')) mimeType = 'text/css';
            if (filePath.endsWith('.html')) mimeType = 'text/html';

            return new Response(file.data, {
              status: 200,
              headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'no-cache',
                // Enable CORS if needed
                'Access-Control-Allow-Origin': '*'
              }
            });
          } else {
            return new Response('Not Found', { status: 404 });
          }
        } catch (error) {
          console.error('SW Fetch Error:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      })()
    );
  }
});
