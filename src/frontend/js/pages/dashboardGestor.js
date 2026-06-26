(function () {
  'use strict';

  const COLORS = ['#003870', '#33B458', '#FFD927', '#7B4FD9', '#F4A261', '#0E7490'];
  let charts = null;
  let initialized = false;

  function httpClient() {
    if (!window.PulseApi) throw new Error('Cliente HTTP nao carregado.');
    return window.PulseApi;
  }

  async function loadDashboardData() {
    const [impactoResponse, jornadaResponse] = await Promise.all([
      httpClient().get('/impacto/resumo'),
      httpClient().get('/jornada/resumo')
    ]);
    return { impacto: impactoResponse.data, jornada: jornadaResponse.data };
  }

  function chartColors(length) {
    return Array.from({ length }, (_, index) => COLORS[index % COLORS.length]);
  }

  function baseBarOptions(horizontal) {
    return {
      indexAxis: horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => ` ${context.raw} alunos` } }
      },
      scales: {
        x: { beginAtZero: true, grid: { display: horizontal, color: '#F0F3F7' }, ticks: { color: horizontal ? '#97A1AE' : '#6B7684' }, border: { display: false } },
        y: { beginAtZero: true, grid: { display: !horizontal, color: '#F0F3F7' }, ticks: { color: horizontal ? '#6B7684' : '#97A1AE' }, border: { display: false } }
      }
    };
  }

  function createCharts() {
    const barCanvas = document.getElementById('barChart') || document.getElementById('g-historicoChart');
    const riskCanvas = document.getElementById('presencaChart') || document.getElementById('g-empregadosChart');
    const impactCanvas = document.getElementById('funnelChart') || document.getElementById('g-funnelChart');
    if (!barCanvas || !riskCanvas || !impactCanvas) return null;

    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size = 11;

    return {
      programs: new Chart(barCanvas, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderRadius: 6, borderSkipped: false, barPercentage: 0.52 }] },
        options: baseBarOptions(false)
      }),
      risk: new Chart(riskCanvas, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [
            { label: 'Risco alto', data: [], backgroundColor: '#FFD927', borderRadius: 5, borderSkipped: false },
            { label: 'Demais alunos', data: [], backgroundColor: '#003870', borderRadius: 5, borderSkipped: false }
          ]
        },
        options: { ...baseBarOptions(true), plugins: { legend: { display: false } } }
      }),
      impact: new Chart(impactCanvas, {
        type: 'bar',
        data: {
          labels: ['Conectados', 'Capacitados', 'Transformados'],
          datasets: [{ data: [], backgroundColor: ['#003870', '#33B458', '#FFD927'], borderRadius: 8, borderSkipped: false, barPercentage: 0.55 }]
        },
        options: baseBarOptions(true)
      })
    };
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function setTextAt(selector, index, value) {
    const elements = typeof document.querySelectorAll === 'function' ? document.querySelectorAll(selector) : [];
    const element = elements[index];
    if (element) element.textContent = value;
  }

  function formatPercent(value) {
    return `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
  }

  function renderCards(impacto, jornada) {
    setText('[data-dashboard-value="ativos"]', jornada.totalAlunos);
    setText('[data-dashboard-footer="ativos"]', `${jornada.totalAlunos} alunos acompanhados`);
    setText('[data-dashboard-value="evasao"]', jornada.evasao.valor);
    setText('[data-dashboard-footer="evasao"]', `${formatPercent(jornada.evasao.percentual)} do total`);
    setText('[data-dashboard-value="empregados"]', impacto.alunosEmpregados.valor);
    setText('[data-dashboard-footer="empregados"]', `${formatPercent(impacto.alunosEmpregados.percentual)} do total`);
    setText('[data-dashboard-value="conclusao"]', impacto.conclusaoProgramas.valor);
    setText('[data-dashboard-footer="conclusao"]', `${formatPercent(impacto.conclusaoProgramas.percentual)} do total`);
    setText('[data-dashboard-total]', `${impacto.totalAlunos} alunos nos indicadores de impacto e jornada`);

    setText('#view-dashboard .page-header p', `${impacto.totalAlunos} alunos nos indicadores de impacto e jornada`);
    setTextAt('#view-dashboard .fc-num', 0, impacto.conectados.valor);
    setTextAt('#view-dashboard .fc-num', 1, impacto.capacitados.valor);
    setTextAt('#view-dashboard .fc-num', 2, impacto.transformados.valor);
    setTextAt('#view-dashboard .fc-sub', 0, `${formatPercent(impacto.conectados.percentual)} do total`);
    setTextAt('#view-dashboard .fc-sub', 1, `${formatPercent(impacto.capacitados.percentual)} do total`);
    setTextAt('#view-dashboard .fc-sub', 2, `${formatPercent(impacto.transformados.percentual)} do total`);
    setTextAt('#view-dashboard .bk-head', 0, `Conectados · ${impacto.conectados.valor} alunos`);
    setTextAt('#view-dashboard .bk-head', 1, `Capacitados · ${impacto.capacitados.valor} alunos`);
    setTextAt('#view-dashboard .bk-head', 2, `Transformados · ${impacto.transformados.valor} alunos`);
  }

  function renderCharts(impacto, jornada) {
    const programs = impacto.porPrograma || [];
    charts.programs.data.labels = programs.map((item) => item.programa);
    charts.programs.data.datasets[0].data = programs.map((item) => item.totalAlunos);
    charts.programs.data.datasets[0].backgroundColor = chartColors(programs.length);
    charts.programs.update();

    const riskPrograms = jornada.porPrograma || [];
    charts.risk.data.labels = riskPrograms.map((item) => item.programa);
    charts.risk.data.datasets[0].data = riskPrograms.map((item) => item.riscoAlto);
    charts.risk.data.datasets[1].data = riskPrograms.map((item) => Math.max(0, item.totalAlunos - item.riscoAlto));
    charts.risk.update();

    charts.impact.data.datasets[0].data = [impacto.conectados.valor, impacto.capacitados.valor, impacto.transformados.valor];
    charts.impact.update();
  }

  function setStatus(message, type) {
    let status = document.querySelector('[data-dashboard-status]');
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('data-dashboard-status', '');
      status.className = 'dashboard-feedback';
      const header = document.querySelector('#view-dashboard .page-header');
      if (header) header.insertAdjacentElement('afterend', status);
    }
    if (!status) return;
    status.textContent = message;
    status.className = `dashboard-feedback dashboard-feedback--${type}`;
    status.hidden = false;
  }

  function clearStatus() {
    const status = document.querySelector('[data-dashboard-status]');
    if (status) status.hidden = true;
  }

  async function initialize() {
    if (initialized) return;
    initialized = true;
    if (typeof window.Chart !== 'function') {
      setStatus('Nao foi possivel carregar os graficos do dashboard.', 'error');
      return;
    }

    charts = createCharts();
    if (!charts) return;
    setStatus('Carregando indicadores...', 'loading');

    try {
      const { impacto, jornada } = await loadDashboardData();
      renderCards(impacto, jornada);
      renderCharts(impacto, jornada);
      clearStatus();
    } catch (error) {
      setStatus(error.message || 'Nao foi possivel carregar os dados do dashboard.', 'error');
    }
  }

  window.initDashboardGestor = initialize;
  initialize();
})();
