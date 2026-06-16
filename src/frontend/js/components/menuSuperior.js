(function () {
  'use strict'; // ativa o modo estrito para evitar erros silenciosos

  // Seleciona o elemento que exibe a trilha de navegação (ex: "Início /")
  const breadcrumbEl = document.querySelector('.menuSuperior__breadcrumb');

  // Seleciona o botão de avatar no canto superior direito
  const avatarBtn = document.querySelector('.menuSuperior__avatar-btn');

  // ---- Função auxiliar: lê o label do item ativo no menu lateral ----
  // Procura o item com a classe --active e retorna o texto do seu <span>
  // Se nenhum item estiver ativo, retorna null
  function getLabelAtivo() {
    const itemAtivo = document.querySelector('.menuLateral__item--active span');
    return itemAtivo ? itemAtivo.textContent.trim() : null;
  }

  // ---- Função auxiliar: atualiza o breadcrumb ----
  function atualizarBreadcrumb(texto) {
    if (breadcrumbEl) {
      breadcrumbEl.textContent = texto || '';
    }
  }

  // ---- Breadcrumb inicial ----
  // Tenta ler o item já marcado como ativo pelo guiaBase.js
  // Se não encontrar, usa o valor padrão de pulseConfig.topBar.breadcrumb
  const labelInicial = getLabelAtivo() || (pulseConfig.topBar && pulseConfig.topBar.breadcrumb);
  atualizarBreadcrumb(labelInicial || 'Início');

  // ---- Avatar ----
  // Preenche as iniciais do usuário (definidas em pulseConfig.user.initials)
  if (avatarBtn && pulseConfig.user) {
    avatarBtn.textContent = pulseConfig.user.initials;
    avatarBtn.setAttribute('aria-label', 'Abrir perfil');

    // Aplica a cor de fundo definida em pulseConfig.topBar.avatarColor
    if (pulseConfig.topBar && pulseConfig.topBar.avatarColor) {
      avatarBtn.style.background = pulseConfig.topBar.avatarColor;
    }

    avatarBtn.addEventListener('click', function () {
      if (typeof window.openModal === 'function') {
        window.openModal();
        return;
      }

      const footerProfile = document.querySelector('.menuLateral__user');
      if (footerProfile) footerProfile.click();
    });
  }

  // ---- Atualização do breadcrumb ao clicar no menu lateral ----
  // Escuta todos os cliques na página e filtra apenas os que vieram de um item do menu
  document.addEventListener('click', function (e) {
    // Verifica se o clique veio de dentro de um <li> do menu lateral
    const item = e.target.closest('.menuLateral__item[data-page]');

    if (item) {
      // Pega o texto do <span> do item clicado (ex: "Alunos", "Dashboard")
      const labelEl = item.querySelector('span');

      if (labelEl) {
        // Atualiza o breadcrumb com o nome da nova página selecionada
        atualizarBreadcrumb(labelEl.textContent.trim());
      }
    }
  });

})(); // função auto-executável para não poluir o escopo global
