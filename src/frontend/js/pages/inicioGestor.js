Chart.defaults.font.family = "'Poppins', sans-serif";
Chart.defaults.font.size = 11;

/* ── PAGINAÇÃO DE ATIVIDADES ─────────────────────────────────── */
const ACTIVITIES = [
  { i:'AS', bg:'#003870',              name:'Ana Silva',        desc:'concluiu o Módulo 4 - Sprint 3',      time:'Há 12 minutos', tag:'tag--green', label:'✓ Concluído'  },
  { i:'CM', bg:'#FFD927', c:'#003870', name:'Carlos Mendes',    desc:'atrasou entrega do Módulo 5',         time:'Há 38 minutos', tag:'tag--amber', label:'⚠ Em atraso'  },
  { i:'LR', bg:'#33B458',              name:'Larissa Rocha',    desc:'subiu para o Módulo 5',               time:'Há 1 hora',     tag:'tag--blue',  label:'↑ Progresso'  },
  { i:'BT', bg:'#003870',              name:'Beatriz Torres',   desc:'entregou projeto do Módulo 3',        time:'Há 3 horas',    tag:'tag--green', label:'✓ Entregue'   },
  { i:'MN', bg:'#FFD927', c:'#003870', name:'Marcos Nunes',     desc:'ausente há 3 dias consecutivos',      time:'Há 4 horas',    tag:'tag--amber', label:'⚠ Ausente'    },
  { i:'JP', bg:'#33B458',              name:'Julia Pereira',    desc:'concluiu o Módulo 3 - Sprint 2',      time:'Há 5 horas',    tag:'tag--green', label:'✓ Concluído'  },
  { i:'RO', bg:'#003870',              name:'Rafael Oliveira',  desc:'iniciou o Módulo 6',                  time:'Há 6 horas',    tag:'tag--blue',  label:'↑ Progresso'  },
  { i:'FS', bg:'#FFD927', c:'#003870', name:'Fernanda Santos',  desc:'atrasou entrega do Módulo 4',         time:'Há 7 horas',    tag:'tag--amber', label:'⚠ Em atraso'  },
  { i:'DL', bg:'#33B458',              name:'Diego Lima',       desc:'entregou projeto do Módulo 5',        time:'Há 8 horas',    tag:'tag--green', label:'✓ Entregue'   },
  { i:'PA', bg:'#003870',              name:'Patricia Alves',   desc:'ausente há 2 dias consecutivos',      time:'Há 9 horas',    tag:'tag--amber', label:'⚠ Ausente'    },
  { i:'TM', bg:'#FFD927', c:'#003870', name:'Thiago Martins',   desc:'concluiu o Módulo 2 - Sprint 1',      time:'Há 10 horas',   tag:'tag--green', label:'✓ Concluído'  },
  { i:'CB', bg:'#33B458',              name:'Carolina Bastos',  desc:'subiu para o Módulo 4',               time:'Há 11 horas',   tag:'tag--blue',  label:'↑ Progresso'  },
  { i:'MF', bg:'#003870',              name:'Miguel Fonseca',   desc:'atrasou entrega do Módulo 3',         time:'Há 12 horas',   tag:'tag--amber', label:'⚠ Em atraso'  },
  { i:'IS', bg:'#FFD927', c:'#003870', name:'Isabela Souza',    desc:'entregou projeto do Módulo 4',        time:'Ontem',         tag:'tag--green', label:'✓ Entregue'   },
  { i:'VR', bg:'#33B458',              name:'Victor Ribeiro',   desc:'iniciou o Módulo 5',                  time:'Ontem',         tag:'tag--blue',  label:'↑ Progresso'  },
  { i:'GL', bg:'#003870',              name:'Gabriela Leal',    desc:'concluiu o Módulo 6 - Sprint 1',      time:'Ontem',         tag:'tag--green', label:'✓ Concluído'  },
  { i:'HN', bg:'#FFD927', c:'#003870', name:'Hugo Novaes',      desc:'ausente há 4 dias consecutivos',      time:'Ontem',         tag:'tag--amber', label:'⚠ Ausente'    },
  { i:'SM', bg:'#33B458',              name:'Sofia Moura',      desc:'subiu para o Módulo 7',               time:'Ontem',         tag:'tag--blue',  label:'↑ Progresso'  },
];

const PER_PAGE = 5;
const TOTAL    = 48;
let   curPage  = 2;

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

  /* janela deslizante de 3 botões de página */
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
/* ───────────────────────────────────────────────────────────── */

new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ['Let. Digital', 'Ferramentas Prod.', 'AI-First', 'Fort. Emocional', 'Autogestão', 'Mercado Trab.', 'Lab. Mentoria'],
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
