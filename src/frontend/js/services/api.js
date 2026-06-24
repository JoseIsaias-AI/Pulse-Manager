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
      const contentType = response.headers.get('content-type') || '';
      const isHtml = contentType.includes('text/html') || /^\s*</.test(responseText);

      return {
        success: false,
        message: isHtml ? 'Não foi possível concluir a solicitação.' : responseText
      };
    }
  }

  function createApiError(message, status, data) {
    const error = new Error(message || 'Não foi possível concluir a solicitação.');
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

  async function download(path, options) {
    const requestOptions = options || {};
    let response;

    try {
      response = await fetch(buildUrl(path, requestOptions.query), {
        method: 'GET',
        headers: {
          Accept: 'text/csv',
          ...getAuthHeaders(),
          ...(requestOptions.headers || {})
        },
        signal: requestOptions.signal
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw createApiError('Nao foi possivel conectar a API.', 0, null);
    }

    if (!response.ok) {
      const responseBody = await parseResponse(response);
      throw createApiError(responseBody.message, response.status, responseBody);
    }

    return response.blob();
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
    },

    importarAlunosCsv(csv) {
      return request('POST', '/gestor/importacoes/alunos', {
        body: { csv }
      });
    },

    exportarAlunosCsv(options) {
      return download('/gestor/exportacoes/alunos', options);
    }
  };

  window.pulseApi = pulseApi;
  window.PulseApi = pulseApi;
})();
