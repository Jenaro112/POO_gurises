const apiBase = '/mapa';

const mapaSVG = {
  "Argentina": "ar",
  "Brasil": "br",
  "Uruguay": "uy",
  "España": "es",
  "Francia": "fr",
  "Italia": "it",
  "Alemania": "de",
  "Estados Unidos": "us"
};

const continentes = {
  "América": ["ar", "br", "uy", "us", "ca", "mx", "co", "ve", "pe", "cl"],
  "Europa": ["es", "fr", "it", "de", "gb", "pt", "nl", "be", "pl", "ru"]
};

// Tooltip
const tooltip = document.getElementById('tooltip');

function mostrarTooltip(evt, texto) {
  tooltip.style.opacity = '1';
  tooltip.textContent = texto;

  const padding = 10;
  let x = evt.clientX + padding;
  let y = evt.clientY + padding;
  const tooltipRect = tooltip.getBoundingClientRect();

  if (x + tooltipRect.width > window.innerWidth) {
    x = evt.clientX - tooltipRect.width - padding;
  }
  if (y + tooltipRect.height > window.innerHeight) {
    y = evt.clientY - tooltipRect.height - padding;
  }

  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

function ocultarTooltip() {
  tooltip.style.opacity = '0';
  tooltip.textContent = '';
}

// Resaltado
function limpiarResaltado() {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  const resaltados = svg.querySelectorAll('.resaltado, .glow-red, .glow-blue');
  resaltados.forEach(g => {
    g.classList.remove('resaltado', 'glow-red', 'glow-blue');
    g.querySelectorAll('path, polygon, rect, circle').forEach(el => {
      el.style.fill = '';
      el.style.filter = '';
    });
  });
}

function resaltarPais(nombre, color = 'red') {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  limpiarResaltado();

  const id = mapaSVG[nombre];
  if (!id) return;

  const grupo = svg.getElementById(id);
  if (!grupo) return;

  grupo.querySelectorAll('path, polygon, rect, circle').forEach(el => {
    el.style.fill = color;
  });

  grupo.classList.add('resaltado');
  if (color === 'red') grupo.classList.add('glow-red');
  if (color === 'blue') grupo.classList.add('glow-blue');
}

function resaltarContinente(nombre) {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  limpiarResaltado();

  const ids = continentes[nombre];
  if (!ids) return;

  ids.forEach(id => {
    const grupo = svg.getElementById(id);
    if (grupo) {
      grupo.classList.add('resaltado');
      grupo.querySelectorAll('path, polygon, rect, circle').forEach(el => {
        el.style.fill = 'red';
      });
    }
  });
}

// Buscar
async function buscar() {
  const nombre = document.getElementById('inputNombre').value.trim();
  const resultado = document.getElementById('resultadoBusqueda');
  resultado.innerHTML = '';

  if (!nombre) {
    alert('Ingrese un nombre válido.');
    return;
  }

  if (continentes[nombre]) {
    resaltarContinente(nombre);
    resultado.textContent = `Países resaltados del continente ${nombre}`;
    return;
  }

  try {
    limpiarResaltado();
    resaltarPais(nombre);

    let res = await fetch(`${apiBase}/paises?continente=${encodeURIComponent(nombre)}`);
    if (res.ok) {
      const paises = await res.json();
      if (paises.length > 0) {
        paises.forEach(p => {
          const li = document.createElement('li');
          li.textContent = `${p.nombre} (Capital: ${p.capital}) - ${p.superficie} km²`;
          resultado.appendChild(li);
        });
        return;
      }
    }

    res = await fetch(`${apiBase}/provincias?pais=${encodeURIComponent(nombre)}`);
    if (res.ok) {
      const provincias = await res.json();
      if (provincias.length > 0) {
        provincias.forEach(p => {
          const li = document.createElement('li');
          li.textContent = p.nombre;
          resultado.appendChild(li);
        });
        return;
      }
    }

    resultado.textContent = 'No se encontraron resultados.';
  } catch (e) {
    resultado.textContent = 'Error en la búsqueda.';
    console.error(e);
  }
}

// Listar ordenados
async function listarPaises() {
  const lista = document.getElementById('listaPaises');
  lista.innerHTML = '';
  try {
    const res = await fetch(`${apiBase}/paisesOrdenados`);
    if (!res.ok) throw new Error();
    const paises = await res.json();
    paises.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.nombre} - ${p.superficie} km²`;
      lista.appendChild(li);
    });
  } catch {
    lista.textContent = 'Error al listar países.';
  }
}

// Comparar países
async function comparar() {
  const p1 = document.getElementById('pais1').value;
  const p2 = document.getElementById('pais2').value;
  const resElem = document.getElementById('resultadoComparacion');
  resElem.textContent = '';

  if (!p1 || !p2) return alert("Seleccioná ambos países");
  if (p1 === p2) return resElem.textContent = 'No se puede comparar un país consigo mismo.';

  try {
    const res = await fetch(`${apiBase}/comparar?pais1=${p1}&pais2=${p2}`);
    if (!res.ok) throw new Error();
    const mayor = await res.json();
    const menor = mayor.nombre === p1 ? p2 : p1;

    resElem.textContent = `🔴 ${mayor.nombre} es más grande con ${mayor.superficie} km²`;
    limpiarResaltado();
    resaltarPais(mayor.nombre, 'red');
    resaltarPais(menor, 'dodgerblue');
  } catch (e) {
    resElem.textContent = 'Error al comparar.';
    console.error(e);
  }
}

// Tooltip dinámico sobre SVG
function agregarEventosTooltip() {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  Object.entries(mapaSVG).forEach(([nombre, id]) => {
    const grupo = svg.getElementById(id);
    if (!grupo) return;

    grupo.addEventListener('mousemove', (evt) => mostrarTooltip(evt, nombre));
    grupo.addEventListener('mouseleave', ocultarTooltip);
  });
}

// Inicialización
function intentarIniciar() {
  const svg = document.getElementById('mapaMundi');
  if (svg && svg.contentDocument) {
    cargarTodosLosPaises();
    agregarEventosTooltip();
  } else {
    setTimeout(intentarIniciar, 300);
  }
}

async function cargarTodosLosPaises() {
  try {
    const res = await fetch(`${apiBase}/paisesTodos`);
    if (!res.ok) throw new Error();
    const paises = await res.json();
    const select1 = document.getElementById('pais1');
    const select2 = document.getElementById('pais2');
    select1.innerHTML = '<option value="">Seleccione...</option>';
    select2.innerHTML = '<option value="">Seleccione...</option>';
    paises.forEach(p => {
      const o1 = document.createElement('option');
      o1.value = p.nombre;
      o1.textContent = p.nombre;
      const o2 = o1.cloneNode(true);
      select1.appendChild(o1);
      select2.appendChild(o2);
    });
  } catch (e) {
    alert('Error al cargar países.');
    console.error(e);
  }
}

window.onload = intentarIniciar;


function abrirModal(nombre) {
  const modal = document.getElementById('modalPais');
  const nombreElem = document.getElementById('modalNombrePais');
  const capitalElem = document.getElementById('modalCapital');
  const superficieElem = document.getElementById('modalSuperficie');
  const provinciasElem = document.getElementById('modalProvincias');

  nombreElem.textContent = '';
  capitalElem.textContent = '';
  superficieElem.textContent = '';
  provinciasElem.innerHTML = '';

  // Intentar cargar como país
  fetch(`${apiBase}/provincias?pais=${encodeURIComponent(nombre)}`)
    .then(res => res.ok ? res.json() : [])
    .then(provincias => {
      provincias.forEach(p => {
        const li = document.createElement('li');
        li.textContent = p.nombre;
        provinciasElem.appendChild(li);
      });
    });

  fetch(`${apiBase}/paisesTodos`)
    .then(res => res.ok ? res.json() : [])
    .then(paises => {
      const pais = paises.find(p => p.nombre === nombre);
      if (pais) {
        nombreElem.textContent = pais.nombre;
        capitalElem.textContent = pais.capital;
        superficieElem.textContent = pais.superficie;
      }
    });

  modal.style.display = 'block';
}

// Cerrar modal
document.getElementById('cerrarModal').onclick = () => {
  document.getElementById('modalPais').style.display = 'none';
};

// Click fuera del modal lo cierra
window.onclick = (event) => {
  const modal = document.getElementById('modalPais');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Asociar clics en el mapa
function agregarEventosModal() {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  Object.entries(mapaSVG).forEach(([nombre, id]) => {
    const grupo = svg.getElementById(id);
    if (!grupo) return;

    grupo.addEventListener('click', () => abrirModal(nombre));
  });
}

// Ya estaba:
function intentarIniciar() {
  const svg = document.getElementById('mapaMundi');
  if (svg && svg.contentDocument) {
    cargarTodosLosPaises();
    agregarEventosTooltip();
    agregarEventosModal(); // ✅ Esto suma el modal
  } else {
    setTimeout(intentarIniciar, 300);
  }
}
