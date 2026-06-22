(function () {
  function getApiBaseUrl() {
    if (window.PULSE_API_BASE_URL) return window.PULSE_API_BASE_URL.replace(/\/$/, '');
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      if (window.location.port && window.location.port !== '3000') return 'http://localhost:3000/api';
      return `${window.location.origin}/api`;
    }
    return 'http://localhost:3000/api';
  }

  const API_BASE_URL = getApiBaseUrl();

  async function requestJson(path, options) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'gestor',
        ...(options && options.headers ? options.headers : {})
      },
      ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || 'Não foi possível concluir a solicitação.');
    }

    return payload;
  }

  window.PulseApi = {
    importarAlunosCsv(csv) {
      return requestJson('/gestor/importacoes/alunos', {
        method: 'POST',
        body: JSON.stringify({ csv })
      });
    },

    async exportarAlunosCsv() {
      const response = await fetch(`${API_BASE_URL}/gestor/exportacoes/alunos`, {
        headers: { 'x-user-role': 'gestor' }
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Não foi possível exportar o CSV.');
      }

      return response.blob();
    }
  };
})();
