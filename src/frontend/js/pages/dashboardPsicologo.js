(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     VIEW: DASHBOARD PSICÓLOGO — Saúde Mental e Bem-estar
     Extraído de spaPsicologo.js › initDashboardView()
  ════════════════════════════════════════════════════════════ */
  function initDashboardView() {
    Chart.defaults.font.family = "'Poppins', sans-serif";

    const META = 7;

    /* Dados: Mês (exibido por padrão) e Semana */
    const DATA = {
      mes:    { vals: [8.2, 7.6, 7.1, 6.8], labels: ['Eng.\nSoftware', 'Design', 'Gestão', 'Mkt.\nDigital'] },
      semana: { vals: [7.9, 7.3, 6.8, 6.5], labels: ['Eng.\nSoftware', 'Design', 'Gestão', 'Mkt.\nDigital'] }
    };

    function barColors(vals) {
      return vals.map(function (v) {
        return v >= META + 0.3 ? '#003870' : v >= META ? '#33B458' : '#FFD927';
      });
    }

    /* Plugin inline: rótulos acima das barras + linha "Meta 7" */
    const labelsPlugin = {
      id: 'db-labels',
      afterDatasetsDraw: function (chart) {
        var ctx = chart.ctx;
        /* Rótulos acima das barras (apenas dataset 0) */
        var meta0 = chart.getDatasetMeta(0);
        if (!meta0.hidden) {
          meta0.data.forEach(function (bar, i) {
            var val = chart.data.datasets[0].data[i];
            var str = String(val).replace('.', ',');
            ctx.save();
            ctx.fillStyle = '#11161D';
            ctx.font = "700 12px 'Poppins', sans-serif";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(str, bar.x, bar.y - 5);
            ctx.restore();
          });
        }
        /* Label "Meta 7" no fim da linha tracejada (dataset 1) */
        var meta1 = chart.getDatasetMeta(1);
        if (meta1 && meta1.data && meta1.data.length) {
          var last  = meta1.data[meta1.data.length - 1];
          var yPx   = chart.scales.y.getPixelForValue(META);
          ctx.save();
          ctx.fillStyle  = '#003870';
          ctx.font       = "600 11px 'Poppins', sans-serif";
          ctx.textAlign  = 'left';
          ctx.textBaseline = 'middle';
          /* Desenha fora do clip area */
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillText('Meta ' + META, last.x + 8, last.y);
          ctx.restore();
        }
      }
    };

    var canvas = document.getElementById('db-bestar-chart');
    if (!canvas) return;

    var dbChart = new Chart(canvas, {
      type: 'bar',
      plugins: [labelsPlugin],
      data: {
        labels: DATA.mes.labels,
        datasets: [
          {
            data: DATA.mes.vals,
            backgroundColor: barColors(DATA.mes.vals),
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
            order: 1
          },
          {
            type: 'line',
            label: 'Meta',
            data: [META, META, META, META],
            borderColor: 'rgba(0,56,112,.55)',
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false,
            tension: 0,
            order: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20, right: 52 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            filter: function (item) { return item.datasetIndex === 0; },
            callbacks: {
              label: function (ctx) { return ' ' + String(ctx.raw).replace('.', ','); }
            },
            backgroundColor: '#11161D',
            titleFont: { size: 11, weight: '600' },
            bodyFont: { size: 11 },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid:   { display: false },
            border: { display: false },
            ticks:  { font: { size: 11 }, color: '#4D5663', maxRotation: 0 }
          },
          y: {
            min: 0, max: 10,
            ticks:  { stepSize: 2, font: { size: 11 }, color: '#97A1AE' },
            grid:   { color: '#EEF1F4' },
            border: { display: false }
          }
        }
      }
    });

    /* Toggle Semana / Mês */
    window.dbToggle = function (mode) {
      var d = DATA[mode];
      dbChart.data.datasets[0].data            = d.vals;
      dbChart.data.datasets[0].backgroundColor = barColors(d.vals);
      dbChart.data.datasets[1].data            = [META, META, META, META];
      dbChart.update();

      var btnS = document.getElementById('db-btn-semana');
      var btnM = document.getElementById('db-btn-mes');
      if (btnS) btnS.classList.toggle('active', mode === 'semana');
      if (btnM) btnM.classList.toggle('active', mode === 'mes');
    };
  }

  initDashboardView();

})();
