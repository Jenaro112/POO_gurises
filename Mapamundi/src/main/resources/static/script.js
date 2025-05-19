const apiBase = '/mapa';

// Diccionario nombre -> ID del grupo <g> en el SVG
const mapaSVG = {
  "Argentina": "ar",
  "Brasil": "br",
  "Uruguay": "uy",
  "Chile": "cl",
  "Bolivia": "bo",
  "Paraguay": "py"
  // Agregá más si querés
};

// Diccionario de continentes
const continentes = {
  "América": ["ar", "br", "uy", "cl", "bo", "py"],
  "Europa": [] // Agregalo si usás Europa
};

function limpiarResaltado() {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  const resaltados = svg.querySelectorAll('.resaltado, .glow-red, .glow-blue, .glow-green');
  resaltados.forEach(g => {
    g.classList.remove('resaltado', 'glow-red', 'glow-blue', 'glow-green');
    g.querySelectorAll('path, polygon, rect, circle').forEach(el => {
      el.style.fill = '';
      el.style.filter = '';
    });
  });
}

function resaltarPais(nombre, color = 'red') {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;
  const id = mapaSVG[nombre];
  if (!id) return;
  const grupo = svg.getElementById(id);
  if (!grupo) return;

  grupo.querySelectorAll('path, polygon, rect, circle').forEach(el => el.style.fill = color);
  grupo.classList.add('resaltado');
  if (color === 'red') grupo.classList.add('glow-red');
  if (color === 'blue') grupo.classList.add('glow-blue');
  if (color === 'limegreen') grupo.classList.add('glow-green');
}

function resaltarContinente(nombreContinente) {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;
  limpiarResaltado();
  const ids = continentes[nombreContinente];
  if (!ids) return;
  ids.forEach(id => {
    const grupo = svg.getElementById(id);
    if (grupo) {
      grupo.classList.add('resaltado');
      grupo.querySelectorAll('path, polygon, rect, circle').forEach(el => el.style.fill = 'red');
    }
  });
}

async function resaltarLimitrofes(nombrePais) {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;
  try {
    const res = await fetch(`${apiBase}/limitrofes?pais=${encodeURIComponent(nombrePais)}`);
    if (!res.ok) return;
    const limitrofes = await res.json();
    limitrofes.forEach(p => resaltarPais(p.nombre, 'limegreen'));
  } catch (e) {
    console.error('Error obteniendo limítrofes:', e);
  }
}
async function buscar() {
  const nombre = document.getElementById('inputNombre').value.trim();
  const resultado = document.getElementById('resultadoBusqueda');
  resultado.innerHTML = '';
  limpiarResaltado();

  if (!nombre) {
    alert('Ingrese un nombre válido.');
    return;
  }

  // Si es un continente, resaltar todos los países del continente
  if (continentes[nombre]) {
    resaltarContinente(nombre);
    resultado.textContent = `Países resaltados del continente ${nombre}`;
    return;
  }

  try {
    // Intentar buscar como país
    const resProvincias = await fetch(`${apiBase}/provincias?pais=${encodeURIComponent(nombre)}`);
    if (resProvincias.ok) {
      const provincias = await resProvincias.json();
      if (provincias.length > 0) {
        resaltarPais(nombre, 'red');

        // Pintar sus limítrofes
        const limitrofesRes = await fetch(`${apiBase}/limitrofes?pais=${encodeURIComponent(nombre)}`);
        if (limitrofesRes.ok) {
          const limitrofes = await limitrofesRes.json();
          limitrofes.forEach(p => {
            if (p.nombre !== nombre) {
              resaltarPais(p.nombre, 'dodgerblue');
            }
          });
        }

        // Mostrar provincias
        provincias.forEach(pr => {
          const li = document.createElement('li');
          li.textContent = pr.nombre;
          resultado.appendChild(li);
        });

        // Mostrar info del país
        mostrarInfoPais(nombre);
        return;
      }
    }

    // Si no es país, intentar como continente (por si está mal tipeado arriba)
    const resPaises = await fetch(`${apiBase}/paises?continente=${encodeURIComponent(nombre)}`);
    if (resPaises.ok) {
      const paises = await resPaises.json();
      if (paises.length > 0) {
        resaltarContinente(nombre);
        paises.forEach(p => {
          const li = document.createElement('li');
          li.textContent = `${p.nombre} (Capital: ${p.capital}) - ${p.superficie} km²`;
          resultado.appendChild(li);
        });
        return;
      }
    }

    resultado.textContent = 'No se encontraron resultados.';
  } catch (e) {
    console.error(e);
    resultado.textContent = 'Error en la búsqueda.';
  }
}


async function comparar() {
  const p1 = document.getElementById('pais1').value;
  const p2 = document.getElementById('pais2').value;
  const resElem = document.getElementById('resultadoComparacion');
  resElem.textContent = '';

  if (!p1 || !p2) return alert('Seleccione ambos países');
  if (p1 === p2) return resElem.textContent = 'No se puede comparar un país consigo mismo';

  try {
    const res = await fetch(`${apiBase}/comparar?pais1=${encodeURIComponent(p1)}&pais2=${encodeURIComponent(p2)}`);
    if (!res.ok) return resElem.textContent = 'No se pudo obtener la comparación';

    const mayor = await res.json();
    const menor = (mayor.nombre === p1) ? p2 : p1;

    resElem.textContent = `El país más grande es: ${mayor.nombre} con ${mayor.superficie} km²`;

    limpiarResaltado();
    resaltarPais(mayor.nombre, 'red');
    resaltarPais(menor, 'dodgerblue');
    await resaltarLimitrofes(mayor.nombre);

  } catch (e) {
    resElem.textContent = 'Error al comparar';
    console.error(e);
  }
}

