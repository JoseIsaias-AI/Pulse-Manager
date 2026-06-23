(function () {
  'use strict';

  const STORAGE_KEY = 'pulseUiPreferences';
  const DEFAULTS = {
    mode: 'light',
    theme: 'classic',
    density: 'comfortable',
    font: 'normal',
    contrast: 'normal',
    shape: 'rounded',
    email: true,
    browser: true,
    digest: false,
    reduceMotion: false
  };

  function readPrefs() {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch (_) {
      return { ...DEFAULTS };
    }
  }

  function savePrefs(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }

  function applyPrefs(prefs) {
    document.body.classList.remove(
      'pulse-theme-classic',
      'pulse-theme-green',
      'pulse-theme-amber',
      'pulse-theme-indigo',
      'pulse-mode-light',
      'pulse-mode-dark',
      'pulse-density-compact',
      'pulse-font-large',
      'pulse-contrast-high',
      'pulse-shape-soft',
      'pulse-shape-square',
      'pulse-reduce-motion'
    );
    document.body.classList.add('pulse-theme-' + prefs.theme);
    document.body.classList.add('pulse-mode-' + prefs.mode);
    if (prefs.density === 'compact') document.body.classList.add('pulse-density-compact');
    if (prefs.font === 'large') document.body.classList.add('pulse-font-large');
    if (prefs.contrast === 'high') document.body.classList.add('pulse-contrast-high');
    if (prefs.shape === 'soft') document.body.classList.add('pulse-shape-soft');
    if (prefs.shape === 'square') document.body.classList.add('pulse-shape-square');
    if (prefs.reduceMotion) document.body.classList.add('pulse-reduce-motion');
  }

  function setActiveButtons(prefs) {
    document.querySelectorAll('[data-cfg-option]').forEach((button) => {
      const key = button.dataset.cfgOption;
      button.classList.toggle('is-active', String(prefs[key]) === button.dataset.cfgValue);
    });
  }

  function setSwitches(prefs) {
    document.querySelectorAll('[data-cfg-switch]').forEach((input) => {
      input.checked = Boolean(prefs[input.dataset.cfgSwitch]);
    });
  }

  function showToast(message) {
    let toast = document.querySelector('.cfg-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cfg-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<i class="ti ti-circle-check"></i> ' + message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function refreshUi(prefs) {
    applyPrefs(prefs);
    setActiveButtons(prefs);
    setSwitches(prefs);
  }

  function setPrefs(nextValues, notify) {
    const prefs = { ...readPrefs(), ...nextValues };
    savePrefs(prefs);
    refreshUi(prefs);
    if (notify) showToast('Preferências atualizadas');
  }

  function bindSettingsFooter() {
    document.querySelectorAll('.menuLateral__settings').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof window.__onMenuNav === 'function') {
          window.__onMenuNav('configuracoes');
          document.querySelectorAll('.menuLateral__item').forEach((item) => {
            item.classList.toggle('menuLateral__item--active', item.dataset.page === 'configuracoes');
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    refreshUi(readPrefs());
    bindSettingsFooter();

    document.querySelectorAll('[data-cfg-option]').forEach((button) => {
      button.addEventListener('click', () => {
        setPrefs({ [button.dataset.cfgOption]: button.dataset.cfgValue }, true);
      });
    });

    document.querySelectorAll('[data-cfg-switch]').forEach((input) => {
      input.addEventListener('change', () => {
        setPrefs({ [input.dataset.cfgSwitch]: input.checked }, true);
      });
    });

    document.querySelectorAll('[data-cfg-reset]').forEach((button) => {
      button.addEventListener('click', () => {
        savePrefs({ ...DEFAULTS });
        refreshUi({ ...DEFAULTS });
        showToast('Preferências restauradas');
      });
    });
  });
})();
