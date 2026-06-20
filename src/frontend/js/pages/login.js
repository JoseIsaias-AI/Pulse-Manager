const rolePages = {
  gestor: 'gestorApp.html',
  psicologo: 'psicologoApp.html',
  aluno: 'alunoApp.html'
};

let currentRole = 'gestor';

function selectRole(button, role) {
  document.querySelectorAll('.role-btn').forEach((roleButton) => {
    roleButton.classList.remove('active');
  });

  button.classList.add('active');
  currentRole = role;
}

function getCpfDigits(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

function applyCpfMask(input) {
  let value = getCpfDigits(input.value);

  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  input.value = value;
}

function validateLoginForm(cpf, name) {
  const cpfDigits = getCpfDigits(cpf);

  if (cpfDigits.length !== 11) return 'CPF invalido';
  if (name.trim().length < 3) return 'Nome muito curto';

  return null;
}

function showButtonFeedback(button, message) {
  button.textContent = message;
  button.classList.add('error');

  setTimeout(() => {
    button.textContent = 'ENTRAR';
    button.classList.remove('error');
    button.disabled = false;
  }, 2200);
}

function createPulseUser(cpf, name, role) {
  const cpfDigits = getCpfDigits(cpf);

  return {
    id: Number(cpfDigits),
    cpf: cpfDigits,
    nome: name.trim(),
    perfil: role
  };
}

function savePulseUser(user) {
  sessionStorage.setItem('pulseUser', JSON.stringify(user));
}

function getDestinationPage(role) {
  return rolePages[role] || rolePages.gestor;
}

function handleLoginSubmit() {
  const cpfInput = document.getElementById('cpf');
  const nameInput = document.getElementById('nome');
  const submitButton = document.getElementById('btn-entrar');
  const validationError = validateLoginForm(cpfInput.value, nameInput.value);

  if (validationError) {
    showButtonFeedback(submitButton, validationError);
    return;
  }

  submitButton.textContent = 'Entrando...';
  submitButton.disabled = true;

  const pulseUser = createPulseUser(cpfInput.value, nameInput.value, currentRole);
  savePulseUser(pulseUser);

  window.location.href = getDestinationPage(currentRole);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cpf').addEventListener('input', function () {
    applyCpfMask(this);
  });

  document.getElementById('btn-entrar').addEventListener('click', handleLoginSubmit);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleLoginSubmit();
  });
});
