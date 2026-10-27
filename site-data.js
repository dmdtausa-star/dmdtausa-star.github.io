// =====================================================================
//  site-data.js — DATOS DEL SITIO, EN UN SOLO LUGAR
//  Todas las páginas (inicio, cada lugar, y el mapa) leen este mismo
//  archivo. Edita aquí — no hace falta tocar nada más.
// =====================================================================

// ---------- UBICACIONES PROPIAS ----------
// Solo el administrador las edita aquí, en el código. Los visitantes no
// pueden agregar, editar ni borrar lugares — solo verlos.
//
// Campos de cada lugar:
//   name          Nombre visible
//   desc          Descripción corta (pin, lista, botón)
//   lat, lng      Coordenadas
//   photos        Lista de rutas o links a imágenes (opcional, [] si no hay)
//   fotosCredito  Nombre del fotógrafo a acreditar (opcional, '' si no hay)
//   video         Link de YouTube o .mp4 (opcional, '' si no hay)
//   historia      Origen del lugar, quién lo construyó/fundó, cuándo
//   acontecimientos  Hechos importantes asociados (opcional, '' si no hay)
//   cultura       Pueblos/culturas que habitaron la zona (opcional, '' si no hay)
//   leyenda       Relato o leyenda tradicional (opcional, '' si no hay —
//                 siempre se muestra aclarando que es tradición oral)
//   destacado     Recuadro especial opcional: { titulo, texto } o null
//   actividades   Lista de cosas que sí se pueden hacer ahí
//   prohibiciones Lista de cosas que no se deben hacer ahí
//   guia          'no_requerido' | 'recomendado' | 'requerido'
//   permiso       'no_requerido' | 'consultar' | 'requerido'
//   info          Nota corta adicional (opcional, '' si no hay)
//
// NOTA HONESTA: donde no hay una fuente oficial confirmada (horarios
// exactos, dificultad exacta, etc.) se deja indicado "por confirmar" o
// "consultar previamente" en vez de inventar el dato.
const PLACES = [
  {
    name: 'Cerro de la Virgen',
    desc: 'Mirador natural junto al casco urbano de Tausa.',
    lat: 5.194494, lng: -73.884281,
    photos: ['fotos/cerro-de-la-virgen/foto1.jpg', 'fotos/cerro-de-la-virgen/foto2.jpg', 'fotos/cerro-de-la-virgen/foto3.jpg', 'fotos/cerro-de-la-virgen/foto4.jpg'],
    fotosCredito: 'Marlon Poveda',
    video: '',
    historia: 'Mirador natural ubicado junto al casco urbano de Tausa, tradicionalmente vinculado a la devoción religiosa del municipio. Con el paso del tiempo se habilitó como sendero ecológico, desde donde se observa gran parte del pueblo y de la sabana que lo rodea.',
    acontecimientos: '',
    cultura: 'La zona hace parte del territorio que históricamente ocupó el pueblo muisca, presente en buena parte del altiplano cundinamarqués.',
    leyenda: '',
    destacado: null,
    actividades: ['Senderismo', 'Fotografía', 'Observación panorámica', 'Turismo religioso'],
    prohibiciones: ['No salirse del sendero marcado', 'No arrojar basura', 'No dañar la vegetación del cerro'],
    guia: 'recomendado',
    permiso: 'no_requerido',
    info: 'Lleva agua y calzado adecuado — algunos tramos de la subida son exigentes.',
    biodiversidad: {
      animales: ['Conejo de monte', 'Comadreja', 'Fara', 'Guache', 'Ratón de campo'],
      aves: ['Colibríes', 'Mirla negra', 'Copetón', 'Golondrina', 'Torcaza'],
      plantas: ['Chilco', 'Tuno', 'Retamo', 'Aliso', 'Siete cueros']
    }
  },
  {
    name: 'Iglesia principal Santa Maria Magdalena',
    desc: 'Templo religioso del casco urbano de Tausa.',
    lat: 5.195967, lng: -73.885814,
    photos: ['fotos/iglesia-principal-santa-maria-magdalena/foto1.jpg', 'fotos/iglesia-principal-santa-maria-magdalena/foto2.jpg', 'fotos/iglesia-principal-santa-maria-magdalena/foto3.jpg'],
    fotosCredito: 'Marlon Poveda',
    video: '',
    historia: 'Es el templo religioso del casco urbano actual de Tausa, heredero de una larga tradición que en el municipio se remonta a la época colonial. Es uno de los puntos de encuentro más importantes de la comunidad.',
    acontecimientos: '',
    cultura: 'La evangelización de la región estuvo profundamente ligada a las comunidades muiscas que habitaban el territorio antes de la llegada española.',
    leyenda: '',
    destacado: null,
    actividades: ['Visita religiosa', 'Fotografía exterior', 'Turismo histórico', 'Celebraciones religiosas'],
    prohibiciones: ['Guardar silencio y respeto durante las celebraciones', 'No ingresar durante actos litúrgicos sin autorización'],
    guia: 'no_requerido',
    permiso: 'no_requerido',
    info: 'Consulta los horarios de misa con la parroquia antes de tu visita.',
    biodiversidad: {
      nota: 'Al ser un lugar urbano, aquí las especies se observan en los alrededores del casco urbano, no dentro de la iglesia.',
      animales: ['Fara', 'Ratón de campo', 'Murciélagos', 'Ardillas'],
      aves: ['Copetón', 'Mirla', 'Paloma', 'Colibríes', 'Golondrinas'],
      plantas: ['Eucalipto', 'Pino', 'Aliso', 'Chilco', 'Retamo']
    }
  },
  {
    name: 'Los Cuascos',
    desc: 'Sendero peatonal recreativo de Tausa Viejo.',
    lat: 5.195922, lng: -73.893061,
    photos: ['fotos/los-cuascos/foto1.jpg', 'fotos/los-cuascos/foto2.jpg', 'fotos/los-cuascos/foto3.jpg'],
    fotosCredito: 'Marlon Poveda',
    video: '',
    historia: 'Sendero peatonal recreativo del municipio, habilitado con iluminación de energía renovable para permitir recorridos seguros incluso en horas de menor luz.',
    acontecimientos: '',
    cultura: 'Como gran parte del territorio de Tausa, la zona estuvo históricamente habitada por comunidades muiscas.',
    leyenda: '',
    destacado: null,
    actividades: ['Senderismo', 'Fotografía', 'Observación del paisaje'],
    prohibiciones: ['No arrojar basura', 'No apartarse del sendero señalizado'],
    guia: 'recomendado',
    permiso: 'consultar',
    info: 'La dificultad y duración exactas del recorrido están por confirmar — consulta con la Alcaldía antes de ir.',
    biodiversidad: {
      animales: ['Conejo de monte', 'Comadreja', 'Fara', 'Guache', 'Borugo'],
      aves: ['Colibríes', 'Mirla negra', 'Carpinteros', 'Torcazas', 'Copetones'],
      plantas: ['Chilco', 'Tuno', 'Encenillo', 'Aliso', 'Uva camarona', 'Chusque']
    }
  },
  {
    name: 'Templo Doctrinario Tausa Viejo',
    desc: 'Sitio histórico y patrimonial del siglo XVI.',
    lat: 5.195194, lng: -73.893144,
    photos: ['fotos/templo-doctrinario-tausa-viejo/foto1.jpg', 'fotos/templo-doctrinario-tausa-viejo/foto2.jpg', 'fotos/templo-doctrinario-tausa-viejo/foto3.jpg'],
    fotosCredito: 'Marlon Poveda',
    video: '',
    historia: 'Uno de los sitios históricos más importantes del municipio. Existen registros de un templo en este sector desde 1594, y el 2 de agosto de 1600 el oidor Luis Henríquez ordenó la construcción de una edificación más duradera. Ha sido objeto de procesos de recuperación patrimonial impulsados por la Gobernación de Cundinamarca.',
    acontecimientos: 'Construcción original registrada en 1594 · orden de reconstrucción en 1600 · intervenciones recientes de restauración patrimonial.',
    cultura: 'El templo estuvo directamente relacionado con el proceso de evangelización de las comunidades muiscas que habitaban Tausa Viejo antes de la fundación del actual casco urbano.',
    leyenda: '',
    destacado: null,
    actividades: ['Recorrido histórico', 'Fotografía', 'Interpretación cultural', 'Turismo religioso'],
    prohibiciones: ['No tocar ni alterar los elementos arquitectónicos', 'No ingresar a zonas cerradas o en restauración', 'No rayar ni escribir sobre las paredes'],
    guia: 'recomendado',
    permiso: 'consultar',
    info: 'Por ser un bien patrimonial, el acceso a ciertas zonas puede estar restringido según el estado de las obras de restauración.',
    biodiversidad: {
      nota: 'En los alrededores del templo se puede encontrar principalmente fauna y vegetación propia de la zona rural.',
      animales: ['Conejo de monte', 'Comadreja', 'Fara', 'Guache', 'Ratón de campo'],
      aves: ['Mirla negra', 'Colibríes', 'Copetón', 'Torcaza', 'Golondrina'],
      plantas: ['Aliso', 'Chilco', 'Encenillo', 'Siete cueros', 'Retamo']
    }
  },
  {
    name: 'Templo del Alto de Quita',
    desc: 'Templo y mirador en las alturas de Tausa.',
    lat: 5.205669, lng: -73.892617,
    photos: ['fotos/templo-del-alto-de-quita/foto1.jpg', 'fotos/templo-del-alto-de-quita/foto2.jpg', 'fotos/templo-del-alto-de-quita/foto3.jpg', 'fotos/templo-del-alto-de-quita/foto4.jpg'],
    fotosCredito: 'William Ramírez',
    video: '',
    historia: 'Templo religioso situado en las alturas de Tausa, integrado en la llamada "Ruta de la Fe", un recorrido que lo conecta con el Cerro de la Virgen.',
    acontecimientos: '',
    cultura: '',
    leyenda: '',
    destacado: { titulo: '🥾 Ruta de la Fe', texto: 'Conecta el Cerro de la Virgen con el Alto de Quita: cerca de 6,7 km, un ascenso de unos 353 m y una duración mínima aproximada de dos horas. Una experiencia que combina senderismo, espiritualidad, paisaje e historia.' },
    actividades: ['Senderismo', 'Turismo espiritual', 'Fotografía panorámica'],
    prohibiciones: ['No apartarse de la ruta señalizada', 'No arrojar basura en el camino'],
    guia: 'recomendado',
    permiso: 'no_requerido',
    info: '',
    biodiversidad: {
      animales: ['Conejo de monte', 'Comadreja', 'Guache', 'Fara', 'Borugo'],
      aves: ['Colibríes', 'Mirla negra', 'Carpinteros', 'Copetón', 'Torcaza'],
      plantas: ['Encenillo', 'Chilco', 'Tuno', 'Chusque', 'Uva camarona']
    }
  },
  {
    name: 'Mirador Neusa',
    desc: 'Mirador natural cerca del Embalse del Neusa.',
    lat: 5.185258, lng: -73.926000,
    photos: ['fotos/mirador-neusa/foto1.jpg', 'fotos/mirador-neusa/foto2.jpg', 'fotos/mirador-neusa/foto3.jpg', 'fotos/mirador-neusa/foto4.jpg'],
    fotosCredito: 'William Ramírez y Kevin Bello',
    video: '',
    historia: 'Mirador ubicado cerca del Embalse del Neusa, un cuerpo de agua administrado por la CAR entre los municipios de Tausa y Cogua, rodeado de bosque nativo.',
    acontecimientos: '',
    cultura: '',
    leyenda: '',
    destacado: null,
    actividades: ['Fotografía', 'Observación de paisaje', 'Observación de biodiversidad', 'Caminatas de baja dificultad'],
    prohibiciones: ['No dejar residuos', 'No alimentar ni perturbar la fauna'],
    guia: 'no_requerido',
    permiso: 'no_requerido',
    info: 'Las caminatas cercanas son de baja dificultad, ideales para toda la familia.',
    biodiversidad: {
      nota: 'Aquí ya estamos en un ecosistema mucho más relacionado con el Embalse y Parque Neusa, donde existe una gran diversidad de fauna y flora.',
      animales: ['Borugo', 'Conejo de monte', 'Comadreja', 'Fara', 'Guache', 'Lagarto collarejo'],
      aves: ['Colibrí', 'Mirla negra', 'Carpintero', 'Pava andina', 'Torcaza', 'Lechuza', 'Toche', 'Picogrueso dorsinegro'],
      plantas: ['Mortiño', 'Uva camarona', 'Encenillo', 'Chusque', 'Mano de oso', 'Romero de páramo', 'Tuno', 'Aliso', 'Chilco', 'Raque', 'Puya', 'Bromelias']
    }
  },
  {
    name: 'Zona de Camping Parque Neusa',
    desc: 'Zona recreativa del Parque Forestal Embalse del Neusa.',
    lat: 5.135742, lng: -73.966061,
    photos: ['fotos/zona-de-camping-parque-neusa/foto1.jpg', 'fotos/zona-de-camping-parque-neusa/foto2.jpg', 'fotos/zona-de-camping-parque-neusa/foto3.jpg'],
    fotosCredito: 'William Ramírez',
    video: '',
    historia: 'Sector del Parque Forestal Embalse del Neusa habilitado para actividades recreativas y de turismo de naturaleza.',
    acontecimientos: '',
    cultura: '',
    leyenda: '',
    destacado: { titulo: '⚠️ Antes de ir', texto: 'Las actividades, horarios, zonas habilitadas y condiciones de ingreso pueden cambiar. Consulta previamente con la administración del Parque Forestal Embalse del Neusa.' },
    actividades: ['Camping', 'Asados en zonas autorizadas', 'Pesca deportiva', 'Alquiler de botes', 'Caminatas', 'Restaurantes cercanos'],
    prohibiciones: ['No encender fogatas fuera de zonas autorizadas', 'No arrojar basura', 'No pescar fuera de las temporadas o zonas permitidas'],
    guia: 'no_requerido',
    permiso: 'consultar',
    info: '',
    biodiversidad: {
      nota: 'Es uno de los lugares con más biodiversidad registrada de Tausa: el Parque Neusa documenta cientos de especies, incluyendo aves, mamíferos, reptiles, anfibios y peces, además de vegetación acuática asociada al espejo de agua y sus zonas inundables.',
      animales: ['Guache', 'Comadreja', 'Conejo de monte', 'Fara', 'Borugo', 'Lagarto collarejo', 'Cangrejo sabanero'],
      aves: ['Colibríes', 'Mirla negra', 'Carpinteros', 'Pava andina', 'Torcaza', 'Lechuza', 'Toche', 'Patos', 'Tinguas', 'Zambullidores'],
      plantas: ['Mortiño', 'Uva camarona', 'Encenillo', 'Chusque', 'Mano de oso', 'Tuno', 'Aliso', 'Chilco', 'Raque', 'Puya', 'Bromelias', 'Helecho de agua', 'Elodea']
    }
  },
  {
    name: 'Pozos de sal',
    // el link anterior (con "s") sigue funcionando para no romper enlaces ya compartidos
    slugsAnteriores: ['posos-de-sal'],
    desc: 'Manantiales de agua salina de valor histórico.',
    lat: 5.195242, lng: -73.897772,
    // (la carpeta de fotos se sigue llamando "posos-de-sal"; si algún día la renombras a "pozos-de-sal", cambia también estas rutas)
    photos: ['fotos/posos-de-sal/foto1.jpg', 'fotos/posos-de-sal/foto2.jpg', 'fotos/posos-de-sal/foto3.jpg', 'fotos/posos-de-sal/foto4.jpg', 'fotos/posos-de-sal/foto5.jpg', 'fotos/posos-de-sal/foto6.jpg'],
    fotosCredito: 'Marlon Poveda',
    video: '',
    historia: 'Tausa formó parte, junto con Nemocón y Zipaquirá, de una región históricamente salinera. La sal fue un recurso de gran importancia económica y cultural para las comunidades que habitaron este territorio.',
    acontecimientos: '',
    cultura: 'Las comunidades muiscas ya explotaban la sal de esta región antes de la llegada española, y este recurso mantuvo su importancia durante buena parte de la historia del municipio.',
    leyenda: '',
    destacado: null,
    actividades: ['Interpretación histórica', 'Fotografía', 'Turismo cultural', 'Recorrido por el entorno'],
    prohibiciones: ['No ingresar a zonas no habilitadas', 'No extraer materiales del sitio'],
    guia: 'recomendado',
    permiso: 'consultar',
    info: 'La existencia de un recorrido turístico formal, horarios y condiciones de acceso está por confirmar — consulta previamente.',
    biodiversidad: {
      nota: 'Por ser un sitio ligado a la actividad salinera y con zonas intervenidas, aquí la lista se enfoca en las especies que pueden encontrarse en sus alrededores.',
      animales: ['Conejo de monte', 'Fara', 'Comadreja', 'Guache', 'Ratón de campo'],
      aves: ['Copetón', 'Mirla negra', 'Colibríes', 'Torcaza', 'Golondrina'],
      plantas: ['Chilco', 'Aliso', 'Encenillo', 'Retamo', 'Tuno', 'Pastos nativos']
    }
  }
];

