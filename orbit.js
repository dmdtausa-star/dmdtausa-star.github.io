// =====================================================================
//  orbit.js — carrusel orbital 3D para los botones de lugares y hoteles.
//  Las tarjetas giran en una órbita: la del frente se ve grande (efecto de
//  acercamiento) y las de atrás se alejan y casi desaparecen.
//
//  Cómo se mueve:
//   - Gira solo y NUNCA se detiene: ni al pasar el mouse, ni después de
//     deslizar. Si deslizas a la izquierda o a la derecha, sigue girando hacia
//     ese lado.
//   - Arrastrar con el dedo o el mouse: la tarjeta sigue al dedo.
//   - Rueda del mouse o dos dedos en el trackpad: gira con ellos y la página
//     NO se mueve mientras el mouse está sobre el carrusel (si la página ya
//     venía haciendo scroll, ese scroll sigue de largo).
//   - Un clic (o un toque en el celular) sobre cualquier tarjeta abre su ficha.
//
//  Uso:  DMDOrbit.mount(elemento, [ { name, href, ghost } ... ]);
//   - ghost:true → tarjeta decorativa ("Muy pronto"), sin enlace.
//  Colores: solo los del logo de DMD (azul marino, verde y verde oscuro).
// =====================================================================
(function(){
  var COLORS = ['#022D5A', '#449129', '#024E27'];
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

    var nodes = items.map(function(it, i){
      var node = make(it.href ? 'a' : 'div', 'orbit-item' + (it.ghost ? ' ghost' : ''));
      var c = COLORS[i % COLORS.length];
      node.style.setProperty('--c', c);
      node.style.setProperty('--cd', shade(c, 0.85));
      node.style.setProperty('--tint', rgba(c, 0.13));
      node.style.setProperty('--edge', rgba(c, 0.55));
      node.style.setProperty('--shadow', rgba(c, 0.28));
      if(it.href){ node.href = it.href; node.draggable = false; }
      else node.setAttribute('aria-hidden', 'true');

      var top = make('span', 'orbit-top');
      top.appendChild(make('span', 'orbit-dot'));
      var name = make('span', 'orbit-name'); name.textContent = it.name;
      top.appendChild(name);
      node.appendChild(top);
      stage.appendChild(node);
      return node;
    });
    root.appendChild(stage);

    // ---------- medidas ----------
    var R = 300, Y = 30, laidOut = false, rot = 0, frontIdx = -1;
    function layout(){
      var W = stage.clientWidth;
      if(!W) return;
      var small = W < 560;
      var cardW = small ? 150 : 214;
      var cardH = small ? 64 : 70;
      R = small ? W * 0.62 : Math.min(W * 0.46, 450);     // órbita ancha: las tarjetas quedan bien separadas y hacia los lados
      Y = small ? 26 : 30;                                // órbita casi plana: se ve menos como una "rueda"
      stage.style.height = Math.round(2 * Y + cardH * 1.15 + 56) + 'px';
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
        var depth = (c + 1) / 2;                          // 0 = atrás … 1 = al frente
        var sc = 0.55 + 0.55 * Math.pow(depth, 1.6);      // el frente se "acerca" (1.10)
        var vis = Math.pow(depth, 2.2);                   // nitidez: las de atrás casi no se ven
        var nd = nodes[i];
        nd.style.transform = 'translate(-50%,-50%) translate3d(' + (R * s).toFixed(1) + 'px,' + (Y * c).toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ') rotateY(' + (-s * 28).toFixed(1) + 'deg)';
        nd.style.setProperty('--fade', (1 - vis).toFixed(3));
        nd.style.opacity = clamp((depth - 0.1) / 0.35, 0, 1).toFixed(3);
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

    // ---------- animación: nunca se detiene ----------
    var CRUISE = 10;                  // grados por segundo
    var dir = -1;                     // hacia dónde sigue girando (-1 izquierda, 1 derecha): el último gesto manda
    var vel = dir * CRUISE, dragging = false, idleUntil = 0, tween = null, visible = false, last = 0, tweenHold = 1200;
    function frame(t){
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if(!visible || !laidOut) return;
      if(tween){
        var k = Math.min(1, (t - tween.t0) / tween.dur);
        rot = tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - k, 3));
        if(k >= 1){ tween = null; idleUntil = t + tweenHold; vel = 0; }
      } else if(!dragging && t >= idleUntil){
        // la velocidad se acerca suavemente a la de crucero, en la dirección del último gesto
        var target = reduceMotion ? 0 : dir * CRUISE;
        vel += (target - vel) * (1 - Math.pow(0.15, dt));
        rot += vel * dt;
      }
      place(rot);
    }
    function go(to, hold){
      tween = { from: rot, to: to, t0: performance.now(), dur: 560 };
      tweenHold = hold || 1200;
      vel = 0;
    }

    // ---------- arrastrar (dedo o mouse): la tarjeta sigue al dedo ----------
    var lastX = 0, lastT = 0, moved = 0, wasDragged = false;
    function degPerPx(){ return (180 / Math.PI) / R * 1.1; }
    stage.addEventListener('pointerdown', function(e){
      dragging = true; tween = null; idleUntil = 0; vel = 0; moved = 0;
      lastX = e.clientX; lastT = performance.now();
    });
    window.addEventListener('pointermove', function(e){
      if(!dragging) return;
      var now = performance.now();
      var dx = e.clientX - lastX;
      moved += Math.abs(dx);
      var d = dx * degPerPx();
      rot += d;
      if(Math.abs(dx) > 0.5) dir = dx > 0 ? 1 : -1;
      vel = vel * 0.55 + (d / (Math.max(1, now - lastT) / 1000)) * 0.45;
      lastX = e.clientX; lastT = now;
    });
    function endDrag(){
      if(!dragging) return;
      dragging = false;
      if(moved > 6){ wasDragged = true; setTimeout(function(){ wasDragged = false; }, 60); }
      if(performance.now() - lastT > 90) vel = dir * 4;          // soltó sin mover: arranca suave en esa dirección
      vel = clamp(vel, -420, 420);                               // si lo soltó con impulso, sigue con ese impulso y baja a la velocidad de crucero
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    stage.addEventListener('dragstart', function(e){ e.preventDefault(); });

    // ---------- rueda del mouse / dos dedos en el trackpad ----------
    var lastPageScroll = 0;
    window.addEventListener('scroll', function(){ lastPageScroll = performance.now(); }, { passive: true });
    stage.addEventListener('wheel', function(e){
      if(e.ctrlKey) return;                              // zoom del navegador: no tocar
      if(performance.now() - lastPageScroll < 140) return; // la página ya venía con scroll: déjala seguir de largo
      var dx = e.deltaX, dy = e.deltaY;
      if(e.deltaMode === 1){ dx *= 16; dy *= 16; }
      var horizontal = Math.abs(dx) > Math.abs(dy);
      var d = horizontal ? dx : dy;
      if(!d) return;
      e.preventDefault();                                // la página no se mueve: solo gira el carrusel
      tween = null; idleUntil = 0;
      vel = clamp(vel - d * 1.25, -420, 420);
      dir = (-d) > 0 ? 1 : -1;                           // sigue hacia el lado al que lo empujaste
    }, { passive: false });

    // ---------- clic o toque: abre la ficha (un arrastre no cuenta como clic) ----------
    stage.addEventListener('click', function(e){
      if(wasDragged){ e.preventDefault(); e.stopPropagation(); }
    }, true);
    nodes.forEach(function(nd, i){
      if(!items[i].href) return;
      nd.addEventListener('focus', function(){                                   // con el teclado, la tarjeta enfocada pasa al frente
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

    root.__orbit = { get rot(){ return rot; }, get front(){ return frontIdx; }, get vel(){ return vel; } };   // para pruebas
    layout();
    requestAnimationFrame(frame);
  }

  window.DMDOrbit = { mount: mount };
})();
