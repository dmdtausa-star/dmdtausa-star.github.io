// =====================================================================
//  orbit.js — carrusel orbital 3D para los botones de lugares y hoteles.
//  Las tarjetas giran en una órbita: la del frente se ve grande (efecto de
//  acercamiento) y las de atrás se alejan y se desvanecen.
//
//  Cómo se mueve:
//   - Gira solo, y NO se detiene cuando pasas el mouse por encima.
//   - Arrastrar con el dedo o el mouse: la tarjeta sigue al dedo.
//   - Rueda del mouse o deslizar con dos dedos en el trackpad: gira con ellos
//     (la página sigue haciendo scroll normal con la rueda vertical).
//   - Tocar una tarjeta que no está al frente la trae al frente; tocar la del
//     frente abre su ficha.
//
//  Uso:  DMDOrbit.mount(elemento, [ { name, desc, href, cta, ghost } ... ]);
//   - ghost:true → tarjeta decorativa ("Muy pronto"), sin enlace.
// =====================================================================
(function(){
  var COLORS = ['#00C2A8', '#B388FF', '#FFB020', '#3E8BFF', '#FF7AB6'];
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rgb(hex){ var n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function rgba(hex, a){ var c = rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function shade(hex, f){ var c = rgb(hex); return 'rgb(' + Math.round(c[0] * f) + ',' + Math.round(c[1] * f) + ',' + Math.round(c[2] * f) + ')'; }
  function make(tag, cls){ var e = document.createElement(tag); if(cls) e.className = cls; return e; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function mount(root, items){
    if(!root || !items || !items.length) return;
    var n = items.length;
    var step = 360 / n;
    root.innerHTML = '';
    root.classList.add('orbit');

    // ---------- estructura ----------
    var stage = make('div', 'orbit-stage');
    stage.setAttribute('role', 'group');
    stage.setAttribute('aria-label', 'Carrusel giratorio de opciones');
    var path = make('div', 'orbit-path');
    stage.appendChild(path);

    var nodes = items.map(function(it, i){
      var node = make(it.href ? 'a' : 'div', 'orbit-item' + (it.ghost ? ' ghost' : ''));
      var c = COLORS[i % COLORS.length];
      node.style.setProperty('--c', c);
      node.style.setProperty('--cd', shade(c, 0.6));
      node.style.setProperty('--tint', rgba(c, 0.14));
      node.style.setProperty('--edge', rgba(c, 0.6));
      node.style.setProperty('--shadow', rgba(c, 0.3));
      if(it.href){ node.href = it.href; node.draggable = false; }
      else node.setAttribute('aria-hidden', 'true');

      var top = make('span', 'orbit-top');
      top.appendChild(make('span', 'orbit-dot'));
      var name = make('span', 'orbit-name'); name.textContent = it.name;
      top.appendChild(name);
      node.appendChild(top);
      if(it.desc){ var d = make('span', 'orbit-desc'); d.textContent = it.desc; node.appendChild(d); }
      if(it.href){ var cta = make('span', 'orbit-cta'); cta.textContent = it.cta || 'Ver más →'; node.appendChild(cta); }
      stage.appendChild(node);
      return node;
    });
    root.appendChild(stage);

    // ---------- medidas ----------
    var R = 300, Y = 46, laidOut = false, rot = 0, frontIdx = -1;
    function layout(){
      var W = stage.clientWidth;
      if(!W) return;
      var small = W < 560;
      var cardW = small ? 178 : 244;
      var cardH = small ? 100 : 112;
      R = small ? W * 0.55 : Math.min(W * 0.42, 400);
      Y = small ? 34 : 48;
      stage.style.height = Math.round(2 * Y + cardH * 1.15 + 40) + 'px';
      path.style.width = Math.round(2 * R) + 'px';
      path.style.height = Math.round(2 * Y) + 'px';
      nodes.forEach(function(nd){ nd.style.setProperty('--w', cardW + 'px'); nd.style.setProperty('--h', cardH + 'px'); });
      laidOut = true;
      place(rot);
    }

    // ---------- posición de cada tarjeta ----------
    function place(r){
      if(!laidOut) return;
      var best = -2, bi = 0;
      for(var i = 0; i < n; i++){
        var th = (i * step + r) * Math.PI / 180;
        var c = Math.cos(th), s = Math.sin(th);
        var depth = (c + 1) / 2;                        // 0 = atrás … 1 = al frente
        var sc = 0.5 + 0.62 * Math.pow(depth, 1.7);     // el frente se "acerca" (1.12)
        var vis = 0.15 + 0.85 * Math.pow(depth, 1.6);   // qué tan "nítida" se ve (las de atrás se aclaran con un velo blanco, sin transparentarse)
        var nd = nodes[i];
        nd.style.transform = 'translate(-50%,-50%) translate3d(' + (R * s).toFixed(1) + 'px,' + (Y * c).toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ') rotateY(' + (-s * 30).toFixed(1) + 'deg)';
        nd.style.setProperty('--fade', (1 - vis).toFixed(3));
        nd.style.zIndex = Math.round(depth * 100);
        if(c > best){ best = c; bi = i; }
      }
      if(bi !== frontIdx){
        if(frontIdx >= 0) nodes[frontIdx].classList.remove('is-front');
        nodes[bi].classList.add('is-front');
        frontIdx = bi;
      }
    }
    function angleOf(i){ return (((i * step + rot) % 360) + 540) % 360 - 180; }   // en [-180, 180]

    // ---------- animación ----------
    var AUTO = -9;                    // grados por segundo
    var vel = 0, dragging = false, idleUntil = 0, tween = null, visible = false, last = 0;
    function frame(t){
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if(!visible || !laidOut) return;
      if(tween){
        var k = Math.min(1, (t - tween.t0) / tween.dur);
        rot = tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - k, 3));
        if(k >= 1){ tween = null; idleUntil = t + tween_hold; }
      } else if(!dragging){
        if(Math.abs(vel) > 1){ rot += vel * dt; vel *= Math.pow(0.05, dt); idleUntil = t + 900; }
        else if(!reduceMotion && t > idleUntil){ rot += AUTO * dt; }
      }
      place(rot);
    }
    var tween_hold = 1200;
    function go(to, hold){
      tween = { from: rot, to: to, t0: performance.now(), dur: 560 };
      tween_hold = hold || 1200;
      vel = 0;
    }

    // ---------- arrastrar (dedo o mouse): la tarjeta sigue al dedo ----------
    var lastX = 0, lastT = 0, moved = 0, wasDragged = false;
    function degPerPx(){ return (180 / Math.PI) / R * 1.1; }
    stage.addEventListener('pointerdown', function(e){
      dragging = true; tween = null; vel = 0; moved = 0;
      lastX = e.clientX; lastT = performance.now();
    });
    window.addEventListener('pointermove', function(e){
      if(!dragging) return;
      var now = performance.now();
      var dx = e.clientX - lastX;
      moved += Math.abs(dx);
      var d = dx * degPerPx();
      rot += d;
      vel = vel * 0.55 + (d / (Math.max(1, now - lastT) / 1000)) * 0.45;
      lastX = e.clientX; lastT = now;
    });
    function endDrag(){
      if(!dragging) return;
      dragging = false;
      if(moved > 6){ wasDragged = true; setTimeout(function(){ wasDragged = false; }, 60); }
      if(performance.now() - lastT > 90) vel = 0;       // soltó sin moverse: sin inercia
      vel = clamp(vel, -360, 360);
      idleUntil = performance.now() + 900;
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    stage.addEventListener('dragstart', function(e){ e.preventDefault(); });

    // ---------- rueda del mouse / dos dedos en el trackpad ----------
    stage.addEventListener('wheel', function(e){
      if(e.ctrlKey) return;                              // zoom del navegador: no tocar
      var dx = e.deltaX, dy = e.deltaY;
      if(e.deltaMode === 1){ dx *= 16; dy *= 16; }
      var horizontal = Math.abs(dx) > Math.abs(dy);
      var d = horizontal ? dx : dy;
      tween = null;
      vel = clamp(vel - d * 1.25, -420, 420);
      idleUntil = performance.now() + 900;
      if(horizontal) e.preventDefault();                 // evita el gesto "atrás/adelante" del navegador
    }, { passive: false });

    // ---------- tocar una tarjeta ----------
    stage.addEventListener('click', function(e){
      if(wasDragged){ e.preventDefault(); e.stopPropagation(); }
    }, true);
    nodes.forEach(function(nd, i){
      if(!items[i].href) return;
      nd.addEventListener('click', function(e){
        var th = angleOf(i);
        if(Math.abs(th) > 22){          // no está al frente: la traemos al frente
          e.preventDefault();
          go(rot - th, 4200);
        }                               // si ya está al frente, el enlace abre su ficha
      });
      nd.addEventListener('focus', function(){                                   // con el teclado también
        if(dragging) return;
        try{ if(!nd.matches(':focus-visible')) return; }catch(e){}               // el clic del mouse no cuenta
        go(rot - angleOf(i), 1200);
      });
    });

    // ---------- solo se anima mientras se ve ----------
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        visible = es[0].isIntersecting;
        if(visible && !laidOut) layout();
      }, { threshold: 0.05 }).observe(root);
    } else { visible = true; }
    if('ResizeObserver' in window) new ResizeObserver(layout).observe(stage);
    else window.addEventListener('resize', layout);

    root.__orbit = { get rot(){ return rot; }, get front(){ return frontIdx; } };   // para pruebas
    layout();
    requestAnimationFrame(frame);
  }

  window.DMDOrbit = { mount: mount };
})();
