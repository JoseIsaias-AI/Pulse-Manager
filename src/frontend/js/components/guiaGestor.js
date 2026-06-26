(function () {
  'use strict'; // ativa modo estrito para o conjunto de telas do Gestor

  const displayUser = window.getPulseDisplayUser
    ? window.getPulseDisplayUser(pulseConfig.user)
    : pulseConfig.user;

  // ---- Role label ----
  document.querySelectorAll('.menuLateral__logo-role')
    .forEach(el => { el.textContent = displayUser.role || pulseConfig.role; });

  // ---- Menu Principal ----
  const menuList = document.querySelector('.menuLateral__menu');
  const sidebar = document.querySelector('.menuLateral');

  function setupSidebarToggle() {
    if (!sidebar || sidebar.querySelector('.menuLateral__toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menuLateral__toggle';
    button.setAttribute('aria-label', 'Reduzir menu lateral');
    button.innerHTML = '<i class="ti ti-layout-sidebar-left-collapse"></i><span>Reduzir</span>';
    const logo = sidebar.querySelector('.menuLateral__logo');
    if (logo) logo.appendChild(button);

    const applyState = (collapsed) => {
      document.body.classList.toggle('sidebar-collapsed', collapsed);
      button.setAttribute('aria-label', collapsed ? 'Expandir menu lateral' : 'Reduzir menu lateral');
      button.innerHTML = collapsed
        ? '<i class="ti ti-layout-sidebar-left-expand"></i><span>Expandir</span>'
        : '<i class="ti ti-layout-sidebar-left-collapse"></i><span>Reduzir</span>';
      localStorage.setItem('pulseSidebarCollapsed', collapsed ? '1' : '0');
    };

    applyState(localStorage.getItem('pulseSidebarCollapsed') === '1');
    button.addEventListener('click', () => {
      applyState(!document.body.classList.contains('sidebar-collapsed'));
    });
  }

  menuList.innerHTML = pulseConfig.menu.filter(item => item.id !== 'configuracoes').map(item => `
    <li class="menuLateral__item" data-page="${item.id}">
      <a href="#" class="menuLateral__link">
        <i class="ti ${item.icon} menuLateral__icon"></i>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');

  setupSidebarToggle();

  // ---- Perfil ----
  document.querySelector('.menuLateral__avatar').textContent    = displayUser.initials;
  document.querySelector('.menuLateral__user-name').textContent = displayUser.name;
  document.querySelector('.menuLateral__user-role').textContent = displayUser.role;

  // ---- Estado ativo ao clicar ----
  function bindMenuClicks() {
    const items = document.querySelectorAll('.menuLateral__item[data-page]');

    items.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();

        items.forEach(i => i.classList.remove('menuLateral__item--active'));
        this.classList.add('menuLateral__item--active');

        // Notifica o roteador SPA do Gestor, se existir
        if (typeof window.__onMenuNav === 'function') {
          window.__onMenuNav(this.dataset.page, this);
        }
      });
    });
  }

  bindMenuClicks();

  // ---- Item ativo padrão ao carregar ----
  const firstItem = menuList.querySelector('.menuLateral__item[data-page]');
  if (firstItem) {
    firstItem.classList.add('menuLateral__item--active');
  }

})();
