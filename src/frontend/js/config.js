(function () {
  'use strict';

  const DEV_API_BASE_URL = 'http://localhost:3000/api';
  const PROD_API_BASE_URL = '__PULSE_API_BASE_URL__';

  function resolveApiBaseUrl() {
    if (window.PULSE_API_BASE) {
      return String(window.PULSE_API_BASE).trim();
    }

    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '';

    if (isLocalhost) {
      return DEV_API_BASE_URL;
    }

    if (PROD_API_BASE_URL && !PROD_API_BASE_URL.includes('__')) {
      return PROD_API_BASE_URL;
    }

    console.error(
      '[PulseConfig] URL da API nao configurada. Defina window.PULSE_API_BASE antes de api.js ' +
        'ou substitua __PULSE_API_BASE_URL__ no build de producao.'
    );

    return '';
  }

  window.PulseConfig = {
    apiBaseUrl: resolveApiBaseUrl()
  };

  window.PULSE_API_BASE = window.PulseConfig.apiBaseUrl;
})();
