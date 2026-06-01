const token = localStorage.getItem('adminToken');
const usuariosBody = document.getElementById('usuarios');
const productosBody = document.getElementById('productos');
const categoriasAdmin = document.getElementById('categorias-admin');
const crearProductoBtn = document.getElementById('crear-producto-btn');

let usuariosCache = [];
let categoriasCache = [];
let productosCache = [];

if (!token) {
  alert('Debes iniciar sesion como superadministrador');
  window.location.href = '/personal-login.html';
}

async function requestAdmin(url, options = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Ocurrio un error');
  }

  return data;
}

async function cargarUsuarios() {
  try {
    const usuarios = await requestAdmin('/api/admin/users');
    usuariosCache = usuarios;

    if (!usuarios.length) {
      usuariosBody.innerHTML = `
        <tr>
          <td colspan="5">No hay usuarios registrados.</td>
        </tr>
      `;
      return;
    }

    usuariosBody.innerHTML = usuarios.map((user) => `
      <tr>
        <td>${user.id}</td>
        <td>${user.nombre}</td>
        <td>${user.email}</td>
        <td>${user.rol}</td>
        <td>
          <button type="button" data-action="editar-usuario" data-id="${user.id}">Editar</button>
          <button type="button" data-action="eliminar-usuario" data-id="${user.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    usuariosBody.innerHTML = `
      <tr>
        <td colspan="5">${error.message}</td>
      </tr>
    `;
  }
}

function renderCategoriasAdmin(categorias) {
  if (!categorias.length) {
    categoriasAdmin.innerHTML = '<p>No hay categorias registradas.</p>';
    return;
  }

  categoriasAdmin.innerHTML = `
    <ul>
      ${categorias.map((categoria) => `<li>ID ${categoria.id}: ${categoria.nombre}</li>`).join('')}
    </ul>
  `;
}

async function cargarCategorias() {
  try {
    const response = await fetch('/api/categories');

    if (!response.ok) {
      throw new Error('No se pudieron cargar las categorias');
    }

    categoriasCache = await response.json();
    renderCategoriasAdmin(categoriasCache);
  } catch (error) {
    categoriasAdmin.innerHTML = `<p>${error.message}</p>`;
  }
}

function renderProductos(productos) {
  if (!productos.length) {
    productosBody.innerHTML = `
      <tr>
        <td colspan="7">No hay productos registrados.</td>
      </tr>
    `;
    return;
  }

  productosBody.innerHTML = productos.map((producto) => `
    <tr>
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td>${producto.Category ? producto.Category.nombre : 'Sin categoria'}</td>
      <td>${producto.precio}</td>
      <td>${producto.stock}</td>
      <td>${producto.imagen || 'Sin imagen'}</td>
      <td>
        <button type="button" data-action="editar-producto" data-id="${producto.id}">Editar</button>
        <button type="button" data-action="eliminar-producto" data-id="${producto.id}">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

async function cargarProductos() {
  try {
    const response = await fetch('/api/products');

    if (!response.ok) {
      throw new Error('No se pudieron cargar los productos');
    }

    productosCache = await response.json();
    renderProductos(productosCache);
  } catch (error) {
    productosBody.innerHTML = `
      <tr>
        <td colspan="7">${error.message}</td>
      </tr>
    `;
  }
}

function pedirDato(mensaje, valorInicial = '') {
  const valor = prompt(mensaje, valorInicial);

  if (valor === null) {
    return null;
  }

  return valor.trim();
}

async function eliminarUsuario(id) {
  if (!confirm('Quieres eliminar este usuario?')) {
    return;
  }

  try {
    const result = await requestAdmin(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });

    alert(result.message);
    await cargarUsuarios();
  } catch (error) {
    alert(error.message);
  }
}

async function editarUsuario(id) {
  const usuario = usuariosCache.find((item) => item.id === id);

  if (!usuario) {
    alert('Usuario no encontrado');
    return;
  }

  const nombre = pedirDato('Nuevo nombre:', usuario.nombre || '');
  if (nombre === null) {
    return;
  }

  const email = pedirDato('Nuevo correo:', usuario.email || '');
  if (email === null) {
    return;
  }

  const password = prompt('Nueva contrasena (deja vacio para no cambiarla):', '');

  try {
    const result = await requestAdmin(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre,
        email,
        password
      })
    });

    alert(result.message);
    await cargarUsuarios();
  } catch (error) {
    alert(error.message);
  }
}

