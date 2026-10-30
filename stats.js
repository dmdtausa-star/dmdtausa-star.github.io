// =====================================================================
//  stats.js — contadores anónimos de visitas e instalaciones de la app.
//  Guarda solo números en Firestore (colección "stats"): sin nombres,
//  sin datos personales. Cada dispositivo cuenta una vez por día (visitas)
//  y una sola vez para "dispositivos que abrieron la app".
//   - visitas / visitas-AAAA-MM-DD → dispositivos por día
//   - instalaciones                → evento "appinstalled" (Chrome / Android)
//   - dispositivos-app             → primera vez que un dispositivo abre la app
//                                    instalada (sirve también para iPhone)
//  Se ven en resenas.html. Requiere cargar site-data.js antes.
// =====================================================================
(function(){
  var local = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if(local || navigator.webdriver) return;   // las pruebas locales no cuentan
  if(typeof FIREBASE_CONFIG === 'undefined' || !FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.indexOf('TU_') === 0) return;

  var FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var dbPromise = null;

  function cargar(src){
    return new Promise(function(res, rej){
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function obtenerDb(){
    if(dbPromise) return dbPromise;
    dbPromise = (window.firebase ? Promise.resolve() : cargar(FB + 'firebase-app-compat.js'))
      .then(function(){ return firebase.firestore ? null : cargar(FB + 'firebase-firestore-compat.js'); })
      .then(function(){
        // app con nombre propio: no choca con la que inicializa cada página
        var app = firebase.apps.filter(function(a){ return a.name === 'dmd-stats'; })[0] ||
                  firebase.initializeApp(FIREBASE_CONFIG, 'dmd-stats');
        return app.firestore();
      });
    return dbPromise;
  }
  function sumar(id){
    return obtenerDb().then(function(db){
      return db.collection('stats').doc(id).set({ count: firebase.firestore.FieldValue.increment(1) }, { merge: true });
    });
  }
  function pendiente(clave, valor){ try{ return localStorage.getItem(clave) !== valor; }catch(e){ return false; } }
  function marcar(clave, valor){ try{ localStorage.setItem(clave, valor); }catch(e){} }
  function hoy(){ return new Date().toLocaleDateString('en-CA'); }   // AAAA-MM-DD, hora local

  // la instalación puede ocurrir en cualquier momento
  window.addEventListener('appinstalled', function(){ sumar('instalaciones').catch(function(){}); });

  window.addEventListener('load', function(){
    setTimeout(function(){
      if(!navigator.onLine) return;
      var dia = hoy();
      if(pendiente('dmd_visita_dia', dia)){
        Promise.all([sumar('visitas'), sumar('visitas-' + dia)])
          .then(function(){ marcar('dmd_visita_dia', dia); }).catch(function(){});
      }
      var comoApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      if(comoApp && pendiente('dmd_app_abierta', '1')){
        sumar('dispositivos-app').then(function(){ marcar('dmd_app_abierta', '1'); }).catch(function(){});
      }
    }, 2000);
  });
})();
