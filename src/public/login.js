const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    email: emailInput.value,
    password: passwordInput.value
  };

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  alert(result.message || result.error);

  if (response.ok) {
    localStorage.setItem('nombre', (result.nombre || '').trim());
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    window.location.href = '/';
  }
});
