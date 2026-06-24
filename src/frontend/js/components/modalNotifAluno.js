(function () {
  'use strict';

  let notificacoes = [];
  let filtroAtual = 'all';
  let carregadas = false;

  function escapar(valor) {
    return String(valor ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function iniciais(nome) {
    const partes = String(nome || 'Equipe').trim().split(/\s+/);
    return `${partes[0][0] || 'E'}${partes.length > 1 ? partes[partes.length - 1][0] : ''}`.toUpperCase();
  }

  function naoLidas() {
    return notificacoes.filter(item => item.naoLida).length;
  }

  function sincronizarContadores() {
    const quantidade = naoLidas();
    const badge = document.getElementById('bell-badge');
    if (badge) {
      badge.textContent = String(quantidade);
      badge.style.display = quantidade ? 'flex' : 'none';
    }
    const total = document.getElementById('notif-count-badge');
    if (total) total.textContent = String(notificacoes.length);
    const naoLidasEl = document.getElementById('notif-tab-unread-count');
    if (naoLidasEl) naoLidasEl.textContent = String(quantidade);
  }

  function renderizar() {
    const lista = document.getElementById('notif-list');
    if (!lista) return;
    const dados = filtroAtual === 'unread' ? notificacoes.filter(item => item.naoLida) : notificacoes;

    if (!dados.length) {
      window.PulseUiState.set(lista, 'empty', 'Nenhuma notificação por aqui ainda.', { replace: true });
      return;
    }

    window.PulseUiState.clear(lista, { replace: true });

    lista.innerHTML = dados.map(item => {
      const remetente = item.nomeRemetente || 'Equipe Pulse Mais';
      const tipo = item.tipo || 'informativo';
      return `<div class="notif-item ${item.naoLida ? 'unread' : ''}" data-id="${item.idNotificacao}">
        ${item.naoLida ? '<div class="notif-unread-dot"></div>' : ''}
        <div class="notif-av gestor">${escapar(iniciais(remetente))}</div>
        <div class="notif-body">
          <div class="notif-row1">
            <span class="notif-sender-name">${escapar(remetente)}</span>
            <span class="notif-occ gestor">${escapar(item.tipoRemetente || 'Equipe')}</span>
            <span class="notif-type evento"><i class="ti ti-bell"></i>${escapar(tipo)}</span>
          </div>
          <div class="notif-datetime"><i class="ti ti-calendar-event"></i>${escapar(item.dataEnvio || 'Data não informada')}</div>
          <div class="notif-desc"><strong>${escapar(item.titulo)}</strong><br>${escapar(item.mensagem)}</div>
        </div>
      </div>`;
    }).join('');

    lista.querySelectorAll('.notif-item').forEach(elemento => {
      elemento.addEventListener('click', function () {
        const item = notificacoes.find(n => n.idNotificacao === Number(this.dataset.id));
        if (item) item.naoLida = false;
        sincronizarContadores();
        renderizar();
      });
    });
  }

  async function carregarNotificacoes() {
    const lista = document.getElementById('notif-list');
    if (lista) window.PulseUiState.set(lista, 'loading', 'Carregando notificações...', { replace: true });
    try {
      const endpoint = window.PortalAluno.endpointAluno('/notificacoes');
      const resposta = await window.PulseApi.get(endpoint);
      notificacoes = (Array.isArray(resposta.data) ? resposta.data : []).map(item => ({ ...item, naoLida: true }));
      carregadas = true;
      sincronizarContadores();
      renderizar();
    } catch (error) {
      if (lista) window.PulseUiState.set(
        lista,
        'error',
        window.PulseUiState.messageFrom(error, 'Não foi possível carregar as notificações.'),
        { replace: true }
      );
    }
  }

  function abrir() {
    document.getElementById('notif-overlay')?.classList.add('open');
    if (!carregadas) carregarNotificacoes();
    else renderizar();
  }

  function fechar() {
    document.getElementById('notif-overlay')?.classList.remove('open');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const sino = document.querySelector('.menuSuperior__bell');
    if (sino) {
      sino.classList.add('bell-has-notif');
      const badge = document.createElement('span');
      badge.id = 'bell-badge';
      badge.className = 'bell-badge';
      badge.style.display = 'none';
      sino.appendChild(badge);
      sino.addEventListener('click', abrir);
    }

    document.getElementById('notif-close')?.addEventListener('click', fechar);
    document.getElementById('notif-overlay')?.addEventListener('click', function (event) {
      if (!document.getElementById('notif-panel')?.contains(event.target)) fechar();
    });
    document.getElementById('notif-mark-all')?.addEventListener('click', function () {
      notificacoes.forEach(item => { item.naoLida = false; });
      sincronizarContadores();
      renderizar();
    });
    document.querySelectorAll('.notif-tab').forEach(tab => tab.addEventListener('click', function () {
      document.querySelectorAll('.notif-tab').forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      filtroAtual = this.dataset.filter;
      renderizar();
    }));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') fechar(); });

    carregarNotificacoes();
  });
})();
