(function () {
  'use strict';

  const defaultBaseUrl = 'http://localhost:3000/api';

  function getBaseUrl() {
    const configuredBaseUrl = window.PULSE_API_BASE || defaultBaseUrl;
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

  function getJsonHeaders(customHeaders) {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
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
