const categoriesSection = document.getElementById('categories-section');
const categoriesList = document.getElementById('categories-list');
const productsList = document.getElementById('products-list');
let categoriasCargadas = false;
let productosPorId = new Map();
let productosOriginales = [];

function capitalizarCategoria(nombre) {
  const texto = String(nombre || '').trim();
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function getImageSrc(imagen) {
  const raw = typeof imagen === 'string' ? imagen.trim() : '';
  if (!raw) return '';

  // Si ya viene como URL o ruta absoluta del server, usar tal cual
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
    return raw;
  }

  // Si solo escriben "silla1.png" en el panel, asumimos carpeta pública /images/products/
  return `/images/products/${raw}`;
}

function getCart() {
  try {
    const raw = localStorage.getItem('cart');
    const cart = raw ? JSON.parse(raw) : [];
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function agregarAlCarrito(producto, redirect = false) {
  const cart = getCart();
  const existing = cart.find((item) => String(item.productId) === String(producto.id));

  if (existing) {
    existing.cantidad = (Number(existing.cantidad) || 0) + 1;
  } else {
    cart.push({
      productId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }

  saveCart(cart);

  if (redirect) {
    window.location.href = '/carrito.html';
    return;
  }

  alert('Producto agregado al carrito');
}

function getQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
}

function aplicarBusqueda(query) {
  const q = String(query || '').trim().toLowerCase();

  if (!q) {
    renderProductos(productosOriginales);
    return;
  }

  const filtrados = productosOriginales.filter((producto) =>
    String(producto.nombre || '').toLowerCase().includes(q)
  );

  if (!filtrados.length) {
    productsList.innerHTML = '<p>No se encontró ningún producto con ese nombre.</p>';
    return;
  }

  renderProductos(filtrados);
}

function renderCategorias(categorias) {
  if (!categorias.length) {
    categoriesList.innerHTML = '<p>No hay categorias registradas.</p>';
    return;
  }

  const items = categorias.map((categoria) => `
    <a class="category-pill" href="/categoria.html?id=${categoria.id}">${capitalizarCategoria(categoria.nombre)}</a>
  `).join('');

  categoriesList.innerHTML = `<div class="category-pills">${items}</div>`;
}

function renderProductos(productos) {
  if (!productos.length) {
    productsList.innerHTML = '<p>No hay productos registrados.</p>';
    return;
  }

  productosPorId = new Map(productos.map((p) => [String(p.id), p]));

  const cards = productos.map((producto) => `
    <article class="product-card">
      <header class="product-card-header">
        <h3>${producto.nombre}</h3>
      </header>

      ${getImageSrc(producto.imagen) ? `
        <div class="product-card-image">
          <img
            src="${getImageSrc(producto.imagen)}"
            alt="Imagen de ${producto.nombre}"
            loading="lazy"
            onerror="this.closest('.product-card-image')?.remove();"
          >
        </div>
      ` : ''}

      <div class="product-card-body">
        <p><strong>Categoria:</strong> ${producto.Category ? producto.Category.nombre : 'Sin categoria'}</p>
        <p><strong>Descripcion:</strong> ${producto.descripcion || 'Sin descripcion'}</p>
        <p><strong>Precio:</strong> ${producto.precio}</p>
        <p><strong>Stock:</strong> ${producto.stock}</p>
      </div>

      <footer class="product-card-actions">
        <button type="button" class="btn-add-cart" data-product-id="${producto.id}">Agregar al carrito</button>
        <button type="button" class="btn-buy-now" data-product-id="${producto.id}">Comprar</button>
      </footer>
    </article>
  `).join('');

  productsList.innerHTML = `<div class="product-cards">${cards}</div>`;
}

productsList.addEventListener('click', (event) => {
  const addButton = event.target.closest('button.btn-add-cart');
  const buyButton = event.target.closest('button.btn-buy-now');

  const button = addButton || buyButton;
  if (!button) return;

  const productId = button.dataset.productId;
  const producto = productosPorId.get(String(productId));

  if (!producto) {
    alert('No se encontró el producto');
    return;
  }

  agregarAlCarrito(producto, Boolean(buyButton));
});

async function cargarCategorias() {
  categoriesList.textContent = 'Cargando categorias...';

  try {
    const response = await fetch('/api/categories');

    if (!response.ok) {
      throw new Error('No se pudieron cargar las categorias');
    }

    const categorias = await response.json();
    renderCategorias(categorias);
    categoriasCargadas = true;
  } catch (error) {
    categoriesList.innerHTML = '<p>Error al cargar las categorias.</p>';
  }
}

async function cargarProductos() {
  productsList.textContent = 'Cargando productos...';

  try {
    const response = await fetch('/api/products');

    if (!response.ok) {
      throw new Error('No se pudieron cargar los productos');
    }

    const productos = await response.json();
    productosOriginales = Array.isArray(productos) ? productos : [];
    aplicarBusqueda(getQueryFromUrl());
  } catch (error) {
    productsList.innerHTML = '<p>Error al cargar los productos.</p>';
  }
}

// Cargar categorías automáticamente (sin botón)
cargarCategorias();

window.addEventListener('productSearch', (event) => {
  aplicarBusqueda(event.detail?.query || '');
});

cargarProductos();
