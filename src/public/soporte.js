const issueSelect = document.getElementById('issueSelect');
const otherBox = document.getElementById('otherBox');

function toggleOtherBox() {
  const value = (issueSelect.value || '').trim();
  otherBox.style.display = value === 'Otro' ? 'block' : 'none';
}

issueSelect.addEventListener('change', toggleOtherBox);
toggleOtherBox();

