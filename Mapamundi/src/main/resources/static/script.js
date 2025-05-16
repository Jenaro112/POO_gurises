const apiBase = '/mapa';

// Diccionario: nombre del país → ID en el SVG
const mapaSVG = {
  "Argentina": "ar",
  "Brasil": "br",
  "Uruguay": "uy",
  "España": "es",
  "Estados Unidos": "us",
  "Francia": "fr",
  "Alemania": "de",
  "Italia": "it"
  // Agregá más según los países que uses
};

// 🔴 Resaltar país en el SVG
function resaltarPais(nombre) {
  const svg = document.getElementById('mapaMundi').contentDocument;
  if (!svg) return;

  // Quitar clase 'resaltado' y estilos inline previos
  const resaltados = svg.querySelectorAll('.resaltado');
  resaltados.forEach(el => {
    el.classList.remove('resaltado');
    el.style.fill = ''; // elimina el fill inline para volver al original
  });

  const id = mapaSVG[nombre];
  if (!id) return;

  const pais = svg.getElementById(id);
  if (pais) {
    pais.classList.add('resaltado');
  }
}

// 🌎 Cargar todos los países en los selects
async function cargarTodosLosPaises() {
  try {
    const res = await fetch(`${apiBase}/paisesTodos`);
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

// 🔍 Buscar países o provincias
async function buscar() {
  const nombre = document.getElementById('inputNombre').value.trim();
  const resultado = document.getElementById('resultadoBusqueda');
  resultado.innerHTML = '';

  if (!nombre) {
    alert('Ingrese un nombre válido.');
    return;
  }

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

// 📋 Listar países ordenados por superficie
async function listarPaises() {
  const listaPaises = document.getElementById('listaPaises');
  listaPaises.innerHTML = '';
  try {
    const res = await fetch(`${apiBase}/paisesOrdenados`);
    if (res.status !== 200) {
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

// ⚖️ Comparar dos países
async function comparar() {
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
    if (res.status !== 200) {
      resElem.textContent = 'No se pudo obtener la comparación.';
      return;
    }
    const paisMasGrande = await res.json();
    if (!paisMasGrande) {
      resElem.textContent = 'No se pudo determinar el país más grande.';
      return;
    }
    resElem.textContent = `El país más grande es: ${paisMasGrande.nombre} con ${paisMasGrande.superficie} km²`;

    resaltarPais(paisMasGrande.nombre);
  } catch (e) {
    resElem.textContent = 'Error al comparar países.';
    console.error(e);
  }
}

// 🚀 Iniciar todo
window.onload = () => {
  cargarTodosLosPaises();
};
