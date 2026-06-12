(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     DADOS: Cursos — usados na view de alunos E no perfil
  ════════════════════════════════════════════════════════════ */
  const COURSE_MODULES = {
    'Letramento Digital':                                     ['Intro. ao Digital', 'Seg. Online', 'Ferramentas Web', 'Noções de Dados', 'Ger. de Arquivos'],
    'Ferramentas de Produtividade':                           ['Fund. de Planilhas', 'Fórmulas Básicas', 'Fórmulas Avançadas', 'Visualização', 'Projeto Prático'],
    'Desenvolvimento AI-First na Prática':                    ['Pens. Computacional', 'Fund. de IA', 'Prompt Engineering', 'IA Aplicada', 'Projeto com IA'],
    'Fortalecimento Emocional para Jovens':                   ['Autoconhecimento', 'Autoconsciência', 'Autoconfiança', 'Habilidades Sociais', 'Projeto Pessoal'],
    'Autogestão no Mundo do Trabalho':                        ['Foco e Atenção', 'Gestão do Tempo', 'Aprendizagem', 'Adaptabilidade', 'Plano de Ação'],
    'Mercado de Trabalho: Preparação, Conexão e Vivências':   ['Currículo', 'Entrevistas', 'LinkedIn', 'Rede Profissional', 'Carreiras em TI'],
    'Laboratório de Mentoria':                                ['Fund. de Mentoria', 'Papel do Mentorado', 'Etapas da Mentoria', 'Boas Práticas', 'Sessão Final'],
  };

  const COURSE_SHORT = {
    'Letramento Digital':                                     'Let. Digital',
    'Ferramentas de Produtividade':                           'Ferramentas Prod.',
    'Desenvolvimento AI-First na Prática':                    'AI-First',
    'Fortalecimento Emocional para Jovens':                   'Fort. Emocional',
    'Autogestão no Mundo do Trabalho':                        'Autogestão',
    'Mercado de Trabalho: Preparação, Conexão e Vivências':   'Mercado Trab.',
    'Laboratório de Mentoria':                                'Lab. Mentoria',
  };

  const COURSE_ICON = {
    'Letramento Digital':                                     'ti-device-laptop',
    'Ferramentas de Produtividade':                           'ti-table',
    'Desenvolvimento AI-First na Prática':                    'ti-brain',
    'Fortalecimento Emocional para Jovens':                   'ti-heart',
    'Autogestão no Mundo do Trabalho':                        'ti-target',
    'Mercado de Trabalho: Preparação, Conexão e Vivências':   'ti-briefcase',
    'Laboratório de Mentoria':                                'ti-users',
  };

  /* ════════════════════════════════════════════════════════════
     VIEWS — roteador SPA
  ════════════════════════════════════════════════════════════ */
  const VIEWS = ['inicio', 'alunos', 'dashboard'];
  const chartInited = { inicio: false, alunos: false, dashboard: false };

  function showView(id) {
    VIEWS.forEach(function (v) {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = 'none';
    });

    /* Barra de busca: visível apenas na view Alunos */
    const search = document.getElementById('top-search');
    if (search) search.style.display = id === 'alunos' ? '' : 'none';

    const target = document.getElementById('view-' + id);
    if (!target) return;
    target.style.display = 'flex';

    if (!chartInited[id]) {
      chartInited[id] = true;
      if (id === 'inicio')     initInicioView();
      if (id === 'alunos')     initAlunosView();
      if (id === 'dashboard')  initDashboardView();
    }
  }

  /* ── Roteador global ─────────────────────────────────────── */
  window.__onMenuNav = function (pageId) {
    if (VIEWS.includes(pageId)) showView(pageId);
  };

  /* ── View padrão ─────────────────────────────────────────── */
  showView('inicio');

  /* ── Bloco de perfil na sidebar → abre modalConfEquipe ───── */
  document.addEventListener('DOMContentLoaded', function () {
    var userBlock = document.querySelector('.menuLateral__user');
    if (userBlock) {
      userBlock.style.cursor = 'pointer';
      userBlock.addEventListener('click', function () {
        if (typeof openModal === 'function') openModal();
      });
    }
    /* Data padrão no campo de anotação */
    var pfData = document.getElementById('pf-data');
    if (pfData) pfData.value = new Date().toISOString().split('T')[0];
  });

  /* ════════════════════════════════════════════════════════════
     VIEW: INÍCIO — bem-estar + alertas + sessões
  ════════════════════════════════════════════════════════════ */
  function initInicioView() {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size   = 11;

    /* Gráfico de bem-estar */
    var canvas = document.getElementById('psi-bestar-chart');
    if (canvas) {
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          datasets: [
            {
              type: 'line',
              label: 'Bem-estar (turma)',
              data: [52, 58, 63, 70, 72, 75, 80],
              borderColor: '#33B458',
              backgroundColor: 'rgba(51,180,88,.12)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              order: 1
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
              order: 2
            },
            {
              type: 'bar',
              label: 'Sessões realizadas',
              data: [8, 10, 7, 12, 9, 6, 11],
              backgroundColor: 'rgba(255,217,39,.75)',
              borderRadius: 4,
              yAxisID: 'y2',
              order: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#11161D',
              titleFont: { family: 'Poppins', size: 11, weight: '600' },
              bodyFont: { family: 'Poppins', size: 11 },
              padding: 10,
              cornerRadius: 8
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Poppins', size: 11 }, color: '#97A1AE' },
              border: { display: false }
            },
            y: {
              min: 0, max: 100,
              ticks: { stepSize: 25, font: { family: 'Poppins', size: 11 }, color: '#97A1AE' },
              grid: { color: '#EEF1F4' },
              border: { display: false }
            },
            y2: { min: 0, max: 20, display: false, grid: { display: false } }
          }
        }
      });
    }

    /* Botões Notificar */
    document.querySelectorAll('.btn-notificar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item   = btn.closest('.alerta-item');
        var nomeEl = item ? item.querySelector('.alerta-nome') : null;
        var nome   = nomeEl ? (nomeEl.textContent || '') : '';
        console.log('Notificação enviada para: ' + nome);
        btn.textContent  = '✓ Enviado';
        btn.style.background = '#33B458';
        btn.disabled = true;
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: ALUNOS
  ════════════════════════════════════════════════════════════ */
  function initAlunosView() {
    const PER_PAGE = 9;
    const TOTAL    = 18;
    let curPage      = 1;
    let filterCourse = 'all';
    let desempSort   = 'none';
    let notaSort     = 'none';
    let engSort      = 'none';
    let nameSort     = 'none';
    let searchQuery  = '';

    const STUDENTS = [
      { id:'PM-2024-474', name:'Mariana Costa',   ini:'MC', bg:'#E0E7FF', tc:'#4338CA', age:19, course:'Desenvolvimento AI-First na Prática',                    st:'ativa',     mod:'Módulo 5',             pct:84,  nota:8.4, eng:8, techCourse:'Engenharia de Software'          },
      { id:'PM-2024-950', name:'Tiago Ribeiro',   ini:'TR', bg:'#FFE4E1', tc:'#DC2626', age:21, course:'Letramento Digital',                                     st:'risco',     mod:'Módulo 4',             pct:62,  nota:7.2, eng:5, techCourse:'Análise e Des. de Sistemas'      },
      { id:'PM-2024-811', name:'Letícia Pires',   ini:'LP', bg:'#FEF9C3', tc:'#854D0E', age:22, course:'Autogestão no Mundo do Trabalho',                        st:'empregado', mod:'Módulo 5 · Concluído', pct:100, nota:9.5, eng:9, techCourse:'Sistemas de Informação'          },
      { id:'PM-2024-137', name:'Bruno Ferraz',    ini:'BF', bg:'#F1F5F9', tc:'#475569', age:19, course:'Letramento Digital',                                     st:'inativo',   mod:'Módulo 3',             pct:48,  nota:6.3, eng:3, techCourse:''                                },
      { id:'PM-2024-465', name:'Júlia Alves',     ini:'JA', bg:'#DCFCE7', tc:'#15803D', age:20, course:'Fortalecimento Emocional para Jovens',                   st:'ativa',     mod:'Módulo 5',             pct:85,  nota:8.5, eng:8, techCourse:''                                },
      { id:'PM-2024-799', name:'Renato Dias',     ini:'RD', bg:'#FEF9C3', tc:'#854D0E', age:23, course:'Mercado de Trabalho: Preparação, Conexão e Vivências',   st:'atencao',   mod:'Módulo 4',             pct:65,  nota:7.6, eng:6, techCourse:'Tecnologia em Redes'             },
      { id:'PM-2024-302', name:'Karen Souza',     ini:'KS', bg:'#CFFAFE', tc:'#0E7490', age:20, course:'Ferramentas de Produtividade',                           st:'ativa',     mod:'Módulo 5',             pct:82,  nota:8.2, eng:7, techCourse:'Desenvolvimento Web'             },
      { id:'PM-2024-618', name:'Pedro Lima',      ini:'PL', bg:'#FFE4E1', tc:'#DC2626', age:22, course:'Laboratório de Mentoria',                                st:'risco',     mod:'Módulo 3',             pct:42,  nota:5.9, eng:4, techCourse:''                                },
      { id:'PM-2024-229', name:'Ana Martins',     ini:'AM', bg:'#DCFCE7', tc:'#15803D', age:19, course:'Autogestão no Mundo do Trabalho',                        st:'ativa',     mod:'Módulo 5',             pct:91,  nota:9.0, eng:9, techCourse:''                                },
      { id:'PM-2024-531', name:'Felipe Santos',   ini:'FS', bg:'#E0E7FF', tc:'#4338CA', age:21, course:'Laboratório de Mentoria',                                st:'ativa',     mod:'Módulo 4',             pct:68,  nota:7.8, eng:7, techCourse:'Ciência da Computação'          },
      { id:'PM-2024-388', name:'Camila Rocha',    ini:'CR', bg:'#FCE7F3', tc:'#9D174D', age:20, course:'Ferramentas de Produtividade',                           st:'ativa',     mod:'Módulo 5',             pct:87,  nota:8.7, eng:8, techCourse:'Design Digital'                  },
      { id:'PM-2024-712', name:'Diego Melo',      ini:'DM', bg:'#FFE4E1', tc:'#DC2626', age:24, course:'Letramento Digital',                                     st:'risco',     mod:'Módulo 2',             pct:31,  nota:5.1, eng:3, techCourse:''                                },
      { id:'PM-2024-559', name:'Isabela Gomes',   ini:'IG', bg:'#F3E8FF', tc:'#7E22CE', age:19, course:'Fortalecimento Emocional para Jovens',                   st:'ativa',     mod:'Módulo 5',             pct:83,  nota:8.3, eng:8, techCourse:''                                },
      { id:'PM-2024-244', name:'Lucas Ferreira',  ini:'LF', bg:'#FEF9C3', tc:'#854D0E', age:22, course:'Mercado de Trabalho: Preparação, Conexão e Vivências',   st:'empregado', mod:'Módulo 5 · Concluído', pct:100, nota:9.4, eng:9, techCourse:'Engenharia de Software'          },
      { id:'PM-2024-876', name:'Sofia Carvalho',  ini:'SC', bg:'#FEF3C7', tc:'#92400E', age:20, course:'Autogestão no Mundo do Trabalho',                        st:'atencao',   mod:'Módulo 3',             pct:43,  nota:6.0, eng:5, techCourse:''                                },
      { id:'PM-2024-193', name:'Gabriel Nunes',   ini:'GN', bg:'#CFFAFE', tc:'#0E7490', age:21, course:'Desenvolvimento AI-First na Prática',                    st:'ativa',     mod:'Módulo 5',             pct:86,  nota:8.6, eng:8, techCourse:'Análise e Des. de Sistemas'      },
      { id:'PM-2024-647', name:'Patrícia Leal',   ini:'PL', bg:'#DCFCE7', tc:'#15803D', age:23, course:'Ferramentas de Produtividade',                           st:'ativa',     mod:'Módulo 5',             pct:88,  nota:8.8, eng:9, techCourse:'Sistemas de Informação'          },
      { id:'PM-2024-320', name:'Henrique Torres', ini:'HT', bg:'#F1F5F9', tc:'#475569', age:19, course:'Laboratório de Mentoria',                                st:'inativo',   mod:'Módulo 2',             pct:23,  nota:4.5, eng:2, techCourse:''                                },
    ];

    const COURSES = ['Todos', ...new Set(STUDENTS.map(function (s) { return s.techCourse || '—'; }))];
    let courseIdx = 0;

    const BAR  = { ativa:'c-green', risco:'c-red', empregado:'c-green', inativo:'c-gray', atencao:'c-amber' };
    const SLBL = { risco:'⚠ em risco', atencao:'! atenção' };
    const PROB = new Set(['risco', 'atencao']);

    function getList() {
      let list = STUDENTS.slice();
      if (filterCourse !== 'all') list = list.filter(function (s) { return (s.techCourse || '—') === filterCourse; });
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(function (s) {
          return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
        });
      }
      if (desempSort === 'desc') list.sort(function (a, b) { return b.pct  - a.pct;  });
      if (desempSort === 'asc')  list.sort(function (a, b) { return a.pct  - b.pct;  });
      if (notaSort  === 'desc')  list.sort(function (a, b) { return b.nota - a.nota; });
      if (notaSort  === 'asc')   list.sort(function (a, b) { return a.nota - b.nota; });
      if (engSort   === 'desc')  list.sort(function (a, b) { return b.eng  - a.eng;  });
      if (engSort   === 'asc')   list.sort(function (a, b) { return a.eng  - b.eng;  });
      if (nameSort  === 'az')    list.sort(function (a, b) { return a.name.localeCompare(b.name, 'pt'); });
      if (nameSort  === 'za')    list.sort(function (a, b) { return b.name.localeCompare(a.name, 'pt'); });
      return list;
    }

    function renderPage(page) {
      curPage = page;
      const list  = getList();
      const total = list.length || 1;
      const start = (page - 1) * PER_PAGE;
      const slice = list.slice(start, start + PER_PAGE);
      const grid  = document.getElementById('al-grid');
      if (!grid) return;

      grid.innerHTML = slice.map(function (s) {
        return `
        <div class="al-card" data-id="${s.id}">
          <div class="al-card-top">
            <div class="al-av" style="background:${s.bg};color:${s.tc};">${s.ini}</div>
            <div class="al-info">
              <div class="al-name">${s.name}</div>
              <div class="al-meta">${s.age} anos · ${s.techCourse || '—'}</div>
              <div class="al-id">${s.id}</div>
            </div>
            ${PROB.has(s.st) ? `<span class="al-badge al-badge--${s.st}">${SLBL[s.st]}</span>` : ''}
          </div>
          <div class="al-prog-row">
            <span class="al-module">${s.mod}</span>
            <span class="al-pct">${s.pct}%</span>
          </div>
          <div class="al-bar"><div class="al-bar-inner ${BAR[s.st]}" style="width:${s.pct}%"></div></div>
        </div>`;
      }).join('');

      /* Clique em card → abrir perfil do aluno */
      grid.querySelectorAll('.al-card').forEach(function (card, i) {
        card.addEventListener('click', function () { openStudentProfile(slice[i]); });
      });

      /* Paginação */
      const totalPages   = Math.ceil(total / PER_PAGE);
      const info         = document.getElementById('al-pag-info');
      const displayTotal = filterCourse === 'all' && !searchQuery ? TOTAL : total;
      if (info) info.textContent =
        `Exibindo ${start + 1}–${Math.min(start + PER_PAGE, total)} de ${displayTotal} alunos`;

      const nums = document.getElementById('al-pag-nums');
      if (nums) {
        nums.innerHTML = '';
        const show = new Set(
          [1, page - 1, page, page + 1, totalPages].filter(function (p) { return p >= 1 && p <= totalPages; })
        );
        let prev = 0;
        [...show].sort(function (a, b) { return a - b; }).forEach(function (p) {
          if (prev && p - prev > 1) {
            const ell = document.createElement('span');
            ell.textContent = '…';
            ell.style.cssText = 'font-size:11px;color:#97A1AE;padding:0 2px;line-height:26px;';
            nums.appendChild(ell);
          }
          const btn = document.createElement('button');
          btn.className   = 'al-pag-btn' + (p === page ? ' active' : '');
          btn.textContent = p;
          btn.addEventListener('click', function () { renderPage(p); });
          nums.appendChild(btn);
          prev = p;
        });
      }

      const prevBtn = document.getElementById('al-prev');
      const nextBtn = document.getElementById('al-next');
      if (prevBtn) prevBtn.disabled = page === 1;
      if (nextBtn) nextBtn.disabled = page >= totalPages;
    }

    /* ── Filtros ─────────────────────────────────────────── */
    const btnCurso  = document.getElementById('btn-curso');
    const btnDesemp = document.getElementById('btn-desemp');
    const btnNota   = document.getElementById('btn-nota');
    const btnEng    = document.getElementById('btn-eng');
    const btnOrd    = document.getElementById('btn-ord');
    let desempIdx = 0, notaIdx = 0, engIdx = 0, nameSortIdx = 0;

    function resetSortBtns(except) {
      if (except !== 'desemp') { desempSort = 'none'; desempIdx = 0; if (btnDesemp) { btnDesemp.textContent = 'Desempenho';  btnDesemp.classList.remove('al-filter-btn--active'); } }
      if (except !== 'nota')   { notaSort   = 'none'; notaIdx   = 0; if (btnNota)   { btnNota.textContent   = 'Nota Média';  btnNota.classList.remove('al-filter-btn--active'); } }
      if (except !== 'eng')    { engSort    = 'none'; engIdx    = 0; if (btnEng)    { btnEng.textContent    = 'Engajamento'; btnEng.classList.remove('al-filter-btn--active'); } }
      if (except !== 'name')   {
        nameSort = 'none'; nameSortIdx = 0;
        if (btnOrd) { btnOrd.innerHTML = '<i class="ti ti-adjustments-horizontal" style="font-size:11px;"></i> Ordenar'; btnOrd.classList.remove('al-filter-btn--active'); }
      }
    }

    if (btnCurso) btnCurso.addEventListener('click', function () {
      courseIdx    = (courseIdx + 1) % COURSES.length;
      filterCourse = courseIdx === 0 ? 'all' : COURSES[courseIdx];
      this.textContent = courseIdx === 0 ? 'Curso' : COURSES[courseIdx];
      this.classList.toggle('al-filter-btn--active', courseIdx !== 0);
      renderPage(1);
    });

    if (btnDesemp) btnDesemp.addEventListener('click', function () {
      desempIdx  = (desempIdx + 1) % 3;
      desempSort = ['none', 'desc', 'asc'][desempIdx];
      resetSortBtns('desemp');
      this.textContent = ['Desempenho', 'Desempenho ↑', 'Desempenho ↓'][desempIdx];
      this.classList.toggle('al-filter-btn--active', desempIdx !== 0);
      renderPage(1);
    });

    if (btnNota) btnNota.addEventListener('click', function () {
      notaIdx  = (notaIdx + 1) % 3;
      notaSort = ['none', 'desc', 'asc'][notaIdx];
      resetSortBtns('nota');
      this.textContent = ['Nota Média', 'Nota Média ↑', 'Nota Média ↓'][notaIdx];
      this.classList.toggle('al-filter-btn--active', notaIdx !== 0);
      renderPage(1);
    });

    if (btnEng) btnEng.addEventListener('click', function () {
      engIdx  = (engIdx + 1) % 3;
      engSort = ['none', 'desc', 'asc'][engIdx];
      resetSortBtns('eng');
      this.textContent = ['Engajamento', 'Engajamento ↑', 'Engajamento ↓'][engIdx];
      this.classList.toggle('al-filter-btn--active', engIdx !== 0);
      renderPage(1);
    });

    if (btnOrd) btnOrd.addEventListener('click', function () {
      nameSortIdx = (nameSortIdx + 1) % 3;
      nameSort    = ['none', 'az', 'za'][nameSortIdx];
      resetSortBtns('name');
      this.innerHTML = `<i class="ti ti-adjustments-horizontal" style="font-size:11px;"></i> ${['Ordenar', 'A → Z', 'Z → A'][nameSortIdx]}`;
      this.classList.toggle('al-filter-btn--active', nameSortIdx !== 0);
      renderPage(1);
    });

    /* ── Barra de busca ─────────────────────────────────── */
    var searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = this.value.trim();
        renderPage(1);
      });
    }

    var prevBtn = document.getElementById('al-prev');
    var nextBtn = document.getElementById('al-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { renderPage(curPage - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { renderPage(curPage + 1); });

    renderPage(1);
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: DASHBOARD — Saúde Mental e Bem-estar
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

  /* ════════════════════════════════════════════════════════════
     OVERLAY: PERFIL DO ALUNO — perfilAlunoHist
  ════════════════════════════════════════════════════════════ */
  function openStudentProfile(s) {
    const overlay = document.getElementById('perfil-hist-overlay');
    if (!overlay) return;

    /* Avatar */
    const av = document.getElementById('pf-avatar');
    if (av) { av.textContent = s.ini; av.style.background = s.bg; av.style.color = s.tc; }

    /* Nome e meta */
    const nameEl = document.getElementById('pf-name');
    if (nameEl) nameEl.textContent = s.name;

    const metaEl = document.getElementById('pf-meta');
    if (metaEl) metaEl.textContent = s.id + ' · Programa Pulse Mais · Turma T4';

    /* Badge de curso */
    const badgeCurso = document.getElementById('pf-badge-curso');
    if (badgeCurso) {
      const icon  = COURSE_ICON[s.course]  || 'ti-book';
      const short = COURSE_SHORT[s.course] || s.course;
      badgeCurso.innerHTML = `<i class="ti ${icon}" style="font-size:11px;"></i> ${short}`;
    }

    /* Campos do formulário */
    const codeNum   = s.id.split('-').pop();
    const codeEl    = document.getElementById('pf-code');     if (codeEl)    codeEl.value    = codeNum;
    const nameInp   = document.getElementById('pf-fullname'); if (nameInp)   nameInp.value   = s.name;
    const ageInp    = document.getElementById('pf-age');      if (ageInp)    ageInp.value    = s.age + ' anos';
    const courseInp = document.getElementById('pf-course');   if (courseInp) courseInp.value = s.techCourse || '—';

    /* Frequência */
    const freqVal = document.getElementById('pf-freq-val');
    const freqBar = document.getElementById('pf-freq-bar');
    if (freqVal) freqVal.textContent = s.pct + '%';
    if (freqBar) {
      freqBar.style.width      = s.pct + '%';
      freqBar.style.background = s.pct < 60 ? '#E24B4A' : s.pct < 75 ? '#F4A261' : 'var(--green-600,#33B458)';
    }

    /* Estrelas de engajamento */
    const stars = document.getElementById('pf-eng-stars');
    if (stars) {
      const score = Math.round(s.pct / 10);
      stars.innerHTML = Array.from({length: 10}, function (_, i) {
        return `<i class="ti ti-star${i < score ? '-filled' : ''}" style="font-size:13px;color:${i < score ? '#FFD927' : '#DEE3EA'};"></i>`;
      }).join('');
    }

    /* ── Notas e Jornada dinâmicas ─────────────────────────── */
    const modules      = COURSE_MODULES[s.course] || ['Módulo 1','Módulo 2','Módulo 3','Módulo 4','Módulo 5'];
    const concluded    = s.mod.includes('Concluído');
    const modNumMatch  = s.mod.match(/Módulo (\d)/);
    const currentMod   = modNumMatch ? parseInt(modNumMatch[1]) : 5;
    const doneMods     = concluded ? 5 : currentMod - 1;
    const baseGrade    = 5.5 + (s.pct / 100) * 3.5;
    const offsets      = [0.5, 0.2, 0, -0.2, -0.4];

    const notasLabel = document.getElementById('pf-notas-label');
    if (notasLabel) notasLabel.textContent = 'Notas — ' + s.course;

    const notasGrid = document.getElementById('pf-notas-grid');
    if (notasGrid) {
      notasGrid.innerHTML = modules.map(function (name, i) {
        const modN    = i + 1;
        const pending = !concluded && modN > currentMod;
        if (pending) {
          return `<div class="nota-item"><span class="nota-modulo">${name}</span><div class="nota-bar-wrap"><div class="nota-bar"><div class="nota-bar__fill" style="width:0%"></div></div></div><span class="nota-val" style="color:#C0C7D0">—</span></div>`;
        }
        const g     = Math.round((baseGrade + offsets[i]) * 10) / 10;
        const color = g >= 8 ? '#33B458' : g >= 7 ? '#EF9F27' : '#E24B4A';
        const star  = g < 8 ? ' ★' : '';
        return `<div class="nota-item"><span class="nota-modulo">${name}</span><div class="nota-bar-wrap"><div class="nota-bar"><div class="nota-bar__fill" style="width:${g * 10}%;background:${color}"></div></div></div><span class="nota-val" style="color:${color}">${g.toFixed(1).replace('.', ',')}${star}</span></div>`;
      }).join('');
    }

    const gradedCount = concluded ? 5 : currentMod;
    const grades      = Array.from({length: gradedCount}, function (_, i) { return Math.round((baseGrade + offsets[i]) * 10) / 10; });
    const avg         = grades.reduce(function (a, b) { return a + b; }, 0) / grades.length;
    const mediaEl     = document.getElementById('pf-nota-media-val');
    if (mediaEl) mediaEl.textContent = avg.toFixed(1).replace('.', ',');

    const journeyEl = document.getElementById('pf-journey');
    if (journeyEl) {
      journeyEl.innerHTML = modules.map(function (name, i) {
        const modN      = i + 1;
        const isDone    = concluded || modN <= doneMods;
        const isCurrent = !concluded && modN === currentMod;
        const cls       = isDone ? 'done' : isCurrent ? 'current' : '';
        const lineDone  = (isDone && !isCurrent) ? 'done' : '';
        const line      = i < 4 ? `<div class="journey-line ${lineDone}"></div>` : '';
        return `<div class="journey-step"><div class="journey-node ${cls}">${modN}</div><div class="journey-label">${name}</div></div>${line}`;
      }).join('');
    }

    /* Data padrão no campo de anotação */
    const pfData = document.getElementById('pf-data');
    if (pfData && !pfData.value) pfData.value = new Date().toISOString().split('T')[0];

    /* Renderizar lista de anotações existentes */
    renderLista();

    /* Reset para aba "Dados gerais" */
    window.showHistTab('pf-tab-dados', overlay.querySelector('.tab-btn'));

    /* Abrir overlay */
    overlay.classList.add('open');
  }

  /* ── Fechar overlay de perfil ─────────────────────────────── */
  window.closeHistModal = function () {
    const overlay = document.getElementById('perfil-hist-overlay');
    if (overlay) overlay.classList.remove('open');
  };

  /* ── Navegação de abas do perfil ─────────────────────────── */
  window.showHistTab = function (tabId, btn) {
    const overlay = document.getElementById('perfil-hist-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
    overlay.querySelectorAll('.tab-btn').forEach(function (b)   { b.classList.remove('active'); });
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
    if (btn)   btn.classList.add('active');
  };

  /* Fechar com Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const histOverlay = document.getElementById('perfil-hist-overlay');
      if (histOverlay && histOverlay.classList.contains('open')) {
        window.closeHistModal();
      }
    }
  });

  /* ════════════════════════════════════════════════════════════
     ANOTAÇÕES PSICOLÓGICAS
  ════════════════════════════════════════════════════════════ */
  const anotacoes = [
    {
      data: '2024-10-03',
      tipo: 'Triagem inicial',
      psi:  'Dr. João Mário',
      texto: 'Primeira sessão de triagem. Aluno demonstra bom vínculo social com colegas de turma. Leve ansiedade em relação às entregas do módulo atual, porém sem impacto significativo no desempenho. Recomendado acompanhamento mensal.'
    },
    {
      data: '2024-11-07',
      tipo: 'Acompanhamento',
      psi:  'Dr. João Mário',
      texto: 'Segunda sessão. Ansiedade reduzida em relação ao período anterior. Melhora na organização de rotina de estudos. Engajamento nas atividades em grupo permanece positivo. Nenhuma intervenção adicional necessária no momento.'
    },
    {
      data: '2024-12-12',
      tipo: 'Acompanhamento',
      psi:  'Dr. João Mário',
      texto: 'Sessão de final de semestre. Sinais de cansaço típicos do período, sem indicadores de sofrimento psíquico. Orientado sobre técnicas de autocuidado durante o recesso. Retorno previsto para o início do próximo módulo.'
    }
  ];

  function renderLista() {
    var list = document.getElementById('psico-list');
    if (!list) return;
    if (anotacoes.length === 0) {
      list.innerHTML = '<div class="psico-empty"><i class="ti ti-notes-off"></i><span>Nenhuma anotação registrada ainda.</span></div>';
      return;
    }
    var tipoClass = {
      'Triagem inicial':     'triagem',
      'Sessão individual':   'sessao',
      'Acompanhamento':      'acomp',
      'Grupo de apoio':      'grupo',
      'Orientação familiar': 'familia',
      'Encaminhamento':      'enc'
    };
    list.innerHTML = [...anotacoes].reverse().map(function (a) {
      var parts   = a.data.split('-');
      var dataFmt = parts[2] + '/' + parts[1] + '/' + parts[0];
      var cls     = tipoClass[a.tipo] || 'sessao';
      var labelHtml = '';
      if (a.label === 'atencao')    labelHtml = '<span class="psico-label psico-label--atencao"><i class="ti ti-alert-triangle" style="font-size:10px;"></i> Atenção</span>';
      if (a.label === 'observacao') labelHtml = '<span class="psico-label psico-label--observacao"><i class="ti ti-eye" style="font-size:10px;"></i> Observação</span>';
      return '<div class="psico-entry">' +
        '<div class="psico-entry__head">' +
          '<div class="psico-entry__date"><i class="ti ti-calendar-event"></i> ' + dataFmt + '</div>' +
          '<span class="psico-tipo psico-tipo--' + cls + '">' + a.tipo + '</span>' +
          labelHtml +
          '<div class="psico-entry__psi"><i class="ti ti-user-heart"></i> ' + a.psi + '</div>' +
        '</div>' +
        '<div class="psico-entry__body">' + a.texto + '</div>' +
      '</div>';
    }).join('');
  }

  window.pickLabel = function (btn) {
    var picker = document.getElementById('pf-label-picker');
    if (picker) picker.querySelectorAll('.psico-label-btn').forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    var hiddenEl = document.getElementById('pf-label');
    if (hiddenEl) hiddenEl.value = btn.dataset.label;
  };

  window.registrarAnotacao = function () {
    var dataEl  = document.getElementById('pf-data');
    var tipoEl  = document.getElementById('pf-tipo');
    var psiEl   = document.getElementById('pf-psi');
    var textoEl = document.getElementById('pf-texto');
    if (!dataEl || !tipoEl || !psiEl || !textoEl) return;

    var data  = dataEl.value;
    var tipo  = tipoEl.value;
    var psi   = psiEl.value.trim();
    var texto = textoEl.value.trim();
    var label = (document.getElementById('pf-label') || {}).value || '';

    if (!data || !tipo || !psi || !texto) {
      var errEl = document.getElementById('psico-form-error');
      if (!errEl) {
        errEl          = document.createElement('div');
        errEl.id       = 'psico-form-error';
        errEl.style.cssText = 'color:#E24B4A;font-size:11px;font-weight:600;padding:4px 0;display:none;';
        var actions = document.querySelector('.psico-form__actions');
        if (actions) actions.prepend(errEl);
      }
      errEl.textContent   = 'Preencha todos os campos antes de registrar.';
      errEl.style.display = 'block';
      setTimeout(function () { if (errEl) errEl.style.display = 'none'; }, 3500);
      return;
    }

    anotacoes.push({ data: data, tipo: tipo, psi: psi, texto: texto, label: label });
    renderLista();

    tipoEl.value  = '';
    psiEl.value   = '';
    textoEl.value = '';
    dataEl.value  = new Date().toISOString().split('T')[0];

    /* reset label picker */
    var picker = document.getElementById('pf-label-picker');
    if (picker) {
      picker.querySelectorAll('.psico-label-btn').forEach(function (b) { b.classList.remove('selected'); });
      var nenhum = picker.querySelector('[data-label=""]');
      if (nenhum) nenhum.classList.add('selected');
    }
    var hiddenEl = document.getElementById('pf-label');
    if (hiddenEl) hiddenEl.value = '';

    var t = document.getElementById('toast-hist');
    if (t) { t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 3000); }
  };

})();
