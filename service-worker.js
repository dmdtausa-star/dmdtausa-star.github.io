// =====================================================================
//  service-worker.js — app instalable + uso sin conexión de DMD.
//
//  Qué hace:
//   1. Guarda en el dispositivo los archivos base (HTML, CSS, JS, íconos)
//      y las librerías externas (Leaflet, Firebase, QRious).
//   2. Páginas y archivos propios: red primero; si no hay señal, usa lo guardado.
//   3. Mapa: guarda los cuadros del mapa (tiles) que la persona va viendo, hasta
//      un máximo, y los reutiliza sin conexión. No descarga zonas completas.
//   4. Lo demás (Firestore, rutas, búsqueda de direcciones) va directo a la red
//      y nunca se guarda.
//
//  Cada vez que cambies el sitio y quieras que la app reciba la actualización,
//  sube el número de CACHE_NAME (por ejemplo de 'dmd-v5' a 'dmd-v6').
// =====================================================================
const CACHE_NAME = 'dmd-v5';
const TILE_CACHE = 'dmd-tiles-v1';
const MAX_TILES = 1500;

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
  './install.js',
  './stats.js',
  './manifest.json',
  './logo-dmd.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

// librerías externas que el mapa y las fichas necesitan para abrir sin señal
const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';
const WARM_URLS = [
  LEAFLET + 'leaflet.min.css',
  LEAFLET + 'leaflet.min.js',
  LEAFLET + 'images/marker-icon.png',
  LEAFLET + 'images/marker-icon-2x.png',
  LEAFLET + 'images/marker-shadow.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

// sitios externos cuyos archivos sí se guardan (red primero)
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

function esTile(url){
  return url.hostname === 'server.arcgisonline.com' || /(^|\.)tile\.openstreetmap\.org$/.test(url.hostname);
}

self.addEventListener('install', function(event){
  event.waitUntil((async function(){
    const cache = await caches.open(CACHE_NAME);
    // uno por uno: si un archivo falla, los demás igual se guardan
    await Promise.all(CORE_FILES.map(function(f){ return cache.add(f).catch(function(){}); }));
    await Promise.all(WARM_URLS.map(function(u){
      return fetch(u, { mode: 'no-cors' }).then(function(r){ return cache.put(u, r); }).catch(function(){});
    }));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME && n !== TILE_CACHE; })
             .map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// ---------- mapa: cuadros guardados a medida que se ven ----------
let tilesGuardados = 0;
function claveTile(url){
  // los subdominios a, b y c de OpenStreetMap son el mismo cuadro: se guarda una sola copia
  return url.replace(/^https:\/\/[abc]\.tile\.openstreetmap\.org/, 'https://tile.openstreetmap.org');
}
async function recortarTiles(cache){
  const keys = await cache.keys();
  if(keys.length > MAX_TILES){
    await Promise.all(keys.slice(0, keys.length - MAX_TILES).map(function(k){ return cache.delete(k); }));
  }
}
async function responderTile(req){
  const cache = await caches.open(TILE_CACHE);
  const clave = claveTile(req.url);
  const guardado = await cache.match(clave);
  if(guardado) return guardado;
  let resp;
  try{
    try{ resp = await fetch(req.url, { mode: 'cors' }); }   // respuesta "abierta": se puede guardar con su peso real
    catch(e){ resp = await fetch(req); }                    // si el servidor no permite CORS, se muestra pero no se guarda
  } catch(e){
    return Response.error();                                // sin señal y sin copia: cuadro vacío
  }
  if(resp && resp.ok && resp.type !== 'opaque'){
    cache.put(clave, resp.clone());
    tilesGuardados++;
    if(tilesGuardados % 50 === 0) recortarTiles(cache);
  }
  return resp;
}

// ---------- archivos propios y librerías: red primero ----------
async function redPrimero(req){
  try{
    const resp = await fetch(req);
    if(resp && (resp.status === 200 || resp.type === 'opaque')){
      const copia = resp.clone();
      caches.open(CACHE_NAME).then(function(c){ c.put(req, copia); }).catch(function(){});
    }
    return resp;
  } catch(e){
    const esPagina = req.mode === 'navigate';
    const guardado = await caches.match(req, { ignoreSearch: esPagina });  // lugar.html?p=... usa la copia de lugar.html
    if(guardado) return guardado;
    if(esPagina) return caches.match('./index.html');
    return Response.error();
  }
}

self.addEventListener('fetch', function(event){
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  if(esTile(url)){ event.respondWith(responderTile(req)); return; }

  const mismoOrigen = url.origin === self.location.origin;
  if(!mismoOrigen && CDN_HOSTS.indexOf(url.hostname) === -1) return;   // Firestore, rutas, búsquedas: directo a la red

  event.respondWith(redPrimero(req));
});
