Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.font.size = 11;

/* BAR CHART — meta como dataset linha */
new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'],
    datasets: [
      {
        type: 'bar',
        data: [92, 88, 81, 95],
        backgroundColor: ['#003870','#33B458','#FFD927','#003870'],
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
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => ` ${c.raw}%` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
      y: { min: 60, max: 100, ticks: { color: '#97A1AE', stepSize: 10, callback: v => v + '%' }, grid: { color: '#F0F3F7' }, border: { display: false } }
    }
  }
});

/* LINE CHART — Letramento Digital · 5 módulos */
const lCtx = document.getElementById('lineChart').getContext('2d');
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
        borderColor: '#003870',
        backgroundColor: grad,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#003870',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        order: 2
      },
      {
        label: 'Frequência',
        data: [9.0, 8.8, 8.7, 8.6, 8.5],
        borderColor: '#97A1AE',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#97A1AE',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        borderDash: [5, 4],
        borderWidth: 1.5,
        order: 3
      },
      {
        label: 'Meta (7,0)',
        data: Array(5).fill(7.0),
        borderColor: '#DEE3EA',
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
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
      y: { min: 0, max: 10, ticks: { color: '#97A1AE', stepSize: 2 }, grid: { color: '#F0F3F7' }, border: { display: false } }
    }
  }
});
