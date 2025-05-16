const apiBase = '/mapa';

// Diccionario nombre -> id del grupo <g> en el SVG
const mapaSVG = {
  "Argentina": "ar",
  "Brasil": "br",
  "Uruguay": "uy",
  "España": "es",
  "Francia": "fr",
  "Italia": "it",
  "Alemania": "de",
  "Estados Unidos": "us"
  // Agregá más según lo que uses
};

const continentes = {
  "América": [
    "ar",    // Argentina
    "br",    // Brasil
    "uy",    // Uruguay
    "us",    // Estados Unidos
    "ca",    // Canadá (si está en el SVG)
    "mx",    // México (si está)
    "co",    // Colombia (si está)
    "ve",    // Venezuela (si está)
    "pe",    // Perú (si está)
    "cl"     // Chile (si está)
    // Agregá los que falten o no estén en el mapa
  ],
  "Europa": [
    "es",    // España
    "fr",    // Francia
    "it",    // Italia
    "de",    // Alemania
    "gb",    // Reino Unido (si está)
    "pt",    // Portugal (si está)
    "nl",    // Países Bajos (si está)
    "be",    // Bélgica (si está)
    "pl",    // Polonia (si está)
    "ru"     // Rusia (si está en la parte europea)
    // Completar según SVG
  ]
};

// Función para limpiar resaltados previos en el SVG
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

// Función para resaltar un país con color y glow
function resaltarPais(nombre, color = 'red') {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  const id = mapaSVG[nombre];
  if (!id) return;

  const grupo = svg.getElementById(id);
  if (!grupo) return;

  grupo.querySelectorAll('path, polygon, rect, circle').forEach(el => {
    el.style.fill = color;
  });

  grupo.classList.add('resaltado');

  if (color === 'red') {
    grupo.classList.add('glow-red');
  } else if (color === 'blue' || color === 'dodgerblue') {
    grupo.classList.add('glow-blue');
  }
}

// Función para resaltar todos los países de un continente
function resaltarContinente(nombreContinente) {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  limpiarResaltado();

  const paisesIds = continentes[nombreContinente];
  if (!paisesIds) return;

  paisesIds.forEach(id => {
    const grupo = svg.getElementById(id);
    if (grupo) {
      grupo.classList.add('resaltado');
      grupo.querySelectorAll('path, polygon, rect, circle').forEach(el => {
        el.style.fill = 'red';
      });
    }
  });
}

// Cargar todos los países en el listado ordenado
async function listarPaises() {
  const listaPaises = document.getElementById('listaPaises');
  listaPaises.innerHTML = '';
  try {
    const res = await fetch(`${apiBase}/paisesOrdenados`);
    if (!res.ok) {
      listaPaises.textContent = 'No se pudo obtener la lista ordenada.';
      return;
    }
    const paises = await res.json();
    paises.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.nombre} - ${p.superficie} km²`;
      listaPaises.appendChild(li);
    });
  } catch (e) {
    listaPaises.textContent = 'Error al cargar países ordenados.';
    console.error(e);
  }
}

// Cargar todos los países para los selects de comparación
async function cargarTodosLosPaises() {
  try {
    const res = await fetch(`${apiBase}/paisesTodos`);
    if (!res.ok) {
      alert('No se pudo cargar la lista de países.');
      return;
    }
    const todosPaises = await res.json();

    const select1 = document.getElementById('pais1');
    const select2 = document.getElementById('pais2');
    select1.innerHTML = '<option value="">Seleccione...</option>';
    select2.innerHTML = '<option value="">Seleccione...</option>';

    todosPaises.forEach(p => {
      const option1 = document.createElement('option');
      option1.value = p.nombre;
      option1.textContent = p.nombre;
      select1.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = p.nombre;
      option2.textContent = p.nombre;
      select2.appendChild(option2);
    });
  } catch (e) {
    alert('Error cargando países para comparación.');
    console.error(e);
  }
}

// Buscar países o provincias según input
async function buscar() {
  const nombre = document.getElementById('inputNombre').value.trim();
  const resultado = document.getElementById('resultadoBusqueda');
  resultado.innerHTML = '';

  if (!nombre) {
    alert('Ingrese un nombre válido.');
    return;
  }

  // Primero, si es un continente, resaltar continente y salir
  if (continentes[nombre]) {
    resaltarContinente(nombre);
    resultado.textContent = `Países resaltados del continente ${nombre}`;
    return;
  }

  // Si no es continente, intentar país
  try {
    resaltarPais(nombre);

    let res = await fetch(`${apiBase}/paises?continente=${encodeURIComponent(nombre)}`);
    if (res.status === 200) {
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
    if (res.status === 200) {
      const provincias = await res.json();
      if (provincias.length > 0) {
        provincias.forEach(pr => {
          const li = document.createElement('li');
          li.textContent = pr.nombre;
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

// Comparar dos países por superficie con resaltado de glow
async function comparar() {
  console.log("Botón comparar clickeado");

  const p1 = document.getElementById('pais1').value;
  const p2 = document.getElementById('pais2').value;
  const resElem = document.getElementById('resultadoComparacion');
  resElem.textContent = '';

  if (!p1 || !p2) {
    alert('Por favor seleccione ambos países para comparar.');
    return;
  }

  if (p1 === p2) {
    resElem.textContent = 'No se puede comparar un país consigo mismo.';
    return;
  }

  try {
    const res = await fetch(`${apiBase}/comparar?pais1=${encodeURIComponent(p1)}&pais2=${encodeURIComponent(p2)}`);
    if (!res.ok) {
      resElem.textContent = 'No se pudo obtener la comparación.';
      return;
    }

    const mayor = await res.json();
    const menor = (mayor.nombre === p1) ? p2 : p1;

    resElem.textContent = `El país más grande es: ${mayor.nombre} con ${mayor.superficie} km²`;

    limpiarResaltado();
    resaltarPais(mayor.nombre, 'red');   // 🔴 grande
    resaltarPais(menor, 'dodgerblue');   // 🔵 chico

  } catch (e) {
    resElem.textContent = 'Error al comparar países.';
    console.error(e);
  }
}

function intentarCargarPaises() {
  const mapaObj = document.getElementById('mapaMundi');

  if (mapaObj && mapaObj.contentDocument) {
    console.log("✅ El SVG está listo. Cargando países...");
    cargarTodosLosPaises();
  } else {
    console.log("⏳ Esperando que el SVG cargue...");
    setTimeout(intentarCargarPaises, 200); // Intenta cada 200ms
  }
}

window.onload = () => {
  intentarCargarPaises();
};
