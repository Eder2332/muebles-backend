const categoryName = document.getElementById('category-name');
const categoryDescription = document.getElementById('category-description');
const categoryProducts = document.getElementById('category-products');
const categoriesSection = document.getElementById('categories-section');
const categoriesList = document.getElementById('categories-list');
const toggleCategoriesButton = document.getElementById('toggle-categories');

let productosPorId = new Map();
let productosOriginales = [];
let categoriasCargadas = false;

function getImageSrc(imagen) {
  const raw = typeof imagen === 'string' ? imagen.trim() : '';
  if (!raw) return '';

  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
    return raw;
  }

  return `/images/products/${raw}`;
}

function getCategoryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
}

function renderCategorias(categorias) {
  if (!categorias.length) {
    categoriesList.innerHTML = '<p>No hay categorias registradas.</p>';
    return;
  }

  const query = getQueryFromUrl();
  const qParam = query ? `&q=${encodeURIComponent(query)}` : '';

  const items = categorias.map((categoria) => `
    <li>
      <a href="/categoria.html?id=${categoria.id}${qParam}">${categoria.nombre}</a>
    </li>
  `).join('');

  categoriesList.innerHTML = `<ul>${items}</ul>`;
}

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
    categoryProducts.innerHTML = '<p>No se encontró ningún producto con ese nombre en esta categoría.</p>';
    return;
  }

  renderProductos(filtrados);
}

function renderProductos(products) {
  if (!products.length) {
    categoryProducts.innerHTML = '<p>No hay productos en esta categoria.</p>';
    return;
  }

  productosPorId = new Map(products.map((p) => [String(p.id), p]));

  const cards = products.map((product) => `
    <article class="product-card">
      <header class="product-card-header">
        <h2>${product.nombre}</h2>
      </header>

      ${getImageSrc(product.imagen) ? `
        <div class="product-card-image">
          <img
            src="${getImageSrc(product.imagen)}"
            alt="Imagen de ${product.nombre}"
            loading="lazy"
            onerror="this.closest('.product-card-image')?.remove();"
          >
        </div>
      ` : ''}

      <div class="product-card-body">
        <p><strong>Descripcion:</strong> ${product.descripcion || 'Sin descripcion'}</p>
        <p><strong>Precio:</strong> ${product.precio}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
      </div>

      <footer class="product-card-actions">
        <button type="button" class="btn-add-cart" data-product-id="${product.id}">Agregar al carrito</button>
        <button type="button" class="btn-buy-now" data-product-id="${product.id}">Comprar</button>
      </footer>
    </article>
  `).join('');

  categoryProducts.innerHTML = `<div class="product-cards">${cards}</div>`;
}

categoryProducts.addEventListener('click', (event) => {
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

async function cargarCategoria() {
  const id = getCategoryId();

  if (!id) {
    categoryName.textContent = 'Categoria no encontrada';
    categoryDescription.textContent = 'No se recibio un identificador de categoria.';
    categoryProducts.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`/api/categories/${id}`);

    if (!response.ok) {
      throw new Error('No se pudo cargar la categoria');
    }

    const category = await response.json();
    categoryName.textContent = category.nombre;
    categoryDescription.textContent = `Productos registrados en la categoria ${category.nombre}.`;
    productosOriginales = Array.isArray(category.Products) ? category.Products : [];
    aplicarBusqueda(getQueryFromUrl());
  } catch (error) {
    categoryName.textContent = 'Error';
    categoryDescription.textContent = error.message;
    categoryProducts.innerHTML = '';
  }
}

window.addEventListener('productSearch', (event) => {
  aplicarBusqueda(event.detail?.query || '');
});

if (toggleCategoriesButton && categoriesSection) {
  toggleCategoriesButton.addEventListener('click', async () => {
    const seMostrara = categoriesSection.hidden;
    categoriesSection.hidden = !seMostrara;
    toggleCategoriesButton.textContent = seMostrara ? 'Ocultar categorias' : 'Ver categorias';

    if (seMostrara && !categoriasCargadas) {
      await cargarCategorias();
    }
  });
}

cargarCategoria();
