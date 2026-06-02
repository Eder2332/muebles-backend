const registerForm = document.getElementById('registerForm');
const nombreInput = document.getElementById('nombre');
const apellidosInput = document.getElementById('apellidos');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombre: nombreInput.value,
    apellidos: apellidosInput.value,
    email: emailInput.value,
    password: passwordInput.value
  };

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  alert(result.message || result.error);

  if (response.ok) {
    // El register no devuelve token, así que hacemos login para guardar el token
    try {
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value,
          password: passwordInput.value
        })
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('nombre', (loginResult.nombre || nombreInput.value || '').trim());
        if (loginResult.token) {
          localStorage.setItem('token', loginResult.token);
        }
        window.location.href = '/';
        return;
      }
    } catch (error) {
      // Ignorar y continuar
    }

    // Si por alguna razón no se pudo hacer login automático, mandar al login
    localStorage.setItem('nombre', nombreInput.value.trim());
    window.location.href = '/login.html';
  }
});
