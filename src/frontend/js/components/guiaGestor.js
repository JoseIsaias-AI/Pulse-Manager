(function () {
  'use strict'; // ativa modo estrito para o conjunto de telas do Gestor

  // ---- Role label ----
  document.querySelectorAll('.menuLateral__logo-role')
    .forEach(el => { el.textContent = pulseConfig.role; });

  // ---- Menu Principal ----
  const menuList = document.querySelector('.menuLateral__menu');

  menuList.innerHTML = pulseConfig.menu.map(item => `
    <li class="menuLateral__item" data-page="${item.id}">
      <a href="#" class="menuLateral__link">
        <i class="ti ${item.icon} menuLateral__icon"></i>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');

  // ---- Perfil ----
  document.querySelector('.menuLateral__avatar').textContent    = pulseConfig.user.initials;
  document.querySelector('.menuLateral__user-name').textContent = pulseConfig.user.name;
  document.querySelector('.menuLateral__user-role').textContent = pulseConfig.user.role;

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
