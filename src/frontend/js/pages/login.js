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

function validateLoginForm(email, name) {
  const normalizedEmail = String(email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return 'E-mail inválido';
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

function savePulseUser(user) {
  const pulseUser = {
    id: user.id,
    email: user.email,
    nome: user.nome,
    perfil: user.perfil
  };

  sessionStorage.setItem('pulseUser', JSON.stringify(pulseUser));
}

function getDestinationPage(role) {
  return rolePages[role] || rolePages.gestor;
}

async function loginWithEmail(email, name, role) {
  if (!window.PulseApi) {
    throw new Error('Cliente HTTP nao carregado.');
  }

  const response = await window.PulseApi.post('/auth/login', {
    email: email.trim().toLowerCase(),
    nome: name.trim(),
    perfil: role
  });

  const user = response.data;
  if (!user || user.id === undefined || !user.email || !user.nome || !user.perfil) {
    throw new Error('Resposta de login invalida.');
  }

  return {
    id: user.id,
    email: user.email,
    nome: user.nome || name.trim(),
    perfil: user.perfil || role
  };
}

async function handleLoginSubmit() {
  const emailInput = document.getElementById('email');
  const nameInput = document.getElementById('nome');
  const submitButton = document.getElementById('btn-entrar');

  if (submitButton.disabled) return;

  const validationError = validateLoginForm(emailInput.value, nameInput.value);

  if (validationError) {
    showButtonFeedback(submitButton, validationError);
    return;
  }

  submitButton.textContent = 'Entrando...';
  submitButton.disabled = true;

  try {
    const pulseUser = await loginWithEmail(emailInput.value, nameInput.value, currentRole);
    savePulseUser(pulseUser);

    window.location.href = getDestinationPage(currentRole);
  } catch (error) {
    showButtonFeedback(submitButton, error.message || 'Usuário não encontrado');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-entrar').addEventListener('click', handleLoginSubmit);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleLoginSubmit();
  });
});
