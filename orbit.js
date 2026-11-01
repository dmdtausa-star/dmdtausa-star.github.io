// =====================================================================
//  orbit.js — carrusel orbital 3D para los botones de lugares y hoteles.
//  Las tarjetas giran en una órbita: la que está al frente se ve grande y
//  brillante, las de atrás más pequeñas y tenues. Se puede arrastrar con el
//  dedo o el mouse, usar las flechas, y se pausa al tocarlo.
//
//  Uso:  DMDOrbit.mount(elemento, [ { name, desc, href, cta, ghost } ... ]);
//   - ghost:true → tarjeta decorativa ("Muy pronto"), sin enlace.
// =====================================================================
(function(){
  var COLORS = ['#00C2A8', '#B388FF', '#FFB020', '#3E8BFF', '#FF7AB6'];
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hexToRgba(hex, a){
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function make(tag, cls){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    return e;
  }
  function cut(s, n){
    s = String(s || '');
    return s.length > n ? s.slice(0, n).trim() + '…' : s;
  }

  function mount(root, items){
    if(!root || !items || !items.length) return;
    var n = items.length;
    var step = 360 / n;
    root.innerHTML = '';
    root.classList.add('orbit');

    // ---------- estructura ----------
    var stage = make('div', 'orbit-stage');
    stage.setAttribute('role', 'group');
    stage.setAttribute('aria-label', 'Carrusel giratorio. Arrastra o usa las flechas para girar.');
    var path = make('div', 'orbit-path');
    stage.appendChild(path);

    var nodes = items.map(function(it, i){
      var node = make(it.href ? 'a' : 'div', 'orbit-item' + (it.ghost ? ' ghost' : ''));
      var c = COLORS[i % COLORS.length];
      node.style.setProperty('--c', c);
      node.style.setProperty('--glow', hexToRgba(c, 0.5));
      node.style.setProperty('--glow2', hexToRgba(c, 0.16));
      if(it.href){ node.href = it.href; node.draggable = false; }
      else node.setAttribute('aria-hidden', 'true');
      var dot = make('span', 'orbit-dot');
      var name = make('span', 'orbit-name');
      name.textContent = it.name;
      node.appendChild(dot);
      node.appendChild(name);
      stage.appendChild(node);
      return node;
    });

    var prev = make('button', 'orbit-arrow prev'); prev.type = 'button'; prev.setAttribute('aria-label', 'Anterior'); prev.textContent = '‹';
    var next = make('button', 'orbit-arrow next'); next.type = 'button'; next.setAttribute('aria-label', 'Siguiente'); next.textContent = '›';
    root.appendChild(stage);
    root.appendChild(prev);   // las flechas van junto al botón de abajo, no encima de las tarjetas
    root.appendChild(next);

    var cap = make('div', 'orbit-caption');
    var capName = make('div', 'orbit-cap-name');
    var capDesc = make('div', 'orbit-cap-desc');
    var capBtn = make('a', 'orbit-cap-btn');
    var hint = make('div', 'orbit-hint');
    hint.textContent = 'Arrastra o desliza para girar';
    cap.appendChild(capName); cap.appendChild(capDesc); cap.appendChild(capBtn); cap.appendChild(hint);
    root.appendChild(cap);

    // ---------- medidas ----------
    var R = 200, Y = 40, W = 0, laidOut = false;
    function layout(){
      W = stage.clientWidth;
      if(!W) return;
      var small = W < 520;
      var pillW = small ? 124 : 188;
      R = small ? W * 0.5 : Math.min(W * 0.42, 400);
      Y = small ? 34 : 46;
      stage.style.height = Math.round(2 * Y + (small ? 130 : 150)) + 'px';
      path.style.width = Math.round(2 * R) + 'px';
      path.style.height = Math.round(2 * Y) + 'px';
      nodes.forEach(function(nd){ nd.style.setProperty('--w', pillW + 'px'); });
      laidOut = true;
      place(rot);
    }

    // ---------- posición de cada tarjeta ----------
    var rot = 0, frontIdx = -1;
    function place(r){
      if(!laidOut) return;
      var best = -2, bi = 0;
      for(var i = 0; i < n; i++){
        var th = (i * step + r) * Math.PI / 180;
        var c = Math.cos(th), s = Math.sin(th);
        var depth = (c + 1) / 2;                       // 0 = atrás … 1 = al frente
        var sc = 0.5 + 0.54 * depth;
        var op = 0.16 + 0.84 * Math.pow(depth, 1.4);
        var nd = nodes[i];
        nd.style.transform = 'translate(-50%,-50%) translate3d(' + (R * s).toFixed(1) + 'px,' + (Y * c).toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ') rotateY(' + (-s * 36).toFixed(1) + 'deg)';
        nd.style.opacity = (items[i].ghost ? op * 0.6 : op).toFixed(3);
        nd.style.zIndex = Math.round(depth * 100);
        if(c > best){ best = c; bi = i; }
      }
      if(bi !== frontIdx){
        if(frontIdx >= 0) nodes[frontIdx].classList.remove('is-front');
        nodes[bi].classList.add('is-front');
        frontIdx = bi;
        setCaption(items[bi]);
      }
    }

    var capTimer = null;
    function setCaption(it){
      cap.classList.add('swap');
      clearTimeout(capTimer);
      capTimer = setTimeout(function(){
        capName.textContent = it.name;
        capDesc.textContent = cut(it.desc, 150);
        if(it.href){ capBtn.href = it.href; capBtn.textContent = it.cta || 'Ver más →'; capBtn.style.display = ''; }
        else capBtn.style.display = 'none';
        cap.classList.remove('swap');
      }, 120);
    }

    // ---------- animación ----------
    var AUTO = -9;                    // grados por segundo (sentido "siguiente")
    var vel = 0, dragging = false, hovering = false, idleUntil = 0, tween = null, visible = false, last = 0;
    function frame(t){
      requestAnimationFrame(frame);
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if(!visible || !laidOut) return;
      if(tween){
        var k = Math.min(1, (t - tween.t0) / tween.dur);
        rot = tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - k, 3));
        if(k >= 1) tween = null;
        idleUntil = t + 1800;
      } else if(!dragging){
        if(Math.abs(vel) > 1){ rot += vel * dt; vel *= Math.pow(0.05, dt); idleUntil = t + 1800; }
        else if(!reduceMotion && !hovering && t > idleUntil){ rot += AUTO * dt; }
      }
      place(rot);
    }
    function go(to){ tween = { from: rot, to: to, t0: performance.now(), dur: 520 }; vel = 0; }
    function snapped(){ return Math.round(rot / step) * step; }
    prev.addEventListener('click', function(){ go(snapped() + step); });
    next.addEventListener('click', function(){ go(snapped() - step); });

    // ---------- arrastrar ----------
    var startX = 0, lastX = 0, lastT = 0, moved = 0, wasDragged = false;
    stage.addEventListener('pointerdown', function(e){
      if(e.target.closest('.orbit-arrow')) return;
      dragging = true; tween = null; vel = 0; moved = 0;
      startX = lastX = e.clientX; lastT = performance.now();
    });
    window.addEventListener('pointermove', function(e){
      if(!dragging) return;
      var now = performance.now();
      var dx = e.clientX - lastX;
      moved += Math.abs(dx);
      rot += dx * 0.32;
      var dtm = Math.max(1, now - lastT);
      vel = vel * 0.6 + (dx * 0.32 / (dtm / 1000)) * 0.4;
      lastX = e.clientX; lastT = now;
    });
    function endDrag(){
      if(!dragging) return;
      dragging = false;
      if(moved > 6){ wasDragged = true; setTimeout(function(){ wasDragged = false; }, 60); }
      if(Math.abs(vel) > 220) vel = vel > 0 ? 220 : -220;
      idleUntil = performance.now() + 2200;
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    stage.addEventListener('click', function(e){
      if(wasDragged){ e.preventDefault(); e.stopPropagation(); }
    }, true);
    stage.addEventListener('dragstart', function(e){ e.preventDefault(); });
    stage.addEventListener('mouseenter', function(){ hovering = true; });
    stage.addEventListener('mouseleave', function(){ hovering = false; idleUntil = performance.now() + 600; });

    // con el teclado: al enfocar una tarjeta, se trae al frente
    nodes.forEach(function(nd, i){
      nd.addEventListener('focus', function(){
        var th = (((i * step + rot) % 360) + 540) % 360 - 180;   // ángulo en [-180, 180]
        go(rot - th);
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

    layout();
    requestAnimationFrame(frame);
  }

  window.DMDOrbit = { mount: mount };
})();
