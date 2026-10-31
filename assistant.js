// =====================================================================
//  assistant.js — asistente virtual de DMD.
//
//  Dos modos:
//   1. CON IA (si DMD_AI_ENDPOINT en site-data.js tiene la dirección del Worker):
//      las preguntas van a la IA, que conoce los lugares, hoteles y el sitio, y
//      además responde preguntas generales. La clave de la IA NUNCA está en este
//      archivo: vive en el Worker (ver worker.js).
//   2. SIN IA (modo local, también es el respaldo si la IA falla o no hay internet):
//      entiende preguntas buscando coincidencias en site-data.js (PLACES, HOTELS,
//      MUNICIPIO_CONTACTO, DMD_CONTACTO).
//
//  Compartido por index.html, mapa.html, lugar.html, hotel.html y acerca.html.
//  Requiere site-data.js antes que este archivo y el HTML del widget (ver site.css).
// =====================================================================
(function(){
  const toggleBtn = document.getElementById('assistantToggle');
  const panel = document.getElementById('assistantPanel');
  const closeBtn = document.getElementById('assistantClose');
  const messagesEl = document.getElementById('assistantMessages');
  const suggestionsEl = document.getElementById('assistantSuggestions');
  const inputEl = document.getElementById('assistantInput');
  const sendBtn = document.getElementById('assistantSend');
  if(!toggleBtn || !panel) return;

  const AI_URL = (typeof DMD_AI_ENDPOINT === 'string') ? DMD_AI_ENDPOINT.trim() : '';

  // ---------- la "cara" del asistente (mascota SVG, sin imágenes externas) ----------
  const MASCOT_SVG = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="32" cy="36" r="24" fill="#00C2A8"/>' +
    '<path d="M32 4C25.4 4 20 9.4 20 16c0 8.5 12 24 12 24s12-15.5 12-24c0-6.6-5.4-12-12-12z" fill="#00967F"/>' +
    '<circle cx="32" cy="15.5" r="3.6" fill="#fff"/>' +
    '<circle cx="23" cy="34" r="4.4" fill="#fff"/>' +
    '<circle cx="41" cy="34" r="4.4" fill="#fff"/>' +
    '<circle cx="24" cy="35" r="2" fill="#0B1622"/>' +
    '<circle cx="42" cy="35" r="2" fill="#0B1622"/>' +
    '<path d="M22 44c3.2 4.2 16.6 4.2 20 0" stroke="#0B1622" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
  '</svg>';

  toggleBtn.innerHTML = MASCOT_SVG;
  const headerAvatar = document.getElementById('assistantHeaderAvatar');
  if(headerAvatar) headerAvatar.innerHTML = MASCOT_SVG;

  // ---------- utilidades ----------
  function normalize(s){
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function esc(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function cut(s, n){
    s = String(s || '');
    return s.length > n ? s.slice(0, n).trim() + '…' : s;
  }

  function addMessage(html, sender){
    const row = document.createElement('div');
    row.className = 'msg-row ' + (sender === 'bot' ? 'bot-row' : 'user-row');
    row.innerHTML = (sender === 'bot' ? '<div class="msg-avatar">' + MASCOT_SVG + '</div>' : '') +
      '<div class="msg ' + sender + '">' + html + '</div>';
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }
  function addBotMessage(html){
    // pequeño retraso para que se sienta como una respuesta, no un salto brusco
    setTimeout(function(){ addMessage(html, 'bot'); }, 350);
  }
  function addTyping(){
    const row = document.createElement('div');
    row.className = 'msg-row bot-row';
    row.innerHTML = '<div class="msg-avatar">' + MASCOT_SVG + '</div><div class="msg bot typing"><i></i><i></i><i></i></div>';
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return row;
  }

  function setSuggestions(list){
    suggestionsEl.innerHTML = '';
    list.forEach(function(s){
      const btn = document.createElement('button');
      btn.textContent = s.label;
      btn.addEventListener('click', function(){
        addMessage(esc(s.label), 'user');
        handleQuery(s.query || s.label, { local: true });
      });
      suggestionsEl.appendChild(btn);
    });
  }

  function defaultSuggestions(){
    setSuggestions([
      { label: '¿Qué lugares hay?' },
      { label: '¿Dónde puedo hospedarme?' },
      { label: '¿Cómo uso el mapa?' },
      { label: 'Contacto' }
    ]);
  }

  // =====================================================================
  //  MODO CON IA
  // =====================================================================
  let busy = false;
  let history = [];

  // convierte la respuesta de la IA en HTML seguro (enlaces solo a páginas de DMD o https)
  function formatAI(text){
    let h = esc(text);
    h = h.replace(/\[([^\]]+)\]\(((?:lugar|hotel|mapa|acerca|index)\.html(?:\?[\w=%.\-]*)?|https:\/\/[^\s)]+)\)/g, function(m, label, url){
      const ext = url.indexOf('https:') === 0;
      return '<a href="' + url + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a>';
    });
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/^\s*[-*]\s+/gm, '• ');
    return h.replace(/\n/g, '<br>');
  }

  function askAI(text){
    if(busy){ addBotMessage('Dame un segundo, todavía estoy terminando la respuesta anterior.'); return; }
    busy = true;
    history.push({ role: 'user', content: text.slice(0, 600) });
    history = history.slice(-10);
    const typing = addTyping();
    const ctrl = new AbortController();
    const timer = setTimeout(function(){ ctrl.abort(); }, 25000);

    fetch(AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
      signal: ctrl.signal
    })
    .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
    .then(function(res){
      if(!res.ok || !res.j || !res.j.reply) throw new Error('sin respuesta');
      typing.remove();
      history.push({ role: 'assistant', content: res.j.reply });
      addMessage(formatAI(res.j.reply), 'bot');
    })
    .catch(function(){
      typing.remove();
      history.pop();   // quita la pregunta que no se pudo responder
      addMessage('Mi conexión con la IA no responde en este momento. Te ayudo con lo que sé del sitio:', 'bot');
      handleLocal(text);
    })
    .finally(function(){ clearTimeout(timer); busy = false; });
  }

  // =====================================================================
  //  MODO LOCAL — lugares
  // =====================================================================
  function placesListHtml(){
    const items = PLACES.map(function(p){
      return '<li><a href="lugar.html?p=' + p.slug + '">' + esc(p.name) + '</a></li>';
    }).join('');
    return 'Estos son los lugares que tenemos en Tausa:<ul>' + items + '</ul>Escribe el nombre de cualquiera y te cuento más.';
  }

  function findPlaceInText(text){
    const q = normalize(text);
    // primero intenta una coincidencia de nombre completo, luego por palabras sueltas (min 4 letras, para evitar falsos positivos con palabras cortas)
    let match = PLACES.find(function(p){ return q.indexOf(normalize(p.name)) !== -1; });
    if(match) return match;
    const words = q.split(/\s+/).filter(function(w){ return w.length >= 4; });
    match = PLACES.find(function(p){
      const pname = normalize(p.name);
      return words.some(function(w){ return pname.indexOf(w) !== -1; });
    });
    return match || null;
  }

  function summarizePlace(place){
    let html = '<strong>' + esc(place.name) + '</strong><br>' + esc(place.desc || '');
    if(place.historia){
      html += '<br><br>' + esc(cut(place.historia, 220));
    }
    if(place.actividades && place.actividades.length){
      html += '<br><br><em>Se puede:</em> ' + esc(place.actividades.join(', ')) + '.';
    }
    if(place.destacado){
      html += '<br><br>⚠️ <em>' + esc(place.destacado.titulo) + ':</em> ' + esc(place.destacado.texto);
    }
    html += '<br><br><a href="lugar.html?p=' + place.slug + '">Ver ficha completa →</a>';
    return html;
  }

  // =====================================================================
  //  MODO LOCAL — hoteles
  // =====================================================================
  const GENERIC_HOTEL_WORDS = ['hotel', 'embalse', 'neusa', 'boutique', 'tausa'];
  function findHotelInText(text){
    if(typeof HOTELS === 'undefined') return null;
    const q = normalize(text);
    let match = HOTELS.find(function(h){ return q.indexOf(normalize(h.name)) !== -1; });
    if(match) return match;
    return HOTELS.find(function(h){
      return normalize(h.name).split(/[^a-z0-9]+/).filter(function(w){
        return w.length >= 4 && GENERIC_HOTEL_WORDS.indexOf(w) === -1;
      }).some(function(k){ return q.indexOf(k) !== -1; });
    }) || null;
  }

  function hotelsListHtml(){
    if(typeof HOTELS === 'undefined' || !HOTELS.length) return 'Todavía no tengo hoteles registrados.';
    const items = HOTELS.map(function(h){
      return '<li><a href="hotel.html?h=' + h.slug + '">' + esc(h.name) + '</a></li>';
    }).join('');
    return 'Para hospedarte en Tausa tenemos:<ul>' + items + '</ul>Pregúntame por habitaciones, precios, mascotas o cómo llegar a cualquiera de ellos.';
  }

  function contactLinesHtml(h){
    let out = '';
    (h.contactos || []).forEach(function(c){
      out += '<br><strong>' + esc(c.titulo) + '</strong>';
      (c.lineas || []).forEach(function(l){
        out += '<br>' + (l.href ? '<a href="' + esc(l.href) + '"' + (l.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l.texto) + '</a>' : esc(l.texto));
      });
    });
    return out;
  }

  function hotelAnswer(h, q){
    const ficha = '<br><br><a href="hotel.html?h=' + h.slug + '">Ver ficha completa →</a>';
    const nombre = '<strong>' + esc(h.name) + '</strong>';

    if(/habitacion|cuarto|suite|cabana|dormir|alojamiento/.test(q)){
      if(!h.habitaciones || !h.habitaciones.length) return 'Todavía no tengo las habitaciones de ' + nombre + ' registradas.' + ficha;
      const li = h.habitaciones.map(function(r){
        const det = r.capacidad || r.tipo || '';
        return '<li>' + esc(r.nombre) + (det ? ' — ' + esc(det) : '') + (r.nota ? ' · ' + esc(r.nota) : '') + '</li>';
      }).join('');
      return 'Habitaciones de ' + nombre + ':<ul>' + li + '</ul>' + (h.habitacionesNota ? esc(cut(h.habitacionesNota, 240)) : '') + ficha;
    }
    if(/precio|tarifa|cuanto cuesta|costo|valor|cuanto vale/.test(q)){
      if(h.tarifas && h.tarifas.items && h.tarifas.items.length){
        const li = h.tarifas.items.map(function(t){ return '<li>' + esc(t.habitacion) + ': ' + esc(t.valor) + '</li>'; }).join('');
        return esc(h.tarifas.titulo || 'Tarifas') + ' de ' + nombre + ':<ul>' + li + '</ul>' + esc(cut(h.tarifas.aviso || 'Pueden variar: confírmalas con el hotel.', 220)) + ficha;
      }
      return esc((h.precioNota || 'Los precios de ' + h.name + ' cambian según temporada y huéspedes: consúltalos directamente con el hotel.').replace(/^💡\s*/, '')) + ficha;
    }
    if(/mascota|perro|gato|pet/.test(q)){
      if(!h.petFriendly) return 'No tengo registrada la política de mascotas de ' + nombre + '. Mejor confírmalo con el hotel antes de viajar.' + contactLinesHtml(h);
      const li = h.petFriendly.reglas.slice(0, 6).map(function(r){ return '<li>' + esc(r) + '</li>'; }).join('');
      return nombre + ' es pet friendly. Lo principal:<ul>' + li + '</ul>' + esc(h.petFriendly.sancion || '') + ficha;
    }
    if(/restaurante|comida|comer|menu|desayuno|plato|almuerzo/.test(q)){
      if(!h.restaurante) return 'No tengo registrado el restaurante de ' + nombre + '.' + ficha;
      const r = h.restaurante;
      return nombre + ': ' + esc(cut(r.descripcion, 260)) + (r.platos ? '<br><br><em>Algunos platos:</em> ' + esc(r.platos.slice(0, 8).join(', ')) + '.' : '') + (r.horario ? '<br>🕒 ' + esc(r.horario) : '') + ficha;
    }
    if(/evento|boda|matrimonio|reunion|corporativ|celebracion|cumple/.test(q)){
      if(!h.eventos) return 'No tengo registrados los eventos de ' + nombre + '.' + ficha;
      const li = (h.eventos.espacios || []).map(function(e){ return '<li>' + esc(e.nombre) + ' — ' + esc(e.capacidad) + '</li>'; }).join('');
      return nombre + ': ' + esc(cut(h.eventos.descripcion, 280)) + (li ? '<ul>' + li + '</ul>' : '') + ficha;
    }
    if(/telefono|contacto|whatsapp|reserv|llamar|web|pagina|instagram|facebook|correo/.test(q)){
      return 'Contacto de ' + nombre + ':' + contactLinesHtml(h) + ficha;
    }
    if(/wifi|internet|parqueadero|check|hora|entrada|salida|altitud/.test(q)){
      if(!h.infoUtil) return 'No tengo la información práctica de ' + nombre + ' registrada.' + ficha;
      const labels = { checkin: 'Check-in', checkout: 'Check-out', wifi: 'Wi-Fi', parqueadero: 'Parqueadero', mascotas: 'Mascotas', altitud: 'Altitud' };
      const li = Object.keys(h.infoUtil).map(function(k){ return '<li>' + esc(labels[k] || k) + ': ' + esc(h.infoUtil[k]) + '</li>'; }).join('');
      return 'Info útil de ' + nombre + ':<ul>' + li + '</ul>' + ficha;
    }
    if(/como llego|como llegar|ruta|ubicacion|donde queda|direccion/.test(q)){
      return nombre + ' queda en ' + esc(h.ubicacion || 'Tausa') + (h.comoLlegar ? '<br><br>' + esc(cut(h.comoLlegar, 300)) : '') +
        '<br><br><a href="mapa.html?h=' + h.slug + '">Cómo llegar en el mapa de DMD →</a>';
    }
    // resumen general
    return nombre + (h.categoria ? '<br><em>' + esc(h.categoria) + '</em>' : '') + '<br>' + esc(cut(h.descripcion || h.desc || '', 260)) + ficha;
  }

  function hotelSuggestions(h){
    setSuggestions([
      { label: 'Habitaciones', query: 'habitaciones de ' + h.name },
      { label: 'Precios', query: 'precios de ' + h.name },
      { label: 'Contacto', query: 'contacto de ' + h.name },
      { label: '¿Cómo llego?', query: 'como llego a ' + h.name }
    ]);
  }

  // =====================================================================
  //  MODO LOCAL — contacto, fotos y demás
  // =====================================================================
  function contactHtml(){
    return 'Datos de contacto:<br><br>' +
      '<strong>' + esc(MUNICIPIO_CONTACTO.nombre) + '</strong><br>' +
      '☎ ' + esc(MUNICIPIO_CONTACTO.telefono) + '<br>' +
      '✉ ' + esc(MUNICIPIO_CONTACTO.correo) + '<br>' +
      '📍 ' + esc(MUNICIPIO_CONTACTO.direccion) + '<br><br>' +
      '<strong>DMD (esta página)</strong><br>' +
      '☎ ' + esc(DMD_CONTACTO.telefono) + '<br>' +
      '✉ ' + esc(DMD_CONTACTO.correo);
  }

  function photosAuthorHtml(place){
    if(place && place.fotosCredito){
      return 'Las fotos de <strong>' + esc(place.name) + '</strong> fueron tomadas por ' + esc(place.fotosCredito) + '.';
    }
    if(place){
      return 'Todavía no tengo registrado quién tomó las fotos de ' + esc(place.name) + '.';
    }
    const authors = Array.from(new Set(PLACES.map(function(p){ return p.fotosCredito; }).filter(Boolean)));
    if(!authors.length) return 'Todavía no tengo el crédito de las fotos registrado.';
    return 'Las fotos del sitio fueron tomadas por ' + authors.join(' y ') + '.';
  }

  // ---------- entender la pregunta (modo local) ----------
  function handleLocal(rawText){
    const q = normalize(rawText);

    // saludo
    if(/^(hola|buenas|hey|ola|buenos dias|buenas tardes|buenas noches)/.test(q)){
      addBotMessage('¡Hola! Soy la asistente de DMD 👋 Puedo ayudarte a encontrar un lugar, un hotel, resumirte su historia, explicarte el mapa o darte el contacto de la Alcaldía. ¿Qué necesitas?');
      setTimeout(defaultSuggestions, 400);
      return;
    }

    // qué es DMD / el sitio
    if(q.indexOf('que es dmd') !== -1 || q.indexOf('que es esta pagina') !== -1 || q.indexOf('que es esto') !== -1){
      addBotMessage('DMD (Directorio y Mapa Digital) es un proyecto turístico y digital creado para dar a conocer la riqueza de Tausa, Cundinamarca: conecta a visitantes y comunidad con sus lugares, paisajes, historia, cultura y naturaleza a través de un mapa virtual, fotos, videos y contenido con dron. <a href="acerca.html">Conoce más sobre el proyecto →</a>');
      return;
    }

    // un hotel específico
    const hotel = findHotelInText(q);
    if(hotel){
      addBotMessage(hotelAnswer(hotel, q));
      setTimeout(function(){ hotelSuggestions(hotel); }, 500);
      return;
    }

    // lista de hoteles / dónde hospedarse
    if(/hotel|hospedar|alojar|alojamiento|donde dormir|donde quedarme|donde me quedo/.test(q)){
      addBotMessage(hotelsListHtml());
      return;
    }

    // listar lugares
    if(/lugares|sitios|que hay|destinos|donde puedo ir/.test(q)){
      addBotMessage(placesListHtml());
      return;
    }

    // cómo usar el mapa
    if(q.indexOf('mapa') !== -1 && /como|usar|funciona|sirve/.test(q)){
      addBotMessage('El mapa (<a href="mapa.html">ábrelo aquí</a>) te muestra tu ubicación en vivo y todos los lugares y hoteles marcados. Toca cualquier marcador para ver su nombre, foto y descripción, y presiona "Cómo llegar" para trazar la ruta desde donde estás.');
      return;
    }

    // cómo buscar
    if(/como busco|como encuentro|como funciona la busqueda|buscador/.test(q)){
      addBotMessage('Puedes usar la barra de búsqueda de arriba (escribe el nombre del lugar o del hotel), o simplemente pregúntamelo aquí mismo — por ejemplo escribe "Mirador Neusa" y te cuento de qué se trata.');
      return;
    }

    // contacto
    if(/contacto|telefono|correo|email|alcaldia/.test(q)){
      addBotMessage(contactHtml());
      return;
    }

    // cómo llegar
    if(/como llego|como llegar|direccion|ruta/.test(q)){
      const place = findPlaceInText(q);
      if(place){
        addBotMessage('Para llegar a <strong>' + esc(place.name) + '</strong>, abre su <a href="lugar.html?p=' + place.slug + '">ficha</a> y presiona el botón "Cómo llegar" — te va a llevar al mapa con la ruta ya trazada desde tu ubicación.');
      } else {
        addBotMessage('¿A qué lugar quieres llegar? Dime el nombre, o abre directamente el <a href="mapa.html">mapa</a> y elige uno de los marcadores.');
      }
      return;
    }

    // quién hizo esto / quién programó al asistente
    if(/quien (hizo|creo|desarrollo|programo)|creador|autor del sitio|quien te (creo|hizo|programo)/.test(q)){
      addBotMessage('Esta página (y yo) fuimos creados por DMD Studio, como proyecto de grado 11 del SENA.');
      return;
    }

    // quién tomó las fotos
    if(/quien tomo|fotografo|autor de las fotos|credito de las fotos|quien es el fotografo/.test(q)){
      const place = findPlaceInText(q);
      addBotMessage(photosAuthorHtml(place));
      return;
    }

    // para qué fue creada la página / objetivo / propósito
    if(/para que (fue creada|sirve|se hizo)|objetivo (de|del) sitio|proposito|por que se hizo|por que existe esta pagina/.test(q)){
      addBotMessage('El propósito de DMD es promover el turismo de Tausa mediante herramientas digitales, facilitando que los visitantes encuentren, conozcan y lleguen a los diferentes lugares turísticos, culturales e históricos del municipio — y de paso, apoyar la visibilidad de los comercios y comunidades locales. También es el proyecto de grado 11 de DMD Studio para el SENA. <a href="acerca.html">Ver el objetivo completo →</a>');
      return;
    }

    // qué significan las siglas DMD
    if(/que significa dmd|significado de dmd|siglas de dmd/.test(q)){
      addBotMessage('DMD significa <strong>Directorio y Mapa Digital</strong> — así se llama este proyecto de turismo digital para Tausa.');
      return;
    }

    // misión
    if(/mision de dmd|cual es la mision/.test(q)){
      addBotMessage('Nuestra misión es promover el reconocimiento de los lugares turísticos de Tausa mediante un mapa virtual y una página web que faciliten a los visitantes encontrar información sobre los destinos, conocer su historia y descubrir la riqueza cultural, natural e histórica del municipio. <a href="acerca.html">Leer más →</a>');
      return;
    }

    // visión
    if(/vision de dmd|cual es la vision/.test(q)){
      addBotMessage('Nuestra visión es convertir a DMD, en un plazo de 5 años, en una herramienta de referencia para que habitantes y visitantes puedan ubicar y conocer fácilmente los principales sitios turísticos de Tausa, mediante un mapa virtual moderno, práctico y fácil de utilizar. <a href="acerca.html">Leer más →</a>');
      return;
    }

    // valores
    if(/valores de dmd|cuales son los valores/.test(q)){
      addBotMessage('Nuestros valores son: <strong>Innovación</strong> (usar tecnología para promocionar Tausa), <strong>Identidad</strong> (valorar su historia y cultura), <strong>Compromiso</strong> (ofrecer información de calidad), <strong>Creatividad</strong> (contenido visual atractivo) y <strong>Desarrollo local</strong> (apoyar comercios y comunidades). <a href="acerca.html">Ver más →</a>');
      return;
    }

    // objetivos específicos
    if(/objetivos de dmd|cuales son los objetivos/.test(q)){
      addBotMessage('Entre nuestros objetivos están: mantener un mapa virtual GPS de Tausa, dar a conocer sus sitios turísticos por la web y redes sociales, crear contenido con fotografía, video y dron, facilitar cómo llegar a cada destino, y apoyar a los comercios y emprendimientos locales. <a href="acerca.html">Ver la lista completa →</a>');
      return;
    }

    // pregunta por un lugar específico (historia, actividades, leyenda, resumen, o solo el nombre)
    const place = findPlaceInText(q);
    if(place){
      if(q.indexOf('leyenda') !== -1){
        addBotMessage(place.leyenda ? '📖 ' + esc(place.leyenda) + ' (recuerda que esto es tradición oral, no un hecho histórico confirmado).' : 'No tengo registrada ninguna leyenda para ' + esc(place.name) + '.');
        return;
      }
      if(q.indexOf('actividad') !== -1 || q.indexOf('que se puede hacer') !== -1){
        addBotMessage(place.actividades && place.actividades.length ? 'En ' + esc(place.name) + ' se puede: ' + esc(place.actividades.join(', ')) + '.' : 'Todavía no tengo actividades registradas para ' + esc(place.name) + '.');
        return;
      }
      if(q.indexOf('prohibi') !== -1){
        addBotMessage(place.prohibiciones && place.prohibiciones.length ? 'En ' + esc(place.name) + ' ten en cuenta: ' + esc(place.prohibiciones.join(', ')) + '.' : 'No tengo prohibiciones específicas registradas para ' + esc(place.name) + '.');
        return;
      }
      addBotMessage(summarizePlace(place));
      setTimeout(function(){
        setSuggestions([
          { label: 'Ver ficha completa', query: '__link__' + place.slug },
          { label: '¿Cómo llego?', query: 'como llego a ' + place.name },
          { label: 'Otro lugar', query: '¿qué lugares hay?' }
        ]);
      }, 500);
      return;
    }

    // no se entendió nada
    addBotMessage(AI_URL
      ? 'Esa no la tengo a la mano 🤔 Puedo ayudarte con lugares, hoteles, el mapa o el contacto de la Alcaldía.'
      : 'No estoy segura de haber entendido 🤔 Puedo ayudarte a buscar un lugar o un hotel (dime su nombre), resumir su historia, explicarte el mapa o darte el contacto de la Alcaldía.');
    setTimeout(defaultSuggestions, 400);
  }

  // ---------- punto de entrada ----------
  function handleQuery(rawText, opts){
    opts = opts || {};
    const q = normalize(rawText);

    // botón directo "ver ficha completa"
    if(q.indexOf('__link__') === 0){
      window.location.href = 'lugar.html?p=' + encodeURIComponent(rawText.replace('__link__', ''));
      return;
    }
    const saludoCorto = /^(hola|buenas|hey|ola|buenos dias|buenas tardes|buenas noches)\W*$/.test(q);
    if(!AI_URL || opts.local || saludoCorto){ handleLocal(rawText); return; }
    askAI(rawText);
  }

  // ---------- eventos del widget ----------
  let started = false;
  function openPanel(){
    panel.classList.add('open');
    if(!started){
      started = true;
      addMessage(AI_URL
        ? '¡Hola! Soy la asistente de DMD 👋 Conozco los lugares y hoteles de Tausa y también puedo ayudarte con otras preguntas. ¿Qué necesitas?'
        : '¡Hola! Soy la asistente de DMD 👋 Puedo ayudarte a encontrar un lugar o un hotel, resumir su historia o explicarte cómo usar el mapa. ¿Qué necesitas?', 'bot');
      defaultSuggestions();
    }
    inputEl.focus();
  }
  function closePanel(){ panel.classList.remove('open'); }

  toggleBtn.addEventListener('click', function(){
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  function send(){
    const text = inputEl.value.trim().slice(0, 600);
    if(!text) return;
    addMessage(esc(text), 'user');
    inputEl.value = '';
    suggestionsEl.innerHTML = '';
    handleQuery(text);
  }
  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', function(e){
    if(e.key === 'Enter') send();
  });
})();
