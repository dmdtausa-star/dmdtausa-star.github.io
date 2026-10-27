// =====================================================================
//  install.js — botón "Instalar app" de DMD.
//  - Android / Chrome / Edge: usa el aviso oficial del navegador
//    (beforeinstallprompt) y abre la ventana de instalación.
//  - iPhone / iPad (Safari): no existe ese aviso, así que el botón muestra
//    las instrucciones de "Añadir a pantalla de inicio".
//  - Si la app ya está instalada (o se abrió como app), el botón no aparece.
// =====================================================================
(function(){
  var yaInstalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if(yaInstalada) return;

  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
              (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var promptGuardado = null;
  var boton = null;

  function ocultadoEnEstaSesion(){
    try{ return sessionStorage.getItem('dmd_install_oculto') === '1'; }catch(e){ return false; }
  }

  function crearBoton(){
    if(boton || ocultadoEnEstaSesion()) return;
    boton = document.createElement('div');
    boton.id = 'dmdInstallBar';
    boton.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:3900;display:flex;align-items:center;' +
      'background:#00C2A8;color:#04211C;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,0.35);' +
      'font-family:"Space Grotesk",sans-serif;font-weight:700;font-size:13.5px;overflow:hidden;';
    boton.innerHTML =
      '<button id="dmdInstallBtn" style="all:unset;cursor:pointer;padding:11px 8px 11px 16px;">📲 Instalar app</button>' +
      '<button id="dmdInstallX" aria-label="Cerrar" style="all:unset;cursor:pointer;padding:11px 14px 11px 6px;opacity:.6;">✕</button>';
    document.body.appendChild(boton);

    document.getElementById('dmdInstallBtn').addEventListener('click', instalar);
    document.getElementById('dmdInstallX').addEventListener('click', function(){
      try{ sessionStorage.setItem('dmd_install_oculto', '1'); }catch(e){}
      quitarBoton();
    });
  }

  function quitarBoton(){
    if(boton){ boton.remove(); boton = null; }
  }

  function instalar(){
    if(promptGuardado){
      promptGuardado.prompt();
      promptGuardado.userChoice.then(function(){
        promptGuardado = null;
        quitarBoton();
      });
      return;
    }
    mostrarAyuda();
  }

  function mostrarAyuda(){
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(6,11,17,0.72);z-index:5000;display:flex;' +
      'align-items:center;justify-content:center;padding:24px;font-family:"Space Grotesk",sans-serif;';
    var pasos = esIOS
      ? '<li>Abre esta página en <strong>Safari</strong>.</li>' +
        '<li>Toca el botón <strong>Compartir</strong> (el cuadro con la flecha hacia arriba).</li>' +
        '<li>Elige <strong>Añadir a pantalla de inicio</strong>.</li>' +
        '<li>Toca <strong>Añadir</strong>.</li>'
      : '<li>Abre el menú del navegador (<strong>⋮</strong>).</li>' +
        '<li>Elige <strong>Instalar app</strong> o <strong>Añadir a pantalla de inicio</strong>.</li>';
    overlay.innerHTML =
      '<div style="background:#101D2B;color:#DCE6EF;border:1px solid #24374B;border-radius:14px;max-width:340px;width:100%;padding:22px;">' +
        '<h3 style="margin:0 0 12px 0;font-size:16px;">Instalar DMD en tu celular</h3>' +
        '<ol style="margin:0 0 16px 18px;padding:0;font-size:13.5px;line-height:1.7;">' + pasos + '</ol>' +
        '<button id="dmdInstallCerrar" style="background:#00C2A8;color:#04211C;border:none;border-radius:9px;padding:10px 18px;font-weight:700;cursor:pointer;font-family:inherit;">Entendido</button>' +
      '</div>';
    document.body.appendChild(overlay);
    function cerrar(){ overlay.remove(); }
    overlay.addEventListener('click', function(e){ if(e.target === overlay) cerrar(); });
    document.getElementById('dmdInstallCerrar').addEventListener('click', cerrar);
  }

  // Android / Chrome / Edge: el navegador avisa cuando se puede instalar
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    promptGuardado = e;
    crearBoton();
  });
  window.addEventListener('appinstalled', quitarBoton);

  // iPhone: no hay aviso del navegador, el botón se muestra siempre
  if(esIOS){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', crearBoton);
    } else {
      crearBoton();
    }
  }
})();
