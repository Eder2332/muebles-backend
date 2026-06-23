const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const issueSelect = document.getElementById('issueSelect');
const otherBox = document.getElementById('otherBox');
const otherIssueInput = document.getElementById('otherIssueInput');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const supportStatus = document.getElementById('supportStatus');

function toggleOtherBox() {
  const value = (issueSelect.value || '').trim();
  otherBox.style.display = value === 'Otro' ? 'block' : 'none';
}

function setStatus(message, color) {
  supportStatus.textContent = message;
  supportStatus.style.color = color;
}

function getIssueType() {
  const selected = (issueSelect.value || '').trim();
  const otherIssue = (otherIssueInput.value || '').trim();

  if (selected === 'Otro') {
    return otherIssue;
  }

  return selected;
}

async function sendSupportReport() {
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    issueType: getIssueType(),
    message: messageInput.value.trim()
  };

  if (!payload.name) {
    setStatus('Ingresa tu nombre.', '#b34747');
    nameInput.focus();
    return;
  }

  if (!payload.email) {
    setStatus('Ingresa tu correo.', '#b34747');
    emailInput.focus();
    return;
  }

  if (!issueSelect.value.trim()) {
    setStatus('Selecciona el tipo de problema.', '#b34747');
    issueSelect.focus();
    return;
  }

  if (issueSelect.value === 'Otro' && !payload.issueType) {
    setStatus('Especifica cuál es tu problema.', '#b34747');
    otherIssueInput.focus();
    return;
  }

  if (!payload.message || payload.message.length < 10) {
    setStatus('Describe tu problema con un poco más de detalle.', '#b34747');
    messageInput.focus();
    return;
  }

  sendBtn.disabled = true;
  setStatus('Enviando reporte...', 'var(--muted)');

  try {
    const response = await fetch('/api/support/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus(result.error || 'No se pudo enviar tu reporte.', '#b34747');
      return;
    }

    setStatus(result.message || 'Tu reporte fue enviado correctamente.', '#2f7a4b');
    issueSelect.value = '';
    otherIssueInput.value = '';
    messageInput.value = '';
  } catch (error) {
    setStatus('Ocurrió un error al enviar el reporte.', '#b34747');
  } finally {
    sendBtn.disabled = false;
    toggleOtherBox();
  }
}

issueSelect.addEventListener('change', toggleOtherBox);
sendBtn.addEventListener('click', sendSupportReport);

const nombreGuardado = (localStorage.getItem('nombre') || '').trim();
if (nombreGuardado) {
  nameInput.value = nombreGuardado;
}

toggleOtherBox();