function pedirCategoria(producto) {
  const categoriasTexto = categoriasCache.length
    ? categoriasCache.map((categoria) => `ID ${categoria.id}: ${categoria.nombre}`).join('\n')
    : 'No hay categorias registradas. Puedes dejar el campo vacio.';

  const categoryId = prompt(
    `Ingresa el ID de la categoria.\n\n${categoriasTexto}`,
    producto && producto.Category ? String(producto.Category.id) : ''
  );

  if (categoryId === null) {
    return null;
  }

  return categoryId.trim();
}

async function crearProducto() {
  if (!categoriasCache.length) {
    await cargarCategorias();
  }

  const nombre = pedirDato('Nombre del producto:');
  if (nombre === null || !nombre) {
    return;
  }

  const descripcion = pedirDato('Descripcion del producto:');
  if (descripcion === null) {
    return;
  }

  const precio = pedirDato('Precio del producto:');
  if (precio === null) {
    return;
  }

  const stock = pedirDato('Stock del producto:', '0');
  if (stock === null) {
    return;
  }

  const imagen = pedirDato('Ruta o nombre de la imagen (opcional):');
  if (imagen === null) {
    return;
  }

  const categoryId = pedirCategoria();
  if (categoryId === null) {
    return;
  }

  try {
    await requestAdmin('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        categoryId
      })
    });

    alert('Producto creado');
    await cargarProductos();
  } catch (error) {
    alert(error.message);
  }
}

async function editarProducto(id) {
  const producto = productosCache.find((item) => item.id === id);

  if (!producto) {
    alert('Producto no encontrado');
    return;
  }

  if (!categoriasCache.length) {
    await cargarCategorias();
  }

  const nombre = pedirDato('Nombre del producto:', producto.nombre);
  if (nombre === null || !nombre) {
    return;
  }

  const descripcion = pedirDato('Descripcion del producto:', producto.descripcion || '');
  if (descripcion === null) {
    return;
  }

  const precio = pedirDato('Precio del producto:', String(producto.precio));
  if (precio === null) {
    return;
  }

  const stock = pedirDato('Stock del producto:', String(producto.stock));
  if (stock === null) {
    return;
  }

  const imagen = pedirDato('Ruta o nombre de la imagen (opcional):', producto.imagen || '');
  if (imagen === null) {
    return;
  }

  const categoryId = pedirCategoria(producto);
  if (categoryId === null) {
    return;
  }

  try {
    await requestAdmin(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        categoryId
      })
    });

    alert('Producto actualizado');
    await cargarProductos();
  } catch (error) {
    alert(error.message);
  }
}

async function eliminarProducto(id) {
  if (!confirm('Quieres eliminar este producto?')) {
    return;
  }

  try {
    const result = await requestAdmin(`/api/products/${id}`, {
      method: 'DELETE'
    });

    alert(result.message);
    await cargarProductos();
  } catch (error) {
    alert(error.message);
  }
}

usuariosBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === 'editar-usuario') {
    await editarUsuario(id);
  }

  if (action === 'eliminar-usuario') {
    await eliminarUsuario(id);
  }
});

productosBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === 'editar-producto') {
    await editarProducto(id);
  }

  if (action === 'eliminar-producto') {
    await eliminarProducto(id);
  }
});

crearProductoBtn.addEventListener('click', crearProducto);

if (token) {
  cargarUsuarios();
  cargarCategorias();
  cargarProductos();
}
