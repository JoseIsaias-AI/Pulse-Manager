Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.font.size = 11;

/* Alunos por Curso */
new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ['Let. Digital', 'Ferramentas Prod.', 'AI-First', 'Fort. Emocional', 'Autogestão', 'Mercado Trab.', 'Lab. Mentoria'],
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
new Chart(document.getElementById('presencaChart'), {
  type: 'bar',
  data: {
    labels: ['Let. Digital', 'Ferramentas Prod.', 'AI-First', 'Fort. Emocional', 'Autogestão'],
    datasets: [
      {
        label: 'EAD',
        data: [72, 58, 65, 80, 55],
        backgroundColor: '#003870',
        borderRadius: 5,
        borderSkipped: false,
        barPercentage: 0.45
      },
      {
        label: 'Presencial',
        data: [28, 42, 35, 20, 45],
        backgroundColor: '#33B458',
        borderRadius: 5,
        borderSkipped: false,
        barPercentage: 0.45
      }
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
      y: {
        grid: { display: false },
        ticks: { color: '#6B7684', font: { size: 10 } },
        border: { display: false },
        afterFit(scale) { scale.width = 120; }
      }
    }
  }
});

/* Funil de Impacto — barra horizontal */
new Chart(document.getElementById('funnelChart'), {
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
      x: {
        min: 0, max: 220,
        ticks: { color: '#97A1AE', stepSize: 50 },
        grid: { color: '#F0F3F7' },
        border: { display: false }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#6B7684', font: { weight: '500', size: 11 } },
        border: { display: false },
        afterFit(scale) { scale.width = 110; }
      }
    }
  }
});
