const personalForm = document.getElementById('personalForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

personalForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const response = await fetch('/api/auth/personal-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: emailInput.value,
      password: passwordInput.value
    })
  });

  const result = await response.json();

  alert(result.message || result.error);

  if (response.ok) {
    localStorage.setItem('adminToken', result.token);
    window.location.href = '/panel.html';
  }
});
