(function () {
  'use strict'; // ativa modo estrito: evita erros silenciosos e variáveis globais acidentais

  // ---- Role label ----
  // Seleciona todos os elementos com a classe do papel (pode haver mais de um)
  // e substitui o texto pelo valor definido em config.js → pulseConfig.role
  document.querySelectorAll('.menuLateral__logo-role')
    .forEach(el => { el.textContent = pulseConfig.role; });

  // ---- Menu Principal ----
  // Seleciona a <ul> vazia do menu no HTML
  const menuList = document.querySelector('.menuLateral__menu');

  // Transforma o array pulseConfig.menu em uma string de <li> e injeta no HTML
  // map() percorre cada item e retorna o HTML do <li> correspondente
  // join('') une todos os <li> sem separador entre eles
  menuList.innerHTML = pulseConfig.menu.map(item => `
    <li class="menuLateral__item" data-page="${item.id}">
      <a href="#" class="menuLateral__link">
        <i class="ti ${item.icon} menuLateral__icon"></i>
        <span>${item.label}</span>
      </a>
    </li>
  `).join('');

  // ---- Perfil ----
  // Preenche as iniciais do avatar circular com o valor de pulseConfig.user.initials
  document.querySelector('.menuLateral__avatar').textContent    = pulseConfig.user.initials;

  // Preenche o nome completo do usuário
  document.querySelector('.menuLateral__user-name').textContent = pulseConfig.user.name;

  // Preenche o cargo exibido abaixo do nome no rodapé
  document.querySelector('.menuLateral__user-role').textContent = pulseConfig.user.role;

  // ---- Estado ativo ao clicar ----
  function bindMenuClicks() {
    // Seleciona todos os itens do menu após serem gerados dinamicamente
    const items = document.querySelectorAll('.menuLateral__item[data-page]');

    items.forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault(); // impede o redirecionamento padrão do link

        // Remove o destaque de todos os itens
        items.forEach(i => i.classList.remove('menuLateral__item--active'));

        // Adiciona o destaque somente no item clicado
        this.classList.add('menuLateral__item--active');

        // Notifica o roteador SPA, se existir
        if (typeof window.__onMenuNav === 'function') {
          window.__onMenuNav(this.dataset.page, this);
        }
      });
    });
  }

  // Chama a função para registrar os eventos de clique nos itens do menu
  bindMenuClicks();

  // ---- Item ativo padrão ao carregar a página ----
  // Marca o primeiro item do menu como ativo automaticamente no carregamento
  const firstItem = menuList.querySelector('.menuLateral__item[data-page]');
  if (firstItem) {
    firstItem.classList.add('menuLateral__item--active');
  }

})(); // a função é executada imediatamente para não poluir o escopo global
