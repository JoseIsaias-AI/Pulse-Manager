(function () {
  'use strict';

  const STORAGE_KEY = 'pulseUiPreferences';
  const DEFAULTS = {
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

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function ensureUtilityViews() {
    const content = document.querySelector('.paginaConteudo');
    if (!content) return;
    const user = window.getPulseDisplayUser
      ? window.getPulseDisplayUser({})
      : { name: 'Usuário', role: '' };

    if (!document.getElementById('view-atualizacoes')) {
      const updates = document.createElement('section');
      updates.id = 'view-atualizacoes';
      updates.className = 'spa-view cfg-view';
      updates.innerHTML = `
        <div class="cfg-head">
          <div><h1 class="cfg-title">Atualizações</h1><p class="cfg-subtitle">Acompanhe novidades e atividades recentes da plataforma.</p></div>
          <span class="cfg-pill">Central de atividades</span>
        </div>
        <div class="cfg-grid">
          <article class="cfg-card">
            <div class="cfg-card-head"><div><h2 class="cfg-card-title">Novidades da plataforma</h2><p class="cfg-card-sub">Recursos disponíveis para o seu perfil.</p></div><i class="ti ti-bell-ringing"></i></div>
            <div class="cfg-card-body cfg-toggle-list">
              <div class="cfg-toggle-item"><div><strong class="cfg-toggle-title">Dados integrados</strong><p class="cfg-toggle-desc">Listagens e perfis refletem os dados atuais do banco.</p></div><span class="cfg-preview-chip">Ativo</span></div>
              <div class="cfg-toggle-item"><div><strong class="cfg-toggle-title">Experiência personalizada</strong><p class="cfg-toggle-desc">Nome, perfil e iniciais são carregados a partir do seu login.</p></div><span class="cfg-preview-chip">Novo</span></div>
            </div>
          </article>
          <article class="cfg-card">
            <div class="cfg-card-head"><div><h2 class="cfg-card-title">Sua sessão</h2><p class="cfg-card-sub">Informações utilizadas nesta navegação.</p></div><i class="ti ti-user-check"></i></div>
            <div class="cfg-card-body"><div class="cfg-preview"><div class="cfg-preview-top"><strong class="cfg-preview-title">${escapeHtml(user.name)}</strong><span class="cfg-preview-chip">${escapeHtml(user.role)}</span></div><p class="cfg-preview-text">As preferências ficam salvas neste navegador.</p></div></div>
          </article>
        </div>`;
      content.appendChild(updates);
    }

    if (!document.getElementById('view-configuracoes')) {
      const settings = document.createElement('section');
      settings.id = 'view-configuracoes';
      settings.className = 'spa-view cfg-view';
      settings.innerHTML = `
        <div class="cfg-head">
          <div><h1 class="cfg-title">Configurações</h1><p class="cfg-subtitle">Personalize a aparência e as notificações da sua experiência.</p></div>
          <span class="cfg-pill">Preferências locais</span>
        </div>
        <div class="cfg-grid">
          <article class="cfg-card">
            <div class="cfg-card-head"><div><h2 class="cfg-card-title">Aparência</h2><p class="cfg-card-sub">Escolha tema e densidade.</p></div><i class="ti ti-palette"></i></div>
            <div class="cfg-card-body">
              <span class="cfg-section-label">Tema</span>
              <div class="cfg-choice-row">
                <button type="button" class="cfg-choice" data-cfg-option="theme" data-cfg-value="classic"><span class="cfg-dot" style="background:#003870"></span>Clássico</button>
                <button type="button" class="cfg-choice" data-cfg-option="theme" data-cfg-value="green"><span class="cfg-dot" style="background:#278545"></span>Verde</button>
                <button type="button" class="cfg-choice" data-cfg-option="theme" data-cfg-value="amber"><span class="cfg-dot" style="background:#D4860A"></span>Âmbar</button>
                <button type="button" class="cfg-choice" data-cfg-option="theme" data-cfg-value="indigo"><span class="cfg-dot" style="background:#4F46E5"></span>Índigo</button>
              </div>
              <span class="cfg-section-label">Layout</span>
              <div class="cfg-choice-row">
                <button type="button" class="cfg-choice" data-cfg-option="density" data-cfg-value="comfortable">Confortável</button>
                <button type="button" class="cfg-choice" data-cfg-option="density" data-cfg-value="compact">Compacto</button>
                <button type="button" class="cfg-choice" data-cfg-option="font" data-cfg-value="normal">Texto padrão</button>
                <button type="button" class="cfg-choice" data-cfg-option="font" data-cfg-value="large">Texto ampliado</button>
              </div>
            </div>
          </article>
          <article class="cfg-card">
            <div class="cfg-card-head"><div><h2 class="cfg-card-title">Notificações e acessibilidade</h2><p class="cfg-card-sub">Controle avisos e movimentos da interface.</p></div><i class="ti ti-adjustments"></i></div>
            <div class="cfg-card-body">
              <div class="cfg-toggle-list">
                <label class="cfg-toggle-item"><span><strong class="cfg-toggle-title">Notificações no navegador</strong><small class="cfg-toggle-desc">Exibir avisos com a plataforma aberta.</small></span><span class="cfg-switch"><input type="checkbox" data-cfg-switch="browser"><span class="cfg-slider"></span></span></label>
                <label class="cfg-toggle-item"><span><strong class="cfg-toggle-title">Notificações por e-mail</strong><small class="cfg-toggle-desc">Receber comunicados no e-mail cadastrado.</small></span><span class="cfg-switch"><input type="checkbox" data-cfg-switch="email"><span class="cfg-slider"></span></span></label>
                <label class="cfg-toggle-item"><span><strong class="cfg-toggle-title">Reduzir movimento</strong><small class="cfg-toggle-desc">Diminuir animações e transições.</small></span><span class="cfg-switch"><input type="checkbox" data-cfg-switch="reduceMotion"><span class="cfg-slider"></span></span></label>
              </div>
              <div class="cfg-actions"><button type="button" class="cfg-btn cfg-btn-ghost" data-cfg-reset><i class="ti ti-restore"></i>Restaurar padrões</button></div>
            </div>
          </article>
        </div>`;
      content.appendChild(settings);
    }
  }

  function readPrefs() {
    try {
      const prefs = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
      delete prefs.mode;
      return prefs;
    } catch (_) {
      return { ...DEFAULTS };
    }
  }

  function savePrefs(prefs) {
    const normalized = { ...prefs };
    delete normalized.mode;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }

  function applyPrefs(prefs) {
    document.body.classList.remove(
      'pulse-theme-classic',
      'pulse-theme-green',
      'pulse-theme-amber',
      'pulse-theme-indigo',
      'pulse-density-compact',
      'pulse-font-large',
      'pulse-contrast-high',
      'pulse-shape-soft',
      'pulse-shape-square',
      'pulse-reduce-motion'
    );
    document.body.classList.add('pulse-theme-' + prefs.theme);
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

  ensureUtilityViews();

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
