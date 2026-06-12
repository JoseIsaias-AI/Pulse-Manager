(function () {
  'use strict';

  /* ── Dados de notificações ──────────────────────────────────
     Cada objeto representa uma notificação recebida pelo aluno.
     Campos:
       sender     → nome de quem enviou
       initials   → iniciais para o avatar
       occupation → 'psicologo' | 'gestor'  (define cor do avatar e badge)
       occLabel   → rótulo legível da ocupação
       type       → 'evento' | 'consulta' | 'aula' | 'mentoria'
       typeLabel  → rótulo legível do tipo
       typeIcon   → ícone Tabler do tipo
       date       → data formatada (ex: "Seg, 28 Abr")
       time       → hora (ex: "14:30")
       desc       → descrição da atividade
       timeAgo    → tempo relativo desde a notificação
       unread     → true = não lida (mostra ponto azul + fundo azul claro)
  ─────────────────────────────────────────────────────────── */
  /* Notificações alinhadas com os eventos da Agenda de Junho 2026.
     Lidas  = eventos já ocorridos (antes de hoje, 11 Jun).
     Não lidas = eventos de hoje ou futuros.                        */
  const NOTIFICATIONS = [
    {
      id: 1,
      sender:     'Vitória Brandão',
      initials:   'VB',
      occupation: 'gestor',
      occLabel:   'Gestor',
      type:       'aula',
      typeLabel:  'Aula',
      typeIcon:   'ti-book',
      date:       'Seg, 01 Jun',
      time:       '09:00',
      desc:       'Módulo 1 — Intro ao Digital. Participação obrigatória.',
      timeAgo:    'Há 10 dias',
      unread:     false,
    },
    {
      id: 2,
      sender:     'João Mário',
      initials:   'JM',
      occupation: 'psicologo',
      occLabel:   'Psicólogo',
      type:       'mentoria',
      typeLabel:  'Mentoria',
      typeIcon:   'ti-users',
      date:       'Qua, 03 Jun',
      time:       '14:00',
      desc:       'Sessão de mentoria coletiva com foco em autoconhecimento.',
      timeAgo:    'Há 8 dias',
      unread:     false,
    },
    {
      id: 3,
      sender:     'Vitória Brandão',
      initials:   'VB',
      occupation: 'gestor',
      occLabel:   'Gestor',
      type:       'evento',
      typeLabel:  'Evento',
      typeIcon:   'ti-star',
      date:       'Qua, 10 Jun',
      time:       '18:00',
      desc:       'Encontro com empresas parceiras. Traje social recomendado.',
      timeAgo:    'Há 1 dia',
      unread:     false,
    },
    {
      id: 4,
      sender:     'João Mário',
      initials:   'JM',
      occupation: 'psicologo',
      occLabel:   'Psicólogo',
      type:       'mentoria',
      typeLabel:  'Mentoria',
      typeIcon:   'ti-users',
      date:       'Qui, 11 Jun',
      time:       '11:00',
      desc:       'Sessão com foco no plano de carreira do aluno.',
      timeAgo:    'Hoje',
      unread:     true,
    },
    {
      id: 5,
      sender:     'Vitória Brandão',
      initials:   'VB',
      occupation: 'gestor',
      occLabel:   'Gestor',
      type:       'aula',
      typeLabel:  'Aula',
      typeIcon:   'ti-book',
      date:       'Seg, 15 Jun',
      time:       '09:00',
      desc:       'Módulo 3 — Prompt Engineering e IA aplicada.',
      timeAgo:    'Em 4 dias',
      unread:     true,
    },
    {
      id: 6,
      sender:     'João Mário',
      initials:   'JM',
      occupation: 'psicologo',
      occLabel:   'Psicólogo',
      type:       'consulta',
      typeLabel:  'Consulta',
      typeIcon:   'ti-stethoscope',
      date:       'Qua, 17 Jun',
      time:       '14:30',
      desc:       'Acompanhamento de bem-estar emocional.',
      timeAgo:    'Em 6 dias',
      unread:     true,
    },
  ];

  /* ── Estado interno ──────────────────────────────────────── */
  let currentFilter = 'all';

  /* ── Helpers ─────────────────────────────────────────────── */
  function getFiltered() {
    return currentFilter === 'unread'
      ? NOTIFICATIONS.filter(n => n.unread)
      : NOTIFICATIONS;
  }

  function unreadCount() {
    return NOTIFICATIONS.filter(n => n.unread).length;
  }

  /* ── Renderizar lista ────────────────────────────────────── */
  function renderList() {
    const list = document.getElementById('notif-list');
    if (!list) return;

    const data = getFiltered();

    if (data.length === 0) {
      list.innerHTML = `
        <div class="notif-empty">
          <i class="ti ti-bell-off"></i>
          <p>Nenhuma notificação<br>por aqui ainda</p>
        </div>`;
      return;
    }

    list.innerHTML = data.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
        ${n.unread ? '<div class="notif-unread-dot"></div>' : ''}

        <div class="notif-av ${n.occupation}">${n.initials}</div>

        <div class="notif-body">
          <!-- linha 1: nome · ocupação · tipo -->
          <div class="notif-row1">
            <span class="notif-sender-name">${n.sender}</span>
            <span class="notif-occ ${n.occupation}">${n.occLabel}</span>
            <span class="notif-type ${n.type}">
              <i class="ti ${n.typeIcon}"></i>${n.typeLabel}
            </span>
          </div>

          <!-- data e hora -->
          <div class="notif-datetime">
            <i class="ti ti-calendar-event"></i>${n.date}
            <span class="notif-sep">·</span>
            <i class="ti ti-clock"></i>${n.time}
          </div>

          <!-- descrição -->
          <div class="notif-desc">${n.desc}</div>

          <!-- tempo relativo -->
          <div class="notif-meta">
            <span class="notif-time-ago">${n.timeAgo}</span>
          </div>
        </div>
      </div>
    `).join('');

    /* Clicar no item marca como lida */
    list.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', function () {
        const id   = parseInt(this.dataset.id);
        const notif = NOTIFICATIONS.find(n => n.id === id);
        if (notif && notif.unread) {
          notif.unread = false;
          syncBellBadge();
          updateTabCounts();
          renderList();
        }
      });
    });
  }

  /* ── Sincronizar badges ──────────────────────────────────── */
  function syncBellBadge() {
    const badge   = document.getElementById('bell-badge');
    const count   = unreadCount();
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function updateTabCounts() {
    const panelCount = document.getElementById('notif-count-badge');
    const unreadSpan = document.getElementById('notif-tab-unread-count');
    const total      = NOTIFICATIONS.length;
    const unread     = unreadCount();
    if (panelCount) panelCount.textContent = total;
    if (unreadSpan) unreadSpan.textContent  = unread;
  }

  /* ── Abrir / Fechar painel ───────────────────────────────── */
  function openNotif() {
    const overlay = document.getElementById('notif-overlay');
    if (overlay) overlay.classList.add('open');
    renderList();
  }

  function closeNotif() {
    const overlay = document.getElementById('notif-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  /* ── Inicialização após DOM ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Botão do sino → abre painel */
    const bellBtn = document.querySelector('.menuSuperior__bell');
    if (bellBtn) {
      bellBtn.classList.add('bell-has-notif');

      /* Badge vermelho de não lidas */
      const badge = document.createElement('span');
      badge.id = 'bell-badge';
      badge.className = 'bell-badge';
      badge.textContent = unreadCount();
      badge.style.display = unreadCount() > 0 ? 'flex' : 'none';
      bellBtn.appendChild(badge);

      bellBtn.addEventListener('click', openNotif);
    }

    /* Fechar ao clicar no backdrop (fora do painel) */
    const overlay = document.getElementById('notif-overlay');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        const panel = document.getElementById('notif-panel');
        if (panel && !panel.contains(e.target)) closeNotif();
      });
    }

    /* Botão fechar dentro do painel */
    const closeBtn = document.getElementById('notif-close');
    if (closeBtn) closeBtn.addEventListener('click', closeNotif);

    /* Marcar todas como lidas */
    const markAllBtn = document.getElementById('notif-mark-all');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', function () {
        NOTIFICATIONS.forEach(n => { n.unread = false; });
        syncBellBadge();
        updateTabCounts();
        renderList();
      });
    }

    /* Tabs de filtro */
    document.querySelectorAll('.notif-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderList();
      });
    });

    /* Fechar com ESC */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeNotif();
    });

    /* Contagens iniciais */
    updateTabCounts();
  });

})();
