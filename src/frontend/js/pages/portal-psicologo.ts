declare const Chart: any;

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  initNotificar();
});

function initChart(): void {
  const canvas = document.getElementById('bestar-chart') as HTMLCanvasElement | null;
  if (!canvas) return;

  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Bem-estar (turma)',
          data: [52, 58, 63, 70, 72, 75, 80],
          borderColor: '#338458',
          backgroundColor: 'rgba(51, 132, 88, 0.15)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          order: 1,
        },
        {
          type: 'line',
          label: 'Em atenção',
          data: [30, 32, 28, 35, 33, 30, 28],
          borderColor: '#003870',
          backgroundColor: 'transparent',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          order: 2,
        },
        {
          type: 'bar',
          label: 'Sessões realizadas',
          data: [8, 10, 7, 12, 9, 6, 11],
          backgroundColor: 'rgba(255, 217, 39, 0.80)',
          borderRadius: 4,
          yAxisID: 'y2',
          order: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#11161D',
          titleFont: { family: 'Poppins', size: 12, weight: '600' },
          bodyFont: { family: 'Poppins', size: 12 },
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Poppins', size: 12 },
            color: '#687684',
          },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            font: { family: 'Poppins', size: 12 },
            color: '#687684',
          },
          grid: { color: '#DEE3EA' },
        },
        y2: {
          min: 0,
          max: 20,
          display: false,
          grid: { display: false },
        },
      },
    },
  });
}

function initNotificar(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.btn-notificar');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nome = btn.closest('.alerta-item')
        ?.querySelector('.alerta-nome')?.textContent ?? '';
      console.log(`Notificação enviada para: ${nome}`);
      // TODO: integrar com POST /notificacoes quando endpoint disponível
    });
  });
}
