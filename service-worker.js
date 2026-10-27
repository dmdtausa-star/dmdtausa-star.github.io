// =====================================================================
//  service-worker.js — lo que hace que DMD se pueda "instalar" como app.
//
//  Qué hace en la práctica:
//   1. Cuando alguien visita la página, guarda una copia de los archivos
//      base (HTML, CSS, JS, íconos) en el propio dispositivo.
//   2. Si esa persona vuelve a abrir la app sin señal o con mala conexión,
//      el sitio igual abre usando esa copia guardada, en vez de mostrar
//      el error de "sin conexión" del navegador.
//   3. Las fotos y el mapa (que dependen de internet) van a funcionar
//      normal cuando haya señal, y no van a romper nada cuando no la haya
//      — simplemente no cargarán, como en cualquier app.
//
//  Cada vez que cambies el sitio y quieras que la app instalada reciba
//  la actualización, sube el número de CACHE_NAME (por ejemplo, de
//  'dmd-v1' a 'dmd-v2'). Así el navegador sabe que debe descargar la
//  versión nueva en vez de seguir usando la vieja guardada.
// =====================================================================
const CACHE_NAME = 'dmd-v3';

const CORE_FILES = [
  './index.html',
  './acerca.html',
  './lugar.html',
  './hotel.html',
  './mapa.html',
  './site.css',
  './site-data.js',
  './topsearch.js',
  './share.js',
  './assistant.js',
  './reviews.js',
  './manifest.json',
  './logo-dmd.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CORE_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// estrategia: red primero (para tener siempre lo último si hay señal),
// y si falla, usa lo guardado — así nunca se ve la pantalla de "sin conexión"
// del navegador para las páginas y archivos ya visitados antes.
self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function(response){
        const copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        return response;
      })
      .catch(function(){
        return caches.match(event.request).then(function(cached){
          return cached || caches.match('./index.html');
        });
      })
  );
});
