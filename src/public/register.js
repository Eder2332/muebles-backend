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
    localStorage.setItem('nombre', nombreInput.value.trim());
    window.location.href = '/';
  }
});