// genera automáticamente el identificador de URL (slug) de cada lugar a
// partir de su nombre, por ejemplo "Cerro de la Virgen" → "cerro-de-la-virgen"
function slugify(text){
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
PLACES.forEach(function(p){ p.slug = slugify(p.name); });

function getPlaceBySlug(slug){
  return PLACES.find(function(p){
    return p.slug === slug || (p.slugsAnteriores && p.slugsAnteriores.indexOf(slug) !== -1);
  });
}

// ---------- HOTELES ----------
// Mismo sistema que PLACES, pero para hospedaje. hotel.html lee uno de estos
// con el parámetro ?h=<slug>, igual que lugar.html lee PLACES con ?p=<slug>.
//
// Campos de cada hotel:
//   name, categoria, ubicacion, entorno, comoLlegar  Datos generales y de ubicación
//   descripcion                                       Texto de introducción
//   photos   Lista de rutas a imágenes (opcional, [] si todavía no hay —
//            mientras esté vacío, la página muestra espacios reservados
//            listos para cuando subas las fotos reales)
//   habitaciones        Lista de tipos de habitación: { nombre, capacidad, nota }
//   amenidadesHabitacion Lista de comodidades incluidas en las habitaciones
//   experiencias         Lista de actividades que ofrece
//   restaurante           { descripcion, ingredientes[], platos[], horario }
//   eventos                { descripcion, espacios:[{nombre,capacidad}], alojamiento }
//   sostenibilidad         Lista de prácticas / cifras de sostenibilidad
//   embalse                Texto sobre el entorno natural (cuando aplica)
//   petFriendly            { reglas[], sancion }
//   infoUtil               { checkin, checkout, wifi, parqueadero, mascotas, altitud }
//   enlaces                { reservar, web, whatsapp, telefono }  (vacío '' si no hay)
const HOTELS = [
  {
    name: 'Fuga Hotel — Embalse del Neusa',
    categoria: 'Hospedaje · Hotel · Experiencia turística',
    ubicacion: 'Finca La Victoria, Vereda Llano Grande, Tausa, Cundinamarca.',
    entorno: 'Embalse del Neusa, aproximadamente a 3.000 msnm.',
    comoLlegar: 'Desde Bogotá: 54 km desde el peaje del norte. Desde el embarcadero del Parque del Neusa son aproximadamente 6,5 km por la carretera hacia Tausa. Fuga recomienda buscar "Fuga Neusa" en Google Maps o Waze.',
    descripcion: 'Fuga es un Cabin Retreat ubicado frente al Embalse del Neusa. Su propuesta está enfocada en descansar, desconectarse y reconectar con la naturaleza, rodeado de bosque altoandino, frailejones, montaña y niebla. Cuenta con 9 habitaciones y espacios diseñados para disfrutar del paisaje y la tranquilidad.',
    mapsQuery: 'Fuga Neusa',
    photos: [],
    photoSlotsLabels: ['Exterior / cabañas', 'Habitaciones', 'Restaurante', 'Experiencias', 'Eventos', 'Vista al embalse'],
    habitaciones: [
      { nombre: 'Standard', capacidad: 'Hasta 3 personas', nota: '' },
      { nombre: 'Petit Suite', capacidad: 'Hasta 2 personas', nota: 'Con jacuzzi privado' },
      { nombre: 'Suite', capacidad: 'Hasta 5 personas', nota: 'Con jacuzzi privado' }
    ],
    precioNota: '💡 Los precios cambian según tipo de habitación, cantidad de huéspedes, día, temporada y descuentos, por eso no los mostramos aquí. Consúltalos directamente con Fuga con el botón «Ver precios y reservar».',
    habitacionesNota: 'Fuga cuenta con 9 habitaciones en total: 4 Standard, 1 Petit Suite y 4 Suite. Las Suite y Petit Suite tienen jacuzzi privado en la terraza.',
    amenidadesHabitacion: ['Cama king o configuración según habitación', 'Calefactor', 'Ducha de agua caliente', 'Estación de café', 'Nevera minibar', 'Wi-Fi de alta velocidad', 'Terraza privada', 'Fogata privada', 'Malla de catamarán', 'Vista de 180° al embalse', 'Almohadas duras y blandas', 'Amenities biodegradables'],
    experiencias: ['Senderos ecológicos entre bosque nativo y frailejones de más de 80 años', 'Fogatas privadas y comunales', 'Jacuzzis privados', 'Masajes bajo reserva', 'Paseos en bicicleta alrededor del embalse', 'Caminatas', 'Juegos de mesa', 'Kayak', 'Paddle board', 'Botes de remo', 'Paseos en lancha', 'Pesca deportiva', 'Siembra de árboles', 'Yoga', 'Actividades personalizadas'],
    experienciasNota: 'Las actividades náuticas se coordinan mediante operadores aliados del Embalse del Neusa.',
    restaurante: {
      descripcion: 'El restaurante de Fuga ofrece una cocina de inspiración latinoamericana utilizando productos regionales y de su propia huerta.',
      ingredientes: ['Papas nativas', 'Queso Paipa', 'Maíz', 'Hierbas y flores comestibles', 'Verduras de la huerta', 'Ajíes y especias', 'Frutas de temporada', 'Lechugas y hojas verdes'],
      platos: ['Empanadas paisas con gravy de asado de tira', 'Criollas bravas', 'Papas chorreadas', 'Tacos de trucha', 'Tostada de tira', 'Asado de tira', 'Pollo y esquites', 'Pepper Steak', 'Fuga Burger', 'Arroz al sartén', 'Torta de chocolate', 'Cheesecake de temporada', 'Gofres de pandeyuca con miel del Neusa'],
      horario: 'Restaurante: todos los días de 8:00 a. m. a 9:00 p. m. · Bar: hasta las 11:00 p. m.'
    },
    eventos: {
      descripcion: 'Fuga también funciona para eventos corporativos, reuniones de trabajo, celebraciones sociales, matrimonios, cumpleaños, aniversarios, pedidas de mano, despedidas, revelaciones de género, y retiros y actividades de bienestar.',
      espacios: [
        { nombre: 'Invernadero', capacidad: '15 personas' },
        { nombre: 'Salón de reuniones', capacidad: '60 personas' },
        { nombre: 'Restaurante', capacidad: '80 personas' },
        { nombre: 'Plataforma de eventos', capacidad: '150 personas' }
      ],
      alojamiento: 'Para eventos con alojamiento, las 9 habitaciones permiten alojar hasta 30 personas en camas individuales.'
    },
    sostenibilidad: ['2 hectáreas propias', 'Más de 3.000 plantas sembradas', 'Más de 30 especies de aves registradas', 'Frailejones de más de 80 años', 'Bosque nativo altoandino', 'Huerta propia', 'Productos de proveedores locales', 'Jabones y shampoos biodegradables', 'Compostaje', 'Iluminación LED', 'Sistemas de manejo del agua', 'Reconocimiento como Negocio Verde de la CAR'],
    embalse: 'El Embalse del Neusa se encuentra aproximadamente a 3.000 msnm y comprende unas 900 hectáreas de agua dentro de un parque natural de aproximadamente 3.700 hectáreas. Fuga indica que el embalse está aproximadamente a 10 minutos caminando desde sus instalaciones.',
    petFriendly: {
      reglas: ['Máximo 2 mascotas por habitación', 'No tiene costo adicional por hospedarlas', 'Deben permanecer supervisadas', 'En zonas techadas deben estar con correa o en guacal', 'En jardines pueden circular sin correa bajo supervisión', 'No pueden subir a camas, sofás o muebles', 'El propietario debe recoger los excrementos', 'Se debe informar que se viaja con mascota al realizar la reserva', 'Se solicita certificado de vacunación vigente'],
      sancion: 'La política establece sanciones de $120.000 COP para determinados incumplimientos.'
    },
    infoUtil: {
      checkin: '3:00 p. m.',
      checkout: '12:00 p. m.',
      wifi: 'Starlink de 500 Mb',
      parqueadero: 'Privado y sin costo para huéspedes',
      mascotas: 'Sí (ver política Pet Friendly)',
      altitud: 'Aproximadamente 3.000 msnm'
    },
    contactos: [
      { titulo: 'Contacto del hotel', lineas: [
        { texto: '☎ +57 322 450 3640', href: 'tel:+573224503640' },
        { texto: '🌐 neusahills.com', href: 'https://www.neusahills.com/' },
        { texto: '📸 Instagram · @neusahills', href: 'https://www.instagram.com/neusahills/' },
        { texto: '📘 Facebook · neusahills.glamping', href: 'https://www.facebook.com/neusahills.glamping' }
      ]}
    ],
    enlaces: {
      reservar: '',
      web: 'https://www.neusahills.com/',
      whatsapp: '',
      telefono: '+57 322 450 3640'
    }
  },
  {
    name: 'Neusa Hills Hotel Boutique',
    categoria: 'Ecolodge · Hotel boutique',
    ubicacion: 'Vereda Parama Bajo, Finca Neusa Hills Park, Tausa, Cundinamarca, Colombia.',
    entorno: 'Finca Neusa Hills Park — naturaleza, huerta y vistas al embalse.',
    desc: 'Ecolodge y hotel boutique con cabañas, restaurante y experiencias en Tausa.',
    lat: 5.1445455, lng: -73.9502572,
    descripcion: 'Neusa Hills Hotel Boutique es un establecimiento de alojamiento turístico que ofrece espacios privados para descansar, disfrutar de la naturaleza, compartir experiencias gastronómicas y organizar encuentros empresariales. Su propuesta integra alojamiento en cabañas y habitaciones, restaurante, actividades recreativas y creativas, experiencias para parejas y espacios destinados a eventos.',
    photos: [],
    photoSlotsLabels: ['Cabañas', 'Habitaciones', 'Restaurante Tributo', 'Experiencias', 'Eventos', 'Deck y embalse'],
    habitaciones: [
      { nombre: 'Adamá', tipo: 'Cabaña privada', descripcion: 'Cama Queen, baño con agua caliente, balcón, malla de catamarán y tina.', nota: 'Tina' },
      { nombre: 'Vento', tipo: 'Cabaña privada dúplex', descripcion: 'Cama Queen, sofá cama, balcón, terraza, malla de catamarán y jacuzzi.', nota: 'Jacuzzi' },
      { nombre: 'Oasis', tipo: 'Cabaña privada', descripcion: 'Cama Queen, baño privado, balcón, malla de catamarán y jacuzzi.', nota: 'Jacuzzi' },
      { nombre: 'Suká', tipo: 'Habitación privada', descripcion: 'Cama doble, sofá cama y balcón.' },
      { nombre: 'Bruma', tipo: 'Cabaña privada', descripcion: 'Cama doble, baño privado, balcón y malla de catamarán.' },
      { nombre: 'Bosco', tipo: 'Cabaña privada', descripcion: 'Cama doble, baño privado y balcón.' },
      { nombre: 'Nube', tipo: 'Habitación privada · tercer piso de Casa Madre', descripcion: 'Cama King, televisión, balcón y chimenea.' },
      { nombre: 'Cielo', tipo: 'Habitación privada · tercer piso de Casa Madre', descripcion: 'Cama Queen, televisión, balcón y chimenea.' },
      { nombre: 'Quiche', tipo: 'Cabaña privada', descripcion: 'Cama doble, baño privado y balcón.' }
    ],
    habitacionesNota: 'Según el catálogo, el alojamiento incluye desayuno, bebida caliente de bienvenida y acceso a zonas sociales. Las condiciones pueden variar según la habitación y la tarifa contratada.',
    tarifas: {
      titulo: 'Tarifas de alojamiento publicadas en el catálogo',
      columna: 'Tarifa publicada en el catálogo',
      items: [
        { habitacion: 'Vento', valor: '$1.290.000' },
        { habitacion: 'Oasis', valor: '$990.000' },
        { habitacion: 'Adamá', valor: '$900.000' },
        { habitacion: 'Suká', valor: '$890.000' },
        { habitacion: 'Bruma', valor: '$840.000' },
        { habitacion: 'Bosco', valor: '$720.000' },
        { habitacion: 'Nube', valor: '$700.000' },
        { habitacion: 'Cielo', valor: '$690.000' },
        { habitacion: 'Quiche', valor: '$680.000' }
      ],
      aviso: 'Estos valores fueron transcritos del catálogo del establecimiento y no son tarifas confirmadas para hoy. Antes de reservar, confirma directamente con el hotel la vigencia, las fechas, la ocupación, los impuestos y las condiciones.'
    },
    experienciasGrupos: [
      { titulo: 'Experiencias gastronómicas', items: ['Taller de pizza', 'Taller de sushi', 'Preparación de lomo al trapo', 'Experiencia de coctelería', 'Taller de amasijos y envueltos'] },
      { titulo: 'Experiencias creativas', items: ['Taller de cerámica', 'Taller de pintura', 'Actividad de pintura y siembra de materas'] },
      { titulo: 'Naturaleza y bienestar', items: ['Caminata al embalse', 'Caminata a la huerta', 'Cabalgata', 'Inmersión en hielo'] },
      { titulo: 'Experiencias para parejas', items: ['Cena romántica', 'The Pleasure Kit', 'Bed Picnic como complemento del alojamiento'] }
    ],
    experienciasNota: 'Los precios, las fechas disponibles, los requisitos de participación y las condiciones de cada actividad deben confirmarse directamente con el establecimiento.',
    restaurante: {
      nombre: 'Tributo Cocina de Origen',
      descripcion: 'Tributo Cocina de Origen es la propuesta gastronómica asociada al establecimiento. Su menú presenta preparaciones que combinan ingredientes del campo, referencias a la cocina tradicional y propuestas contemporáneas.',
      categorias: ['Desayunos', 'Entradas', 'Platos fuertes', 'Preparaciones con carnes y trucha', 'Bebidas y otras opciones de la carta'],
      platosTitulo: 'Preparaciones descritas en el menú',
      platos: ['Huevos al gusto', 'Changua', 'Pancakes', 'Amasijos', 'Empanadas de calentao', 'Buñuelos de yuca', 'Ceviches', 'Carimañolas de trucha'],
      nota: 'Los platos disponibles, los precios y los horarios de atención deben consultarse en el menú actualizado del restaurante.'
    },
    eventos: {
      descripcion: 'El hotel ofrece espacios para reuniones, conferencias, talleres, networking, lanzamientos de marca y actividades de integración empresarial.',
      columna: 'Detalle',
      espacios: [
        { nombre: 'Salón Alta Vista', detalle: '68 m² · hasta 70 personas en auditorio' },
        { nombre: 'Salón Terracota', detalle: '70 m² · distintas configuraciones para reuniones' },
        { nombre: 'Zona verde exterior', detalle: 'Aprox. 560 m²' },
        { nombre: 'Casa Madre y lobby', detalle: 'Recepción, buffet o cócteles' },
        { nombre: 'Deck Pasarela', detalle: 'Plataforma con vistas al embalse' },
        { nombre: 'Torre Mirador', detalle: 'Experiencias privadas' },
        { nombre: 'Zona de talleres', detalle: 'Actividades privadas' }
      ],
      alojamiento: 'Las capacidades dependen de la distribución y el montaje. Los servicios de alimentación, bebidas, equipos y alojamiento deben cotizarse según las necesidades del evento.'
    },
    embalseTitulo: 'Naturaleza y entorno',
    embalse: 'La propuesta turística del establecimiento está relacionada con el descanso, los paisajes naturales y las actividades al aire libre. Las caminatas, las experiencias de huerta, las cabalgatas y los espacios exteriores permiten complementar la estancia con actividades recreativas.',
    datosEstablecimiento: [
      { label: 'Nombre comercial', value: 'Neusa Hills Hotel Boutique' },
      { label: 'Razón social', value: 'VERUM & CO S.A.S.' },
      { label: 'NIT', value: '901989333-0' },
      { label: 'Categoría', value: 'Ecolodge' },
      { label: 'Dirección', value: 'Vereda Parama Bajo, Finca Neusa Hills Park, Tausa, Cundinamarca' },
      { label: 'Registro Nacional de Turismo', value: 'RNT 288622' }
    ],
    datosNota: 'Datos tomados del certificado de Registro Nacional de Turismo y del catálogo aportados por el establecimiento (certificado expedido el 7 de mayo de 2026, con vencimiento indicado el 31 de marzo de 2027). Verifica la vigencia en la fuente oficial.',
    contactos: [
      { titulo: 'Reservas', lineas: [
        { texto: '☎ +57 310 579 1978', href: 'tel:+573105791978' },
        { texto: '✉ reservas@neusahills.com', href: 'mailto:reservas@neusahills.com' }
      ]},
      { titulo: 'Contacto comercial (eventos y empresas)', lineas: [
        { texto: 'Yvonne Andrea Martínez' },
        { texto: '☎ +57 322 450 3640', href: 'tel:+573224503640' },
        { texto: '✉ directorcomercial@neusahills.com', href: 'mailto:directorcomercial@neusahills.com' }
      ]},
      { titulo: 'Información general', lineas: [
        { texto: '☎ +57 318 696 5983', href: 'tel:+573186965983' },
        { texto: '🌐 neusahills.com', href: 'https://www.neusahills.com/' }
      ]}
    ],
    aviso: 'La información de esta ficha se basa en los materiales comerciales y documentales suministrados por el establecimiento. Los precios, servicios, horarios y condiciones están sujetos a confirmación con el establecimiento. La información publicada en DMD tiene fines turísticos e informativos y no sustituye la confirmación directa de una reserva.',
    enlaces: {
      reservar: 'https://www.neusahills.com/',
      web: 'https://www.neusahills.com/',
      whatsapp: '',
      telefono: '+57 310 579 1978'
    }
  }
];

function getHotelBySlug(slug){
  return HOTELS.find(function(h){ return h.slug === slug; });
}
HOTELS.forEach(function(h){ h.slug = slugify(h.name); });

// ---------- CONTACTOS DE AYUDA (se muestran en la ficha de cada lugar) ----------
// Datos oficiales de la Alcaldía — reemplaza si cambian.
const MUNICIPIO_CONTACTO = {
  nombre: 'Alcaldía Municipal de Tausa',
  telefono: '(1) 858 3015',
  correo: 'contactenos@tausa-cundinamarca.gov.co',
  direccion: 'Carrera 3 # 3-24, Tausa, Cundinamarca'
};
// Datos de contacto de la propia página DMD — los mismos del pie de página del inicio.
const DMD_CONTACTO = {
  telefono: '+57 311 503 3916',
  correo: 'dmd.tausa@gmail.com'
};

// ---------- FIREBASE ----------
// Pega aquí tu configuración real (pídeme el tutorial de Firebase si no
// lo tienes). Se usa en la página de cada lugar para el inicio de sesión
// del administrador y para guardar/mostrar las fotos que suba. Mientras
// diga "TU_...", esa función queda desactivada sin romper el resto.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhfvYx2pIzphbyDH4k5uMil5txa_e0b_M",
  authDomain: "dmd-tausa.firebaseapp.com",
  projectId: "dmd-tausa",
  storageBucket: "dmd-tausa.firebasestorage.app",
  messagingSenderId: "744479460410",
  appId: "1:744479460410:web:97511f65db0f56e82b7903"
};
