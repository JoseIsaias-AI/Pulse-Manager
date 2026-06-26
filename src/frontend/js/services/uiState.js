(function () {
  'use strict';

  const VALID_STATES = new Set(['loading', 'success', 'error', 'empty']);
  const DEFAULT_MESSAGES = {
    loading: 'Carregando...',
    success: 'Operação concluída com sucesso.',
    error: 'Não foi possível concluir a operação.',
    empty: 'Nenhum registro encontrado.'
  };
  const ICONS = {
    loading: 'ti-loader-2',
    success: 'ti-circle-check',
    error: 'ti-alert-circle',
    empty: 'ti-inbox'
  };

  function resolveTarget(target) {
    return typeof target === 'string' ? document.querySelector(target) : target;
  }

  function normalizeState(state) {
    return VALID_STATES.has(state) ? state : 'error';
  }

  function createContent(state, message) {
    const content = document.createElement('span');
    content.className = 'pulse-ui-state__content';
    const icon = document.createElement('i');
    icon.className = `ti ${ICONS[state]}${state === 'loading' ? ' pulse-ui-state__spinner' : ''}`;
    icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.textContent = message;
    content.append(icon, text);
    return content;
  }

  function set(target, state, message, options) {
    const element = resolveTarget(target);
    if (!element) return null;
    const normalizedState = normalizeState(state);
    const finalMessage = String(message || DEFAULT_MESSAGES[normalizedState]);
    const replace = Boolean(options && options.replace);

    element.hidden = false;
    element.setAttribute('role', normalizedState === 'error' ? 'alert' : 'status');
    element.setAttribute('aria-live', normalizedState === 'error' ? 'assertive' : 'polite');

    if (replace) {
      element.replaceChildren(createContent(normalizedState, finalMessage));
      element.classList.add('pulse-ui-state-host');
      element.dataset.pulseUiState = normalizedState;
      return element;
    }

    element.className = `${options?.baseClass || ''} pulse-ui-state pulse-ui-state--${normalizedState}`.trim();
    element.replaceChildren(createContent(normalizedState, finalMessage));
    element.dataset.pulseUiState = normalizedState;
    return element;
  }

  function clear(target, options) {
    const element = resolveTarget(target);
    if (!element) return;
    delete element.dataset.pulseUiState;
    element.removeAttribute('aria-live');
    if (options && options.replace) {
      element.replaceChildren();
      element.classList.remove('pulse-ui-state-host');
    } else {
      element.hidden = true;
      element.replaceChildren();
    }
  }

  function messageFrom(error, fallback) {
    return error && typeof error.message === 'string' && error.message.trim()
      ? error.message.trim()
      : fallback || DEFAULT_MESSAGES.error;
  }

  function isEmpty(value) {
    if (Array.isArray(value) || typeof value === 'string') return value.length === 0;
    if (value && typeof value === 'object') return Object.keys(value).length === 0;
    return value === null || value === undefined;
  }

  function installStyles() {
    if (document.getElementById('pulse-ui-state-styles')) return;
    const style = document.createElement('style');
    style.id = 'pulse-ui-state-styles';
    style.textContent = `
      .pulse-ui-state{display:flex;align-items:center;min-height:34px;padding:8px 10px;border-radius:8px;font-size:12px}
      .pulse-ui-state[hidden]{display:none}
      .pulse-ui-state__content{display:flex;align-items:center;justify-content:center;gap:7px;width:100%}
      .pulse-ui-state--loading{color:#335b83;background:#edf3f9}
      .pulse-ui-state--success{color:#1d7a36;background:#edf9f0}
      .pulse-ui-state--error{color:#b42318;background:#fff1f0}
      .pulse-ui-state--empty{color:#6b7684;background:#f5f7f9}
      .pulse-ui-state-host[data-pulse-ui-state]{display:flex;align-items:center;justify-content:center;min-height:76px;color:#6b7684}
      .pulse-ui-state-host[data-pulse-ui-state="error"]{color:#b42318}
      .pulse-ui-state-host[data-pulse-ui-state="success"]{color:#1d7a36}
      .pulse-ui-state__spinner{animation:pulse-ui-spin .8s linear infinite}
      @keyframes pulse-ui-spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);
  }

  installStyles();
  window.PulseUiState = { set, clear, messageFrom, isEmpty };
})();