async function listarPaises() {
  const listaPaises = document.getElementById('listaPaises');
  listaPaises.innerHTML = '';
  try {
    const res = await fetch(`${apiBase}/paisesOrdenados`);
    const paises = await res.json();
    paises.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.nombre} - ${p.superficie} km²`;
      listaPaises.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    listaPaises.textContent = 'Error al listar países';
  }
}

async function cargarTodosLosPaises() {
  try {
    const res = await fetch(`${apiBase}/paisesTodos`);
    const paises = await res.json();

    const select1 = document.getElementById('pais1');
    const select2 = document.getElementById('pais2');
    select1.innerHTML = '<option value="">Seleccione...</option>';
    select2.innerHTML = '<option value="">Seleccione...</option>';

    paises.forEach(p => {
      const opt1 = document.createElement('option');
      const opt2 = document.createElement('option');
      opt1.value = opt1.textContent = p.nombre;
      opt2.value = opt2.textContent = p.nombre;
      select1.appendChild(opt1);
      select2.appendChild(opt2);
    });
  } catch (e) {
    alert('Error cargando países.');
    console.error(e);
  }
}

function intentarCargarPaises() {
  const mapaObj = document.getElementById('mapaMundi');
  if (mapaObj && mapaObj.contentDocument) {
    cargarTodosLosPaises();
  } else {
    setTimeout(intentarCargarPaises, 200);
  }
}


// Guarda el país seleccionado globalmente
let paisSeleccionado = null;

// Maneja click en un país del SVG
function onClickPaisSVG(nombrePais) {
  paisSeleccionado = nombrePais;
  limpiarResaltado();
  // Resalta el país en rojo
  resaltarPais(nombrePais, 'red');

  // Busca y resalta los limítrofes en azul
  fetch(`${apiBase}/limitrofes?pais=${encodeURIComponent(nombrePais)}`)
    .then(res => res.json())
    .then(limitrofes => {
      limitrofes.forEach(pais => {
        if (pais.nombre !== nombrePais) {
          resaltarPais(pais.nombre, 'dodgerblue');
        }
      });
    })
    .catch(e => console.error('Error al cargar limítrofes:', e));

  // Muestra info del país seleccionado
  mostrarInfoPais(nombrePais);
}

// Muestra info básica del país debajo del mapa
async function mostrarInfoPais(nombre) {
  const infoDiv = document.getElementById('infoPais');
  infoDiv.innerHTML = ''; // Limpia antes

  try {
    // Obtener todos los países
    const res = await fetch(`${apiBase}/paisesTodos`);
    if (!res.ok) return;

    const paises = await res.json();
    const pais = paises.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());

    if (!pais) {
      infoDiv.textContent = 'No se encontró información del país.';
      return;
    }

    const capital = pais.capital || 'Desconocida';
    const superficie = pais.superficie || 'N/D';

    const h3 = document.createElement('h3');
    h3.textContent = `🌍 ${pais.nombre}`;
    infoDiv.appendChild(h3);

    const datos = document.createElement('p');
    datos.innerHTML = `🏛️ Capital: <b>${capital}</b><br>📏 Superficie: <b>${superficie} km²</b>`;
    infoDiv.appendChild(datos);

    // Provincias
    if (pais.provincias && pais.provincias.length > 0) {
      const provTitulo = document.createElement('h4');
      provTitulo.textContent = '🧭 Provincias:';
      infoDiv.appendChild(provTitulo);

      const ul = document.createElement('ul');
      pais.provincias.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.nombre;
        ul.appendChild(li);
      });
      infoDiv.appendChild(ul);
    }

    // Limítrofes
    const resLim = await fetch(`${apiBase}/limitrofes?pais=${encodeURIComponent(nombre)}`);
    if (resLim.ok) {
      const limitrofes = await resLim.json();
      if (limitrofes.length > 0) {
        const limTitulo = document.createElement('h4');
        limTitulo.textContent = '🌐 Limítrofes:';
        infoDiv.appendChild(limTitulo);

        const lista = document.createElement('ul');
        limitrofes.forEach(l => {
          const li = document.createElement('li');
          li.textContent = l.nombre;
          lista.appendChild(li);
        });
        infoDiv.appendChild(lista);
      }
    }

  } catch (e) {
    console.error('Error al cargar info del país', e);
    infoDiv.textContent = 'Error al cargar la información del país.';
  }
}

// Agregar listeners para click en cada país en el SVG
function agregarListenersSVG() {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  Object.entries(mapaSVG).forEach(([nombrePais, id]) => {
    const grupo = svg.getElementById(id);
    if (grupo) {
      grupo.style.cursor = 'pointer';
      grupo.addEventListener('click', () => onClickPaisSVG(nombrePais));
    }
  });
}

// Modificar la función que espera a que cargue el SVG para añadir los listeners
function intentarCargarPaises() {
  const mapaObj = document.getElementById('mapaMundi');
  if (mapaObj && mapaObj.contentDocument) {
    console.log("✅ El SVG está listo. Cargando países...");
    cargarTodosLosPaises();
    agregarListenersSVG(); // <-- Agregar aquí
  } else {
    console.log("⏳ Esperando que el SVG cargue...");
    setTimeout(intentarCargarPaises, 200);
  }
}

window.onload = () => {
  intentarCargarPaises();
};
