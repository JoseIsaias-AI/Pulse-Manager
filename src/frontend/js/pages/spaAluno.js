(function () {
  'use strict';

  /* ── VIEWS ────────────────────────────────────────────────── */
  const VIEWS = ['inicio', 'dashboard', 'agenda'];
  const chartInited = { inicio: false, dashboard: false, agenda: false };

  function showView(id) {
    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = 'none';
    });

    const target = document.getElementById('view-' + id);
    if (!target) return;
    target.style.display = 'flex';

    if (!chartInited[id]) {
      chartInited[id] = true;
      if (id === 'dashboard') initDashboardView();
    }
  }

  /* ── MODAL ALUNO (abertura via perfil do rodapé) ──────────── */
  function openAlunoModal() {
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
      userBlock.title = 'Ver perfil';
      userBlock.addEventListener('click', openAlunoModal);
    }
  });

  /* ── ROTEADOR ─────────────────────────────────────────────── */
  window.__onMenuNav = function (pageId) {
    if (VIEWS.includes(pageId)) showView(pageId);
  };

  /* ── VIEW PADRÃO ──────────────────────────────────────────── */
  showView('inicio');

  /* ════════════════════════════════════════════════════════════
     VIEW: DASHBOARD (dashboardAluno)
  ════════════════════════════════════════════════════════════ */
  function initDashboardView() {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size   = 11;

    /* BAR CHART — Presenças por Bimestre */
    new Chart(document.getElementById('a-barChart'), {
      type: 'bar',
      data: {
        labels: ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'],
        datasets: [
          {
            type: 'bar',
            data: [92, 88, 81, 95],
            backgroundColor: ['#003870', '#33B458', '#FFD927', '#003870'],
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.52,
            order: 2
          },
          {
            type: 'line',
            label: 'Meta (85%)',
            data: [85, 85, 85, 85],
            borderColor: '#C2CAD4',
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 1
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}%` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 60, max: 100, ticks: { color: '#97A1AE', stepSize: 10, callback: v => v + '%' }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });

    /* LINE CHART — Evolução por Módulo */
    const lCtx = document.getElementById('a-lineChart').getContext('2d');
    const grad = lCtx.createLinearGradient(0, 0, 0, 272);
    grad.addColorStop(0, 'rgba(0,56,112,.14)');
    grad.addColorStop(1, 'rgba(0,56,112,0)');

    new Chart(lCtx, {
      type: 'line',
      data: {
        labels: ['Intro. Digital', 'Seg. Online', 'Ferramentas', 'Noções Dig.', 'Ger. Arquivos'],
        datasets: [
          {
            label: 'Nota média',
            data: [9.2, 8.5, 8.1, 7.8, 7.4],
            borderColor: '#003870', backgroundColor: grad,
            fill: true, tension: 0.4,
            pointBackgroundColor: '#003870', pointRadius: 4, pointHoverRadius: 6,
            borderWidth: 2.5, order: 2
          },
          {
            label: 'Frequência',
            data: [9.0, 8.8, 8.7, 8.6, 8.5],
            borderColor: '#97A1AE', backgroundColor: 'transparent',
            fill: false, tension: 0.4,
            pointBackgroundColor: '#fff', pointBorderColor: '#97A1AE',
            pointBorderWidth: 1.5, pointRadius: 4,
            borderDash: [5, 4], borderWidth: 1.5, order: 3
          },
          {
            label: 'Meta (7,0)',
            data: Array(5).fill(7.0),
            borderColor: '#DEE3EA', borderDash: [6, 4],
            borderWidth: 1.5, pointRadius: 0,
            fill: false, tension: 0, order: 1
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 0, max: 10, ticks: { color: '#97A1AE', stepSize: 2 }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });
  }

})();
