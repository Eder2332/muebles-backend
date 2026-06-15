async function loadNavbar() {
  const currentPage = window.location.pathname;

  if (!document.querySelector('link[data-style="navbar"]')) {
    const navbarStyles = document.createElement('link');
    navbarStyles.rel = 'stylesheet';
    navbarStyles.href = '/style/navbar.css';
    navbarStyles.setAttribute('data-style', 'navbar');
    document.head.appendChild(navbarStyles);
  }

  // No mostrar navbar en login y register
  if (currentPage.includes("login") || currentPage.includes("register")) {
    return;
  }

  const res = await fetch("/navbar.html");
  const html = await res.text();

  document.body.insertAdjacentHTML("afterbegin", html);

  const nombre = localStorage.getItem("nombre");
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  const userName = document.getElementById("userName");
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const personalLink = document.getElementById('personalLink');
  const logoutLink = document.getElementById('logoutLink');

  const estaLogeado = Boolean(token || adminToken);

  if (token && nombre) {
    userName.textContent = "👤 " + nombre;
  } else if (adminToken) {
    userName.textContent = "👤 Administrador";
  } else {
    userName.textContent = "No logeado";
  }

  // Mostrar/ocultar links según sesión
  if (loginLink) loginLink.style.display = estaLogeado ? 'none' : '';
  if (registerLink) registerLink.style.display = estaLogeado ? 'none' : '';
  if (personalLink) personalLink.style.display = estaLogeado ? 'none' : '';
  if (logoutLink) logoutLink.style.display = estaLogeado ? '' : 'none';

  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('nombre');
      window.location.href = '/';
    });
  }

  const searchInput = document.querySelector('.navbar-search');

  if (searchInput) {
    const dispatchSearch = (query) => {
      window.dispatchEvent(new CustomEvent('productSearch', {
        detail: {
          query: String(query || '')
        }
      }));
    };

    searchInput.addEventListener('input', (event) => {
      dispatchSearch(event.target.value);
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();

      const query = (searchInput.value || '').trim();
      dispatchSearch(query);

      // Si estoy en una página sin listado de productos, redirigir al inicio con la búsqueda
      const path = window.location.pathname;
      const esPaginaDeProductos =
        path === '/' ||
        path.endsWith('/index.html') ||
        path.endsWith('/categoria.html');

      if (!esPaginaDeProductos) {
        window.location.href = `/?q=${encodeURIComponent(query)}`;
      }
    });

    // Avisar que el navbar ya está listo (útil para páginas que esperan el input)
    window.dispatchEvent(new Event('navbarLoaded'));
  }
}

loadNavbar();
