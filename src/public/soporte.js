const nameInput = document.getElementById('nameInput');
const issueSelect = document.getElementById('issueSelect');
const otherBox = document.getElementById('otherBox');
const otherIssueInput = document.getElementById('otherIssueInput');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const supportStatus = document.getElementById('supportStatus');
const token = localStorage.getItem('token');
const btnLabel = sendBtn ? sendBtn.querySelector('.btn-label') : null;

if (!token) {
  alert('Debes iniciar sesión para acceder a soporte.');
  window.location.href = '/login.html';
}

function toggleOtherBox() {
  const value = (issueSelect.value || '').trim();
  otherBox.style.display = value === 'Otro' ? 'block' : 'none';
}

function setStatus(message, color) {
  supportStatus.textContent = message;
  supportStatus.style.color = color;
}

function setStatusType(type) {
  supportStatus.classList.remove('is-success', 'is-error');
  if (type === 'success') supportStatus.classList.add('is-success');
  if (type === 'error') supportStatus.classList.add('is-error');
}

function setButtonLoading(loading, label) {
  sendBtn.disabled = loading;
  sendBtn.classList.toggle('is-loading', loading);
  if (btnLabel && label) {
    btnLabel.textContent = label;
  }
}

function getIssueType() {
  const selected = (issueSelect.value || '').trim();
  const otherIssue = (otherIssueInput.value || '').trim();

  if (selected === 'Otro') {
    return otherIssue;
  }

  return selected;
}

function isValidName(name) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(name);
}

function sanitizeName(value) {
  return String(value || '').replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
}

async function sendSupportReport() {
  const payload = {
    name: nameInput.value.trim(),
    issueType: getIssueType(),
    message: messageInput.value.trim()
  };

  if (!payload.name) {
    setStatusType('error');
    setStatus('Ingresa tu nombre.', '#b34747');
    nameInput.focus();
    return;
  }

  if (!isValidName(payload.name)) {
    setStatusType('error');
    setStatus('El nombre solo puede contener letras y espacios.', '#b34747');
    nameInput.focus();
    return;
  }

  if (!issueSelect.value.trim()) {
    setStatusType('error');
    setStatus('Selecciona el tipo de problema.', '#b34747');
    issueSelect.focus();
    return;
  }

  if (issueSelect.value === 'Otro' && !payload.issueType) {
    setStatusType('error');
    setStatus('Especifica cuál es tu problema.', '#b34747');
    otherIssueInput.focus();
    return;
  }

  if (!payload.message || payload.message.length < 10) {
    setStatusType('error');
    setStatus('Describe tu problema con un poco más de detalle.', '#b34747');
    messageInput.focus();
    return;
  }

  setStatusType();
  setStatus('Enviando reporte...', 'var(--muted)');
  setButtonLoading(true, 'Enviando...');

  try {
    const response = await fetch('/api/support/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        setStatusType('error');
        setStatus('Tu sesión expiró. Vuelve a iniciar sesión.', '#b34747');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1200);
        return;
      }

      setStatusType('error');
      setStatus(result.error || 'No se pudo enviar tu reporte.', '#b34747');
      return;
    }

    setStatusType('success');
    setStatus(result.message || 'Tu reporte fue enviado correctamente.', '#2f7a4b');
    setButtonLoading(true, 'Enviado');
    issueSelect.value = '';
    otherIssueInput.value = '';
    messageInput.value = '';
  } catch (error) {
    setStatusType('error');
    setStatus('Ocurrió un error al enviar el reporte.', '#b34747');
  } finally {
    setTimeout(() => {
      setButtonLoading(false, 'Enviar');
    }, 900);
    toggleOtherBox();
  }
}

nameInput.addEventListener('input', () => {
  const cleanValue = sanitizeName(nameInput.value);
  if (nameInput.value !== cleanValue) {
    nameInput.value = cleanValue;
  }
});

issueSelect.addEventListener('change', toggleOtherBox);
sendBtn.addEventListener('click', sendSupportReport);

const nombreGuardado = (localStorage.getItem('nombre') || '').trim();
if (nombreGuardado) {
  nameInput.value = nombreGuardado;
}

toggleOtherBox();
