(function () {
  'use strict';

  const ROLE_LABELS = {
    gestor: 'Gestor',
    psicologo: 'Psicólogo',
    aluno: 'Aluno'
  };

  function initials(name) {
    const parts = String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const selected = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
    return selected
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  function storedUser() {
    try {
      const value = sessionStorage.getItem('pulseUser');
      return value ? JSON.parse(value) : null;
    } catch (_error) {
      return null;
    }
  }

  function getPulseDisplayUser(fallback) {
    const session = storedUser();
    const defaultUser = fallback || {};
    const name = session?.nome || defaultUser.name || 'Usuario';
    const profile = session?.perfil || '';

    return {
      name,
      role: ROLE_LABELS[profile] || defaultUser.role || profile,
      initials: initials(name) || defaultUser.initials || 'US'
    };
  }

  window.getPulseDisplayUser = getPulseDisplayUser;
})();
