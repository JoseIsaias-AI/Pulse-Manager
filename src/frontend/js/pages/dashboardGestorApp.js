(function () {
  'use strict';

  let initialized = false;
  const COLORS = ['#003870', '#33B458', '#FFD927', '#7B4FD9', '#F4A261', '#0E7490'];

  function api() {
    if (!window.PulseApi) throw new Error('Cliente HTTP nao carregado.');
    return window.PulseApi;
  }

  function setText(element, value) {
    if (element) element.textContent = value;
  }

  function hideUnsupportedBlocks(root) {
    root.querySelectorAll('.funnel-row .fc-num').forEach((value) => { value.textContent = '—'; });
    root.querySelector('.funnel-row .funnel-card:nth-child(4)')?.setAttribute('hidden', '');
    root.querySelector('.breakdown-row')?.setAttribute('hidden', '');
    root.querySelector('.impact-row')?.setAttribute('hidden', '');
    root.querySelector('.div-title')?.setAttribute('hidden', '');
    root.querySelector('.div-grid')?.setAttribute('hidden', '');
    root.querySelector('.results-banner')?.setAttribute('hidden', '');
    const sectionLabels = root.querySelectorAll('.dsec-label');
    if (sectionLabels[0]) sectionLabels[0].textContent = 'Indicadores por programa';
    if (sectionLabels[1]) sectionLabels[1].setAttribute('hidden', '');
  }

  function createStatus(root) {
    let status = root.querySelector('[data-dashboard-app-status]');
    if (status) return status;
    status = document.createElement('div');
    status.dataset.dashboardAppStatus = '';
    status.className = 'dashboard-feedback';
    status.setAttribute('role', 'status');
    root.querySelector('.page-header')?.insertAdjacentElement('afterend', status);
    return status;
  }

  function updateFunnelCards(root, impacto) {
    const cards = root.querySelectorAll('.funnel-row .funnel-card');
    const values = [
      ['Jovens Conectados', impacto.conectados.valor, `${impacto.conectados.percentual}% do total`],
      ['Jovens Capacitados', impacto.capacitados.valor, `${impacto.capacitados.percentual}% do total`],
      ['Jovens Transformados', impacto.transformados.valor, `${impacto.transformados.percentual}% do total`]
    ];
    cards.forEach((card, index) => {
      const item = values[index];
      if (!item) return;
      setText(card.querySelector('.fc-num'), item[1]);
      setText(card.querySelector('.fc-title'), item[0]);
      setText(card.querySelector('.fc-sub'), item[2]);
    });
    if (cards[3]) cards[3].setAttribute('hidden', '');
  }

  function barOptions(horizontal) {
    return {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: '#F0F3F7' }, border: { display: false } },
        y: { beginAtZero: true, grid: { display: !horizontal, color: '#F0F3F7' }, border: { display: false } }
      }
    };
  }

  function renderCharts(root, impacto, jornada) {
    const overall = root.querySelector('#g-funnelChart');
    const programs = root.querySelector('#g-historicoChart');
    const risk = root.querySelector('#g-empregadosChart');

    new Chart(overall, {
      type: 'bar',
      data: {
        labels: ['Conectados', 'Capacitados', 'Transformados'],
        datasets: [{ data: [impacto.conectados.valor, impacto.capacitados.valor, impacto.transformados.valor], backgroundColor: COLORS.slice(0, 3), borderRadius: 8, borderSkipped: false }]
      },
      options: barOptions(true)
    });

    const impactPrograms = impacto.porPrograma || [];
    new Chart(programs, {
      type: 'bar',
      data: {
        labels: impactPrograms.map((item) => item.programa),
        datasets: [{ data: impactPrograms.map((item) => item.totalAlunos), backgroundColor: impactPrograms.map((_, index) => COLORS[index % COLORS.length]), borderRadius: 8, borderSkipped: false }]
      },
      options: barOptions(false)
    });

    const journeyPrograms = jornada.porPrograma || [];
    new Chart(risk, {
      type: 'bar',
      data: {
        labels: journeyPrograms.map((item) => item.programa),
        datasets: [{ data: journeyPrograms.map((item) => item.riscoAlto), backgroundColor: '#FFD927', borderRadius: 8, borderSkipped: false }]
      },
      options: barOptions(false)
    });
  }

  function updateChartLabels(root) {
    const chartCards = root.querySelectorAll('.charts-row .chart-card');
    setText(chartCards[0]?.querySelector('.chart-card__title'), 'Alunos por Programa');
    setText(chartCards[0]?.querySelector('.chart-card__sub'), 'Distribuicao atual de alunos acompanhados');
    setText(chartCards[1]?.querySelector('.chart-card__title'), 'Risco Alto por Programa');
    setText(chartCards[1]?.querySelector('.chart-card__sub'), 'Alunos classificados com risco alto de evasao');
    setText(root.querySelector('#g-funnelChart')?.closest('.chart-card')?.querySelector('.chart-card__title'), 'Indicadores de Impacto');
    setText(root.querySelector('#g-funnelChart')?.closest('.chart-card')?.querySelector('.chart-card__sub'), 'Dados consolidados do Backend');
  }

  async function initialize() {
    if (initialized) return;
    initialized = true;
    const root = document.getElementById('view-dashboard');
    if (!root) return;

    const status = createStatus(root);
    window.PulseUiState.set(status, 'loading', 'Carregando indicadores...', { baseClass: 'dashboard-feedback' });
    hideUnsupportedBlocks(root);

    try {
      const [impactoResponse, jornadaResponse] = await Promise.all([
        api().get('/impacto/resumo'),
        api().get('/jornada/resumo')
      ]);
      const impacto = impactoResponse.data;
      const jornada = jornadaResponse.data;
      setText(root.querySelector('.page-header p'), `${impacto.totalAlunos} alunos nos indicadores de impacto e jornada`);
      updateFunnelCards(root, impacto);
      updateChartLabels(root);
      renderCharts(root, impacto, jornada);
      window.PulseUiState.clear(status);
    } catch (error) {
      window.PulseUiState.set(
        status,
        'error',
        window.PulseUiState.messageFrom(error, 'Não foi possível carregar os dados do dashboard.'),
        { baseClass: 'dashboard-feedback' }
      );
    }
  }

  window.initDashboardGestorApp = initialize;
})();
