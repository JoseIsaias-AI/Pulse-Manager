(function () {
  'use strict';

  /* ── VIEWS ────────────────────────────────────────────────── */
  const VIEWS = ['inicio', 'alunos', 'dashboard', 'agenda'];
  const chartInited = { inicio: false, alunos: false, dashboard: false, agenda: false };

  function showView(id) {
    // Esconde todas as views
    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = 'none';
    });

    // Exibe a view alvo
    const target = document.getElementById('view-' + id);
    if (!target) return;
    target.style.display = 'flex';

    // Inicializa gráficos na primeira exibição (só para views com gráficos)
    if (!chartInited[id]) {
      chartInited[id] = true;
      if (id === 'inicio')    initInicioView();
      if (id === 'dashboard') initDashboardView();
    }
  }

  /* ── MODAL EQUIPE (abertura via perfil do rodapé) ────────── */
  function openEquipeModal() {
    const overlay = document.getElementById('overlay');
    const main    = document.getElementById('main-content');
    if (overlay) overlay.classList.add('open');
    if (main)    main.classList.add('blurred');
  }

  /* Torna o bloco de usuário no rodapé clicável */
  document.addEventListener('DOMContentLoaded', function () {
    const userBlock = document.querySelector('.menuLateral__user');
    if (userBlock) {
      userBlock.style.cursor = 'pointer';
      userBlock.title = 'Ver equipe';
      userBlock.addEventListener('click', openEquipeModal);
    }
  });

  /* ── ROTEADOR — hook chamado por guiaBase.js ──────────────── */
  window.__onMenuNav = function (pageId) {
    if (VIEWS.includes(pageId)) showView(pageId);
  };

  /* ── INICIALIZAR VIEW PADRÃO ──────────────────────────────── */
  showView('inicio');

  /* ════════════════════════════════════════════════════════════
     VIEW: INÍCIO (inicioGestor)
  ════════════════════════════════════════════════════════════ */
  function initInicioView() {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size   = 11;

    /* Gráfico: Alunos por Curso */
    new Chart(document.getElementById('g-barChart'), {
      type: 'bar',
      data: {
        labels: ['Let. Digital', 'Ferramentas Prod.', 'AI-First',
                 'Fort. Emocional', 'Autogestão', 'Mercado Trab.', 'Lab. Mentoria'],
        datasets: [{
          data: [42, 38, 35, 28, 20, 12, 6],
          backgroundColor: ['#003870','#33B458','#FFD927','#003870','#33B458','#FFD927','#003870'],
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.55
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.raw} alunos` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 0, max: 50, ticks: { color: '#97A1AE', stepSize: 10 }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });

    /* Paginação de Atividades */
    const ACTIVITIES = [
      { i:'AS', bg:'#003870',              name:'Ana Silva',       desc:'concluiu o Módulo 4 - Sprint 3',   time:'Há 12 minutos', tag:'tag--green', label:'✓ Concluído'  },
      { i:'CM', bg:'#FFD927', c:'#003870', name:'Carlos Mendes',   desc:'atrasou entrega do Módulo 5',      time:'Há 38 minutos', tag:'tag--amber', label:'⚠ Em atraso'  },
      { i:'LR', bg:'#33B458',              name:'Larissa Rocha',   desc:'subiu para o Módulo 5',            time:'Há 1 hora',     tag:'tag--blue',  label:'↑ Progresso'  },
      { i:'BT', bg:'#003870',              name:'Beatriz Torres',  desc:'entregou projeto do Módulo 3',     time:'Há 3 horas',    tag:'tag--green', label:'✓ Entregue'   },
      { i:'MN', bg:'#FFD927', c:'#003870', name:'Marcos Nunes',    desc:'ausente há 3 dias consecutivos',   time:'Há 4 horas',    tag:'tag--amber', label:'⚠ Ausente'    },
      { i:'JP', bg:'#33B458',              name:'Julia Pereira',   desc:'concluiu o Módulo 3 - Sprint 2',   time:'Há 5 horas',    tag:'tag--green', label:'✓ Concluído'  },
      { i:'RO', bg:'#003870',              name:'Rafael Oliveira', desc:'iniciou o Módulo 6',               time:'Há 6 horas',    tag:'tag--blue',  label:'↑ Progresso'  },
      { i:'FS', bg:'#FFD927', c:'#003870', name:'Fernanda Santos', desc:'atrasou entrega do Módulo 4',      time:'Há 7 horas',    tag:'tag--amber', label:'⚠ Em atraso'  },
      { i:'DL', bg:'#33B458',              name:'Diego Lima',      desc:'entregou projeto do Módulo 5',     time:'Há 8 horas',    tag:'tag--green', label:'✓ Entregue'   },
      { i:'PA', bg:'#003870',              name:'Patricia Alves',  desc:'ausente há 2 dias consecutivos',   time:'Há 9 horas',    tag:'tag--amber', label:'⚠ Ausente'    },
      { i:'TM', bg:'#FFD927', c:'#003870', name:'Thiago Martins',  desc:'concluiu o Módulo 2 - Sprint 1',   time:'Há 10 horas',   tag:'tag--green', label:'✓ Concluído'  },
      { i:'CB', bg:'#33B458',              name:'Carolina Bastos', desc:'subiu para o Módulo 4',            time:'Há 11 horas',   tag:'tag--blue',  label:'↑ Progresso'  },
      { i:'MF', bg:'#003870',              name:'Miguel Fonseca',  desc:'atrasou entrega do Módulo 3',      time:'Há 12 horas',   tag:'tag--amber', label:'⚠ Em atraso'  },
      { i:'IS', bg:'#FFD927', c:'#003870', name:'Isabela Souza',   desc:'entregou projeto do Módulo 4',     time:'Ontem',         tag:'tag--green', label:'✓ Entregue'   },
      { i:'VR', bg:'#33B458',              name:'Victor Ribeiro',  desc:'iniciou o Módulo 5',               time:'Ontem',         tag:'tag--blue',  label:'↑ Progresso'  },
      { i:'GL', bg:'#003870',              name:'Gabriela Leal',   desc:'concluiu o Módulo 6 - Sprint 1',   time:'Ontem',         tag:'tag--green', label:'✓ Concluído'  },
      { i:'HN', bg:'#FFD927', c:'#003870', name:'Hugo Novaes',     desc:'ausente há 4 dias consecutivos',   time:'Ontem',         tag:'tag--amber', label:'⚠ Ausente'    },
      { i:'SM', bg:'#33B458',              name:'Sofia Moura',     desc:'subiu para o Módulo 7',            time:'Ontem',         tag:'tag--blue',  label:'↑ Progresso'  },
    ];

    const PER_PAGE = 5, TOTAL = 48;
    let curPage = 2;

    function renderActivities(page) {
      curPage = page;
      const start = (page - 1) * PER_PAGE;
      const slice = ACTIVITIES.slice(start, start + PER_PAGE);

      document.getElementById('activity-list').innerHTML = slice.map(a => `
        <div class="activity-item">
          <div class="av" style="background:${a.bg};${a.c ? 'color:'+a.c+';' : ''}">${a.i}</div>
          <div class="activity-body">
            <div class="activity-name">${a.name} <span style="font-weight:400;color:#6B7684;font-size:11px;">${a.desc}</span></div>
            <div class="activity-time">${a.time}</div>
          </div>
          <span class="tag ${a.tag}">${a.label}</span>
        </div>`).join('');

      const totalPages = Math.ceil(TOTAL / PER_PAGE);
      document.getElementById('pg-total').textContent =
        `Exibindo ${Math.min(PER_PAGE, TOTAL - start)} de ${TOTAL} atividades`;

      let startP = Math.max(1, page - 1);
      let endP   = Math.min(totalPages, startP + 2);
      if (endP - startP < 2) startP = Math.max(1, endP - 2);

      const nums = document.getElementById('pg-numbers');
      nums.innerHTML = '';
      for (let p = startP; p <= endP; p++) {
        const btn = document.createElement('button');
        btn.className = 'pg-btn pg-num' + (p === page ? ' active' : '');
        btn.textContent = p;
        btn.addEventListener('click', () => renderActivities(p));
        nums.appendChild(btn);
      }

      document.getElementById('pg-prev').disabled = page === 1;
      document.getElementById('pg-next').disabled = page >= totalPages;
    }

    document.getElementById('pg-prev').addEventListener('click', () => renderActivities(curPage - 1));
    document.getElementById('pg-next').addEventListener('click', () => renderActivities(curPage + 1));
    renderActivities(curPage);
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: DASHBOARD (dashboardGestor)
  ════════════════════════════════════════════════════════════ */
  function initDashboardView() {
    /* Alunos por Curso */
    new Chart(document.getElementById('g-barChartDash'), {
      type: 'bar',
      data: {
        labels: ['Let. Digital', 'Ferramentas Prod.', 'AI-First',
                 'Fort. Emocional', 'Autogestão', 'Mercado Trab.', 'Lab. Mentoria'],
        datasets: [{
          data: [42, 38, 35, 28, 20, 12, 6],
          backgroundColor: ['#003870','#33B458','#FFD927','#003870','#33B458','#FFD927','#003870'],
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.52
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.raw} alunos` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 0, max: 50, ticks: { color: '#97A1AE', stepSize: 10 }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });

    /* Tipo de Presença — EAD vs Presencial */
    new Chart(document.getElementById('g-presencaChart'), {
      type: 'bar',
      data: {
        labels: ['Let. Digital', 'Ferramentas Prod.', 'AI-First', 'Fort. Emocional', 'Autogestão'],
        datasets: [
          { label: 'EAD',       data: [72, 58, 65, 80, 55], backgroundColor: '#003870', borderRadius: 5, borderSkipped: false, barPercentage: 0.45 },
          { label: 'Presencial',data: [28, 42, 35, 20, 45], backgroundColor: '#33B458', borderRadius: 5, borderSkipped: false, barPercentage: 0.45 }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.raw}%` } }
        },
        scales: {
          x: { min: 0, max: 100, ticks: { color: '#97A1AE', callback: v => v + '%' }, grid: { color: '#F0F3F7' }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: '#6B7684', font: { size: 10 } }, border: { display: false },
               afterFit(s) { s.width = 120; } }
        }
      }
    });

    /* Funil de Impacto */
    new Chart(document.getElementById('g-funnelChart'), {
      type: 'bar',
      data: {
        labels: ['Conectados', 'Capacitados', 'Transformados'],
        datasets: [{
          data: [184, 142, 89],
          backgroundColor: ['#003870', '#33B458', '#FFD927'],
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.55
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.raw} alunos` } }
        },
        scales: {
          x: { min: 0, max: 220, ticks: { color: '#97A1AE', stepSize: 50 }, grid: { color: '#F0F3F7' }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: '#6B7684', font: { weight: '500', size: 11 } }, border: { display: false },
               afterFit(s) { s.width = 110; } }
        }
      }
    });
  }

})();
