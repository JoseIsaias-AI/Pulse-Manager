(function () {
  'use strict';

  function getBaseUrl() {
    const configuredBaseUrl = window.PulseConfig?.apiBaseUrl || window.PULSE_API_BASE;

    if (!configuredBaseUrl) {
      console.error(
        '[PulseApi] URL da API ausente. Carregue src/frontend/js/config.js antes de api.js ' +
          'ou defina window.PULSE_API_BASE.'
      );
      throw new Error('URL da API nao configurada.');
    }

    return String(configuredBaseUrl).replace(/\/$/, '');
  }

  function buildUrl(path, queryParams) {
    const normalizedPath = String(path || '').startsWith('/') ? path : `/${path}`;
    const url = new URL(`${getBaseUrl()}${normalizedPath}`);

    Object.entries(queryParams || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }

  function getPulseUser() {
    try {
      const storedUser = sessionStorage.getItem('pulseUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (_error) {
      return null;
    }
  }

  function getAuthHeaders() {
    const pulseUser = getPulseUser();
    if (!pulseUser) return {};

    const authHeaders = {};

    if (pulseUser.id !== undefined && pulseUser.id !== null) {
      authHeaders['x-user-id'] = String(pulseUser.id);
    }

    if (pulseUser.perfil) {
      authHeaders['x-user-role'] = String(pulseUser.perfil);
    }

    if (pulseUser.nome) {
      authHeaders['x-user-name'] = String(pulseUser.nome);
    }

    return authHeaders;
  }

  function getJsonHeaders(customHeaders) {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(customHeaders || {})
    };
  }

  async function parseResponse(response) {
    const responseText = await response.text();
    if (!responseText) return {};

    try {
      return JSON.parse(responseText);
    } catch (_error) {
      return { success: false, message: responseText };
    }
  }

  function createApiError(message, status, data) {
    const error = new Error(message || 'Nao foi possivel concluir a requisicao.');
    error.status = status;
    error.data = data;
    return error;
  }

  async function request(method, path, options) {
    const requestOptions = options || {};
    const hasBody = requestOptions.body !== undefined && requestOptions.body !== null;

    let response;
    try {
      response = await fetch(buildUrl(path, requestOptions.query), {
        method,
        headers: getJsonHeaders(requestOptions.headers),
        body: hasBody ? JSON.stringify(requestOptions.body) : undefined,
        signal: requestOptions.signal
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw createApiError('Nao foi possivel conectar a API.', 0, null);
    }

    const responseBody = await parseResponse(response);
    if (!response.ok || responseBody.success === false) {
      throw createApiError(responseBody.message, response.status, responseBody);
    }

    return responseBody;
  }

  const pulseApi = {
    get(path, options) {
      return request('GET', path, options);
    },

    post(path, body, options) {
      return request('POST', path, { ...(options || {}), body });
    },

    patch(path, body, options) {
      return request('PATCH', path, { ...(options || {}), body });
    },

    delete(path, options) {
      return request('DELETE', path, options);
    }
  };

  window.pulseApi = pulseApi;
  window.PulseApi = pulseApi;
})();
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
