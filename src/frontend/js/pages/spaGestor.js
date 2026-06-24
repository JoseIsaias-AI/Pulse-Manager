(function () {
  'use strict';

  function gestorApi() {
    if (!window.PulseApi) {
      const message = 'Cliente HTTP central nao carregado. Verifique se api.js foi incluido antes de spaGestor.js.';
      console.error('[spaGestor]', message);
      throw new Error(message);
    }

    return window.PulseApi;
  }

  /* ── VIEWS ────────────────────────────────────────────────── */
  const VIEWS = ['inicio', 'alunos', 'dashboard', 'agenda', 'atualizacoes', 'configuracoes'];
  const chartInited = { inicio: false, alunos: false, dashboard: false, agenda: false, atualizacoes: false, configuracoes: false };

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

    document.querySelectorAll('.menuLateral__item[data-page]').forEach(item => {
      item.classList.toggle('menuLateral__item--active', item.dataset.page === id);
    });

    const url = new URL(window.location.href);
    url.searchParams.set('view', id);
    window.history.replaceState({}, '', url);

    // Barra de busca: visível apenas na aba Alunos
    const search = document.getElementById('top-search');
    if (search) search.style.display = id === 'alunos' ? '' : 'none';

    // Inicializa gráficos na primeira exibição (só para views com gráficos)
    if (!chartInited[id]) {
      chartInited[id] = true;
      if (id === 'inicio')    initInicioView();
      if (id === 'alunos')    initAlunosView();
      if (id === 'dashboard') initDashboardView();
      if (id === 'agenda')    initAgendaView();
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

    /* Aba "Notas e Presença" — tipo filtra atividade, "sem nota" desabilita o campo */
    const tipoSelect = document.getElementById('pf-registro-tipo');
    if (tipoSelect) {
      tipoSelect.addEventListener('change', () => populateAtividadeSelect(tipoSelect.value));
    }
    const semNotaCheckbox = document.getElementById('pf-registro-sem-nota');
    if (semNotaCheckbox) {
      semNotaCheckbox.addEventListener('change', updateRegistroNotaState);
    }
  });

  /* ── ROTEADOR — hook chamado por guiaBase.js ──────────────── */
  window.__onMenuNav = function (pageId) {
    if (VIEWS.includes(pageId)) showView(pageId);
  };

  /* ── INICIALIZAR VIEW PADRÃO ──────────────────────────────── */
  const requestedView = new URLSearchParams(window.location.search).get('view');
  showView(VIEWS.includes(requestedView) ? requestedView : 'inicio');

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

    /* ── Próximos Eventos (mesmos da Agenda de Junho 2026) ── */
    const AGENDA_EVENTS = [
      { title:'Check-in Semanal',   start:'2026-06-03', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'09:00' },
      { title:'Módulo 3 – Entrega', start:'2026-06-09', type:'aula',     color:'#F4A261', sender:'Carlos Mendes',  role:'Gestor',    time:'08:00' },
      { title:'Reunião de Módulo',  start:'2026-06-11', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'14:00' },
      { title:'Mentoria: Tiago R.', start:'2026-06-16', type:'mentoria', color:'#33B458', sender:'João Mário',     role:'Psicólogo', time:'10:00' },
      { title:'Check-in Semanal',   start:'2026-06-17', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'09:00' },
      { title:'Consulta: Sofia C.', start:'2026-06-18', type:'consulta', color:'#7B4FD9', sender:'João Mário',     role:'Psicólogo', time:'11:00' },
      { title:'Check-in Semanal',   start:'2026-06-24', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'09:00' },
      { title:'Sprint Review',      start:'2026-06-25', type:'evento',   color:'#33B458', sender:'Carlos Mendes',  role:'Gestor',    time:'15:00' },
      { title:'Formatura T4',       start:'2026-06-30', type:'evento',   color:'#FFD927', sender:'Ana Clara',      role:'Gestora',   time:'18:00' },
    ];
    const hojeInicio = new Date();
    const TODAY_STR  = `${hojeInicio.getFullYear()}-${String(hojeInicio.getMonth() + 1).padStart(2, '0')}-${String(hojeInicio.getDate()).padStart(2, '0')}`;
    const TYPE_LABEL_EV = { evento:'Evento', consulta:'Consulta', aula:'Aula', mentoria:'Mentoria' };
    const MONTH_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    function fmtEventDate(str) {
      const [,m,d] = str.split('-');
      return `${parseInt(d)} ${MONTH_ABREV[parseInt(m)-1]}`;
    }

    const upcoming = AGENDA_EVENTS.filter(ev => ev.start >= TODAY_STR);

    document.getElementById('activity-list').innerHTML = upcoming.map(ev => {
      const isToday  = ev.start === TODAY_STR;
      const dateLbl  = isToday ? 'Hoje' : fmtEventDate(ev.start);
      const isYellow = ev.color === '#FFD927';
      const tagColor = isYellow ? '#7a5a00' : ev.color;
      const tagBg    = isYellow ? 'rgba(255,217,39,.2)' : ev.color + '18';
      const occColor = ev.role === 'Psicólogo' ? '#7B4FD9' : '#003870';
      const occBg    = ev.role === 'Psicólogo' ? 'rgba(123,79,217,.1)' : 'rgba(0,56,112,.1)';
      return `
        <div class="activity-item">
          <div style="width:10px;height:10px;border-radius:50%;background:${ev.color};flex-shrink:0;margin-top:4px;"></div>
          <div class="activity-body">
            <div class="activity-name">${ev.title}</div>
            <div class="activity-time">${dateLbl} · ${ev.time} &nbsp;·&nbsp; ${ev.sender} <span style="font-size:10px;font-weight:600;padding:1px 7px;border-radius:999px;background:${occBg};color:${occColor};margin-left:2px;">${ev.role}</span></div>
          </div>
          <span class="tag" style="background:${tagBg};color:${tagColor};border:1px solid ${tagColor}30;">${TYPE_LABEL_EV[ev.type]}</span>
        </div>`;
    }).join('');

    document.getElementById('pg-total').textContent = `${upcoming.length} eventos em junho`;
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: ALUNOS
  ════════════════════════════════════════════════════════════ */
  function bindIntegratedCsvActions() {
    const input = document.getElementById('al-csv-file');
    const importBtn = document.getElementById('al-import-csv');
    const exportBtn = document.getElementById('al-export-csv');
    const status = document.getElementById('al-import-status');

    function showStatus(message, isError) {
      if (!status) return;
      status.classList.toggle('is-error', Boolean(isError));
      status.style.display = 'block';
      status.innerHTML = message;
    }

    if (importBtn && input && !importBtn.dataset.csvBound) {
      importBtn.dataset.csvBound = 'true';
      importBtn.addEventListener('click', () => input.click());
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
          showStatus('Escolha um arquivo no formato <strong>.csv</strong>.', true);
          input.value = '';
          return;
        }

        try {
          importBtn.disabled = true;
          importBtn.innerHTML = '<i class="ti ti-loader-2" style="font-size:13px;"></i> Importando...';
          const result = await window.PulseApi.importarAlunosCsv(await file.text());
          const data = result.data;
          const erros = data.erros?.length ? ` ${data.erros.length} linha(s) com erro.` : '';

          showStatus(
            `<strong>CSV processado:</strong> ${data.importados} novo(s), ${data.atualizados} atualizado(s), ${data.ignorados} ignorado(s).${erros}`,
            false
          );

          if (window.refreshListaAlunosView) {
            await window.refreshListaAlunosView();
          }
        } catch (error) {
          showStatus(error.message || 'Não foi possível importar o CSV.', true);
        } finally {
          importBtn.disabled = false;
          importBtn.innerHTML = '<i class="ti ti-upload" style="font-size:13px;"></i> Importar CSV';
          input.value = '';
        }
      });
    }

    if (exportBtn && !exportBtn.dataset.csvBound) {
      exportBtn.dataset.csvBound = 'true';
      exportBtn.addEventListener('click', async () => {
        try {
          exportBtn.disabled = true;
          exportBtn.innerHTML = '<i class="ti ti-loader-2" style="font-size:13px;"></i> Exportando...';
          const blob = await window.PulseApi.exportarAlunosCsv();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'alunos.csv';
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          showStatus('<strong>Exportação pronta:</strong> o arquivo alunos.csv foi gerado.', false);
        } catch (error) {
          showStatus(error.message || 'Não foi possível exportar o CSV.', true);
        } finally {
          exportBtn.disabled = false;
          exportBtn.innerHTML = '<i class="ti ti-download" style="font-size:13px;"></i> Exportar CSV';
        }
      });
    }
  }

  function initAlunosView() {
    bindIntegratedCsvActions();

    if (window.initListaAlunosView) {
      window.initListaAlunosView({ onSelect: openStudentProfile });
      return;
    }

    const PER_PAGE = 9;
    const TOTAL    = 18;
    let curPage      = 1;
    let filterCourse = 'all';
    let desempSort   = 'none'; // 'none' | 'desc' | 'asc'  — ordena por pct
    let notaSort     = 'none'; // 'none' | 'desc' | 'asc'  — ordena por nota média
    let engSort      = 'none'; // 'none' | 'desc' | 'asc'  — ordena por engajamento
    let nameSort     = 'none'; // 'none' | 'az'   | 'za'

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

    const COURSES = ['Todos', ...new Set(STUDENTS.map(s => s.techCourse || '—'))];
    let courseIdx = 0;

    const BAR  = { ativa:'c-green', risco:'c-red', empregado:'c-green', inativo:'c-gray', atencao:'c-amber' };
    const SLBL = { risco:'⚠ em risco', atencao:'! atenção' };
    const PROB = new Set(['risco', 'atencao']);

    function getList() {
      let list = STUDENTS.slice();
      if (filterCourse !== 'all') list = list.filter(s => (s.techCourse || '—') === filterCourse);
      if (desempSort === 'desc') list.sort((a, b) => b.pct  - a.pct);
      if (desempSort === 'asc')  list.sort((a, b) => a.pct  - b.pct);
      if (notaSort  === 'desc')  list.sort((a, b) => b.nota - a.nota);
      if (notaSort  === 'asc')   list.sort((a, b) => a.nota - b.nota);
      if (engSort   === 'desc')  list.sort((a, b) => b.eng  - a.eng);
      if (engSort   === 'asc')   list.sort((a, b) => a.eng  - b.eng);
      if (nameSort  === 'az')    list.sort((a, b) => a.name.localeCompare(b.name, 'pt'));
      if (nameSort  === 'za')    list.sort((a, b) => b.name.localeCompare(a.name, 'pt'));
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

      grid.innerHTML = slice.map(s => `
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
        </div>
      `).join('');

      /* Click no card → overlay de perfil */
      grid.querySelectorAll('.al-card').forEach((card, i) => {
        card.addEventListener('click', function () {
          openStudentProfile(slice[i]);
        });
      });

      /* Paginação */
      const totalPages = Math.ceil(total / PER_PAGE);
      const info = document.getElementById('al-pag-info');
      const displayTotal = filterCourse === 'all' ? TOTAL : total;
      if (info) info.textContent =
        `Exibindo ${start + 1}–${Math.min(start + PER_PAGE, total)} de ${displayTotal} alunos`;

      const nums = document.getElementById('al-pag-nums');
      if (nums) {
        nums.innerHTML = '';
        const show = new Set(
          [1, page - 1, page, page + 1, totalPages]
            .filter(p => p >= 1 && p <= totalPages)
        );
        let prev = 0;
        [...show].sort((a, b) => a - b).forEach(p => {
          if (prev && p - prev > 1) {
            const ell = document.createElement('span');
            ell.textContent = '…';
            ell.style.cssText = 'font-size:11px;color:#97A1AE;padding:0 2px;line-height:26px;';
            nums.appendChild(ell);
          }
          const btn = document.createElement('button');
          btn.className = 'al-pag-btn' + (p === page ? ' active' : '');
          btn.textContent = p;
          btn.addEventListener('click', () => renderPage(p));
          nums.appendChild(btn);
          prev = p;
        });
      }

      const prevBtn = document.getElementById('al-prev');
      const nextBtn = document.getElementById('al-next');
      if (prevBtn) prevBtn.disabled = page === 1;
      if (nextBtn) nextBtn.disabled = page >= totalPages;
    }

    /* ── Botões de filtro e ordenação ──────────────────────── */
    const btnCurso  = document.getElementById('btn-curso');
    const btnDesemp = document.getElementById('btn-desemp');
    const btnNota   = document.getElementById('btn-nota');
    const btnEng    = document.getElementById('btn-eng');
    const btnOrd    = document.getElementById('btn-ord');
    let desempIdx = 0, notaIdx = 0, engIdx = 0, nameSortIdx = 0;

    /* Reseta todos os sorts exceto o informado */
    function resetSortBtns(except) {
      if (except !== 'desemp') { desempSort = 'none'; desempIdx = 0; if (btnDesemp) { btnDesemp.textContent = 'Desempenho';  btnDesemp.classList.remove('al-filter-btn--active'); } }
      if (except !== 'nota')   { notaSort   = 'none'; notaIdx   = 0; if (btnNota)   { btnNota.textContent   = 'Nota Média';  btnNota.classList.remove('al-filter-btn--active'); } }
      if (except !== 'eng')    { engSort    = 'none'; engIdx    = 0; if (btnEng)    { btnEng.textContent    = 'Engajamento'; btnEng.classList.remove('al-filter-btn--active'); } }
      if (except !== 'name')   { nameSort   = 'none'; nameSortIdx = 0;
        if (btnOrd) { btnOrd.innerHTML = '<i class="ti ti-adjustments-horizontal" style="font-size:11px;"></i> Ordenar'; btnOrd.classList.remove('al-filter-btn--active'); }
      }
    }

    /* Curso */
    if (btnCurso) btnCurso.addEventListener('click', function () {
      courseIdx    = (courseIdx + 1) % COURSES.length;
      filterCourse = courseIdx === 0 ? 'all' : COURSES[courseIdx];
      this.textContent = courseIdx === 0 ? 'Curso' : COURSES[courseIdx];
      this.classList.toggle('al-filter-btn--active', courseIdx !== 0);
      renderPage(1);
    });

    /* Desempenho — ordena por pct */
    if (btnDesemp) btnDesemp.addEventListener('click', function () {
      desempIdx  = (desempIdx + 1) % 3;
      desempSort = ['none', 'desc', 'asc'][desempIdx];
      resetSortBtns('desemp');
      this.textContent = ['Desempenho', 'Desempenho ↑', 'Desempenho ↓'][desempIdx];
      this.classList.toggle('al-filter-btn--active', desempIdx !== 0);
      renderPage(1);
    });

    /* Nota Média — ordena por nota */
    if (btnNota) btnNota.addEventListener('click', function () {
      notaIdx  = (notaIdx + 1) % 3;
      notaSort = ['none', 'desc', 'asc'][notaIdx];
      resetSortBtns('nota');
      this.textContent = ['Nota Média', 'Nota Média ↑', 'Nota Média ↓'][notaIdx];
      this.classList.toggle('al-filter-btn--active', notaIdx !== 0);
      renderPage(1);
    });

    /* Engajamento — ordena por eng */
    if (btnEng) btnEng.addEventListener('click', function () {
      engIdx  = (engIdx + 1) % 3;
      engSort = ['none', 'desc', 'asc'][engIdx];
      resetSortBtns('eng');
      this.textContent = ['Engajamento', 'Engajamento ↑', 'Engajamento ↓'][engIdx];
      this.classList.toggle('al-filter-btn--active', engIdx !== 0);
      renderPage(1);
    });

    /* Ordenar por nome */
    if (btnOrd) btnOrd.addEventListener('click', function () {
      nameSortIdx = (nameSortIdx + 1) % 3;
      nameSort    = ['none', 'az', 'za'][nameSortIdx];
      resetSortBtns('name');
      this.innerHTML = `<i class="ti ti-adjustments-horizontal" style="font-size:11px;"></i> ${['Ordenar', 'A → Z', 'Z → A'][nameSortIdx]}`;
      this.classList.toggle('al-filter-btn--active', nameSortIdx !== 0);
      renderPage(1);
    });

    /* ── Paginação ──────────────────────────────────────────── */
    document.getElementById('al-prev').addEventListener('click', () => renderPage(curPage - 1));
    document.getElementById('al-next').addEventListener('click', () => renderPage(curPage + 1));
    renderPage(1);
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: DASHBOARD (dashboardGestor) — Dados Pulse Mais 2022–2025
  ════════════════════════════════════════════════════════════ */
  function initDashboardView() {
    if (window.initDashboardGestorApp) {
      window.initDashboardGestorApp();
      return;
    }

    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size   = 11;

    /* ── Funil de Impacto (horizontal bar) ─────────────────── */
    new Chart(document.getElementById('g-funnelChart'), {
      type: 'bar',
      data: {
        labels: ['Conectados', 'Capacitados', 'Transformados'],
        datasets: [{
          data: [528, 126, 60],
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
          tooltip: { callbacks: { label: c => ` ${c.raw} jovens` } }
        },
        scales: {
          x: { min: 0, max: 600, ticks: { color: '#97A1AE', stepSize: 100 }, grid: { color: '#F0F3F7' }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: '#6B7684', font: { weight: '600', size: 11 } }, border: { display: false },
               afterFit(s) { s.width = 115; } }
        }
      }
    });

    /* ── Jovens Atingidos — Histórico ──────────────────────── */
    new Chart(document.getElementById('g-historicoChart'), {
      type: 'bar',
      data: {
        labels: ['2022', '2023', '2024', '2025'],
        datasets: [{
          data: [73, 46, 401, 605],
          backgroundColor: ['#003870', '#7B4FD9', '#F4A261', '#FFD927'],
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
          tooltip: { callbacks: { label: c => ` ${c.raw} jovens` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 0, ticks: { color: '#97A1AE', stepSize: 150 }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });

    /* ── Jovens Empregados — Evolução ──────────────────────── */
    new Chart(document.getElementById('g-empregadosChart'), {
      type: 'bar',
      data: {
        labels: ['2023', '2024', '2025', 'Meta 2026'],
        datasets: [{
          data: [15, 26, 45, 65],
          backgroundColor: ['#003870', '#003870', '#33B458', 'rgba(255,217,39,.65)'],
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.55,
          borderColor:   ['transparent','transparent','transparent','#FFD927'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.raw} jovens` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 0, ticks: { color: '#97A1AE', stepSize: 20 }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });

    /* ── Autodeclaração Racial (doughnut) ──────────────────── */
    new Chart(document.getElementById('g-racialChart'), {
      type: 'doughnut',
      data: {
        labels: ['Parda', 'Branca', 'Preta', 'Não declarado', 'Amarela'],
        datasets: [{
          data: [43.9, 39.3, 13.1, 2.8, 0.9],
          backgroundColor: ['#33B458', '#003870', '#E24B4A', '#97A1AE', '#FFD927'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              font: { size: 10, family: "'Poppins', sans-serif" },
              color: '#6B7684',
              boxWidth: 10,
              boxHeight: 10,
              padding: 8,
              generateLabels(chart) {
                const data = chart.data;
                return data.labels.map((label, i) => ({
                  text: `${label}  ${data.datasets[0].data[i]}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: '#fff',
                  lineWidth: 2,
                  index: i
                }));
              }
            }
          },
          tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw}%` } }
        }
      }
    });

    /* ── Faixa de Renda Familiar (horizontal bar) ──────────── */
    new Chart(document.getElementById('g-rendaChart'), {
      type: 'bar',
      data: {
        labels: ['até 0,9 SM', '0,9 – 1,4 SM', '1,4 – 2,0 SM'],
        datasets: [{
          data: [44, 41, 16],
          backgroundColor: ['#33B458', '#003870', '#FFD927'],
          borderRadius: 6,
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
          tooltip: { callbacks: { label: c => ` ${c.raw}%` } }
        },
        scales: {
          x: { min: 0, max: 55, ticks: { color: '#97A1AE', callback: v => v + '%' }, grid: { color: '#F0F3F7' }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: '#6B7684', font: { size: 10 } }, border: { display: false },
               afterFit(s) { s.width = 90; } }
        }
      }
    });
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: AGENDA
  ════════════════════════════════════════════════════════════ */
  function initAgendaView() {
    if (window.initAgendaGestorApp) {
      window.initAgendaGestorApp();
      return;
    }

    const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const WD_LABELS   = ['D','S','T','Q','Q','S','S'];
    const TYPE_COLOR  = { evento:'#003870', consulta:'#7B4FD9', aula:'#F4A261', mentoria:'#33B458' };
    const TYPE_LABEL  = { evento:'Evento', consulta:'Consulta', aula:'Aula', mentoria:'Mentoria' };
    const today       = new Date();

    let viewYear  = today.getFullYear();
    let viewMonth = today.getMonth();
    let selectedId = null;
    let selectedDate = null;

    let events = [
      { id:1, title:'Check-in Semanal',    start:'2026-06-03', end:'2026-06-03', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'09:00', desc:'Check-in semanal com todos os alunos da turma T4.',              target:'todos'        },
      { id:2, title:'Módulo 3 – Entrega',  start:'2026-06-09', end:'2026-06-13', type:'aula',     color:'#F4A261', sender:'Carlos Mendes',  role:'Gestor',    time:'08:00', desc:'Período de entrega das atividades do Módulo 3.',                 target:'todos'        },
      { id:3, title:'Reunião de Módulo',   start:'2026-06-11', end:'2026-06-11', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'14:00', desc:'Reunião de alinhamento sobre o andamento do Módulo 3.',          target:'todos'        },
      { id:4, title:'Mentoria: Tiago R.', start:'2026-06-16', end:'2026-06-16', type:'mentoria', color:'#33B458', sender:'João Mário',     role:'Psicólogo', time:'10:00', desc:'Sessão de mentoria individual com Tiago Ribeiro.',               target:'PM-2024-950'  },
      { id:5, title:'Check-in Semanal',    start:'2026-06-17', end:'2026-06-17', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'09:00', desc:'Check-in semanal com todos os alunos da turma T4.',              target:'todos'        },
      { id:6, title:'Consulta: Sofia C.', start:'2026-06-18', end:'2026-06-18', type:'consulta', color:'#7B4FD9', sender:'João Mário',     role:'Psicólogo', time:'11:00', desc:'Consulta psicológica individual com Sofia Carvalho.',            target:'PM-2024-876'  },
      { id:7, title:'Check-in Semanal',    start:'2026-06-24', end:'2026-06-24', type:'evento',   color:'#003870', sender:'Ana Clara',      role:'Gestora',   time:'09:00', desc:'Check-in semanal com todos os alunos da turma T4.',              target:'todos'        },
      { id:8, title:'Sprint Review',       start:'2026-06-25', end:'2026-06-25', type:'evento',   color:'#33B458', sender:'Carlos Mendes',  role:'Gestor',    time:'15:00', desc:'Sprint Review do ciclo 4 — apresentação dos projetos dos alunos.', target:'todos'       },
      { id:9, title:'Formatura T4',        start:'2026-06-30', end:'2026-06-30', type:'evento',   color:'#FFD927', sender:'Ana Clara',      role:'Gestora',   time:'18:00', desc:'Cerimônia de formatura da Turma 4 do Programa Pulse Mais.',       target:'todos'        },
    ];

    function toDate(str) { const [y,m,d] = str.split('-').map(Number); return new Date(y,m-1,d); }
    function toStr(d)    { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
    const todayStr = toStr(today);
    selectedDate = todayStr;
    function formatDate(str) {
      const d = toDate(str);
      return `${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`;
    }
    function eventsForDay(dateStr) {
      return events
        .filter(ev => ev.start <= dateStr && ev.end >= dateStr)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }

    function renderCal() {
      const calEl = document.getElementById('ag-cal');
      if (!calEl) return;

      const firstDow   = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMon  = new Date(viewYear, viewMonth + 1, 0).getDate();
      const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

      /* Build 5–6 week rows of cells */
      const cells = [];
      for (let i = 0; i < firstDow; i++)
        cells.push({ d: new Date(viewYear, viewMonth - 1, daysInPrev - firstDow + 1 + i), other: true });
      for (let i = 1; i <= daysInMon; i++)
        cells.push({ d: new Date(viewYear, viewMonth, i), other: false });
      while (cells.length % 7 !== 0)
        cells.push({ d: new Date(viewYear, viewMonth + 1, cells.length - firstDow - daysInMon + 1), other: true });

      const weeks = [];
      for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

      /* For a given week, return event segments sorted by start col */
      function weekSegments(week) {
        const wS = toStr(week[0].d), wE = toStr(week[6].d);
        const segs = [];
        events.forEach(ev => {
          if (ev.end < wS || ev.start > wE) return;
          const segS = ev.start < wS ? wS : ev.start;
          const segE = ev.end   > wE ? wE : ev.end;
          const col  = week.findIndex(c => toStr(c.d) === segS);
          const endC = week.findIndex(c => toStr(c.d) === segE);
          if (col < 0) return;
          const span = (endC < 0 ? 6 : endC) - col + 1;
          segs.push({ ev, col, span, isFirst: ev.start === segS, isLast: ev.end === segE });
        });
        return segs;
      }

      /* Assign event rows (stack overlapping events) */
      function assignRows(segs) {
        const rows = []; // rows[r] = array<seg>
        const occ  = []; // occ[r][col] = occupied?
        segs.sort((a, b) => a.col - b.col).forEach(seg => {
          let r = 0;
          while (true) {
            if (!occ[r]) occ[r] = new Array(7).fill(false);
            const free = !Array.from({length: seg.span}, (_, k) => seg.col + k).some(c => occ[r][c]);
            if (free) {
              for (let k = 0; k < seg.span; k++) occ[r][seg.col + k] = true;
              if (!rows[r]) rows[r] = [];
              rows[r].push(seg);
              break;
            }
            r++;
          }
        });
        return rows;
      }

      let html = `
        <div class="ag-cal-header">
          <span class="ag-cal-title">${MONTH_NAMES[viewMonth]} ${viewYear}</span>
          <div class="ag-cal-nav">
            <button class="ag-cal-nav-btn" id="ag-prev"><i class="ti ti-chevron-left"></i></button>
            <button class="ag-cal-nav-btn" id="ag-next"><i class="ti ti-chevron-right"></i></button>
          </div>
        </div>
        <div class="ag-cal-weekdays">
          ${WD_LABELS.map((w,i) => `<div class="ag-cal-wd${i===0||i===6?' weekend':''}">${w}</div>`).join('')}
        </div>
        <div class="ag-cal-body">`;

      weeks.forEach(week => {
        const segs = weekSegments(week);
        const rows = assignRows(segs);

        /* Day-number row */
        html += `<div class="ag-week"><div class="ag-week-days">`;
        week.forEach((cell, i) => {
          const dStr   = toStr(cell.d);
          const isToday = dStr === todayStr;
          const isWkd  = i === 0 || i === 6;
          const hasEvents = eventsForDay(dStr).length > 0;
          html += `<div class="ag-cell${cell.other ? ' other-month' : ''}${dStr === selectedDate ? ' selected-day' : ''}${hasEvents ? ' has-events' : ''}" data-date="${dStr}">
            <div class="ag-day-num${isToday ? ' today' : ''}${isWkd && !isToday ? ' weekend' : ''}">${cell.d.getDate()}</div>
          </div>`;
        });
        html += `</div>`; // .ag-week-days

        /* Event rows */
        html += `<div class="ag-week-events">`;
        rows.forEach(rowSegs => {
          html += `<div class="ag-ev-row">`;
          let lastEnd = 0;
          rowSegs.sort((a, b) => a.col - b.col).forEach(({ ev, col, span, isFirst, isLast }) => {
            if (col > lastEnd) html += `<div style="grid-column:${lastEnd+1}/span ${col-lastEnd}"></div>`;
            const isSingle   = isFirst && isLast;
            const spanClass  = isSingle ? '' : isFirst ? ' span-start' : isLast ? ' span-end' : ' span-mid';
            const textColor  = ev.color === '#FFD927' ? 'color:#003870;' : '';
            const sel        = selectedId === ev.id ? ' selected' : '';
            html += `<div class="ag-event${spanClass}${sel}" style="grid-column:${col+1}/span ${span};background:${ev.color};${textColor}" data-ev-id="${ev.id}">${isFirst ? ev.title : ''}</div>`;
            lastEnd = col + span;
          });
          html += `</div>`; // .ag-ev-row
        });
        html += `</div></div>`; // .ag-week-events .ag-week
      });

      html += `</div><div class="ag-cal-footer">Hoje: ${today.getDate()} de ${MONTH_NAMES[today.getMonth()]} de ${today.getFullYear()}</div>`;
      calEl.innerHTML = html;

      calEl.querySelector('#ag-prev')?.addEventListener('click', () => {
        if (--viewMonth < 0) { viewMonth = 11; viewYear--; } renderCal();
      });
      calEl.querySelector('#ag-next')?.addEventListener('click', () => {
        if (++viewMonth > 11) { viewMonth = 0; viewYear++; } renderCal();
      });
      calEl.querySelectorAll('.ag-event').forEach(el => {
        el.addEventListener('click', e => {
          e.stopPropagation();
          selectedId = parseInt(el.dataset.evId);
          const ev = events.find(item => item.id === selectedId);
          if (ev) selectedDate = ev.start;
          showDetail(selectedId);
          renderCal();
        });
      });
      calEl.querySelectorAll('.ag-cell[data-date]').forEach(el => {
        el.addEventListener('click', () => {
          selectedId = null;
          selectedDate = el.dataset.date;
          renderCal();
          showDayDetail(selectedDate);
        });
      });
    }

    function showDayDetail(dateStr) {
      const box = document.getElementById('ag-detail');
      if (!box) return;
      const dayEvents = eventsForDay(dateStr);
      const itemsHtml = dayEvents.length
        ? dayEvents.map(ev => {
            const tc = TYPE_COLOR[ev.type] || '#003870';
            const targetStr = ev.target === 'todos' ? 'Todos os alunos' : ev.target;
            return `<button class="ag-day-event" type="button" data-ev-id="${ev.id}">
              <span class="ag-day-event-time">${ev.time || '--:--'}</span>
              <span class="ag-day-event-dot" style="background:${tc};"></span>
              <span class="ag-day-event-main">
                <strong>${ev.title}</strong>
                <small>${TYPE_LABEL[ev.type] || ev.type} · ${targetStr}</small>
              </span>
              <i class="ti ti-chevron-right"></i>
            </button>`;
          }).join('')
        : `<div class="ag-day-empty">
            <i class="ti ti-calendar-off"></i>
            <strong>Nenhum evento neste dia</strong>
          </div>`;

      box.innerHTML = `
        <div class="ag-detail-header">
          <div>
            <div class="ag-detail-kicker">Agenda do dia</div>
            <div class="ag-detail-title">${formatDate(dateStr)}</div>
          </div>
          <button class="ag-detail-close" onclick="document.getElementById('ag-detail').classList.remove('open');"><i class="ti ti-x"></i></button>
        </div>
        <div class="ag-day-list">${itemsHtml}</div>`;
      box.classList.add('open');
      box.querySelectorAll('.ag-day-event').forEach(el => {
        el.addEventListener('click', () => {
          selectedId = parseInt(el.dataset.evId);
          showDetail(selectedId);
          renderCal();
        });
      });
    }

    function showDetail(id) {
      const ev  = events.find(e => e.id === id);
      const box = document.getElementById('ag-detail');
      if (!ev || !box) return;
      selectedDate = ev.start;

      const startD  = toDate(ev.start), endD = toDate(ev.end);
      const sameDay = ev.start === ev.end;
      const dateStr = sameDay
        ? `${startD.getDate()} de ${MONTH_NAMES[startD.getMonth()]} · ${ev.time}`
        : `${startD.getDate()}–${endD.getDate()} de ${MONTH_NAMES[startD.getMonth()]}`;
      const targetStr = ev.target === 'todos'  ? 'Todos os alunos'
                      : ev.target.startsWith('PM-') ? `Aluno ${ev.target}`
                      : ev.target;
      const tc  = TYPE_COLOR[ev.type] || '#003870';
      const tl  = TYPE_LABEL[ev.type] || ev.type;

      box.innerHTML = `
        <div class="ag-detail-header">
          <div>
            <div class="ag-detail-kicker">Detalhe do evento</div>
            <div class="ag-detail-title">${ev.title}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="ag-detail-type" style="background:${tc}20;color:${tc};">${tl}</span>
            <button class="ag-detail-close" onclick="document.getElementById('ag-detail').classList.remove('open');"><i class="ti ti-x"></i></button>
          </div>
        </div>
        <div class="ag-detail-row">
          <div class="ag-detail-item"><i class="ti ti-calendar"></i>${dateStr}</div>
          <div class="ag-detail-item"><i class="ti ti-user"></i>${ev.sender} · ${ev.role}</div>
          <div class="ag-detail-item"><i class="ti ti-users"></i>${targetStr}</div>
        </div>
        <div class="ag-detail-desc">${ev.desc}</div>`;
      box.classList.add('open');
    }

    renderCal();

    /* ── Formulário: campo condicional de destinatário ── */
    window.agUpdateTargetField = function () {
      return null;
    };

    /* ── Formulário: adicionar evento ── */
    window.agAddEvent = function () {
      const registro = document.getElementById('ag-f-registro')?.value.trim();
      const tipoUser = document.getElementById('ag-f-tipo-user')?.value;
      const date = document.getElementById('ag-f-date')?.value;
      const horaInicio = document.getElementById('ag-f-start')?.value;
      const horaFim = document.getElementById('ag-f-end')?.value;
      const status = document.getElementById('ag-f-status')?.value;

      /* Validação */
      let ok = true;
      [['ag-f-registro', registro], ['ag-f-tipo-user', tipoUser], ['ag-f-date', date]].forEach(([id, v]) => {
        const el = document.getElementById(id);
        if (!v) { el?.classList.add('ag-val-err'); ok = false; }
        else    el?.classList.remove('ag-val-err');
      });
      if (!ok) return;

      const newEv = {
        id: Date.now(),
        title: registro,
        start: date, end: date,
        type: tipoUser === 'aluno' ? 'mentoria' : 'evento',
        color: tipoUser === 'aluno' ? TYPE_COLOR.mentoria : TYPE_COLOR.evento,
        sender: tipoUser === 'aluno' ? 'Aluno' : 'Membro da equipe',
        role: tipoUser === 'aluno' ? 'Aluno' : 'Membro da equipe',
        time: horaInicio || '—',
        desc: `Pré-visualização: ${registro}. Horário: ${horaInicio || 'não informado'}${horaFim ? ` até ${horaFim}` : ''}. Status: ${status || 1}.`,
        target: tipoUser === 'aluno' ? 'Aluno' : 'Membro da equipe',
      };
      events.push(newEv);

      /* Limpa formulário */
      ['ag-f-registro','ag-f-tipo-user','ag-f-date','ag-f-start','ag-f-end','ag-f-status'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });

      /* Navega para o mês do evento e seleciona */
      const [y, m] = date.split('-').map(Number);
      viewYear = y; viewMonth = m - 1;
      selectedId = newEv.id;
      selectedDate = date;
      renderCal();
      showDayDetail(date);
    };
  }

  /* ════════════════════════════════════════════════════════════
     OVERLAY: PERFIL DO ALUNO
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
    'Mercado de Trabalho: Preparação, Conexão e Vivências':   'Mercado de Trabalho',
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

  const PERFIL_FIELD_CONFIG = {
    nome: { required: true },
    email: { required: true },
    telefone: { nullable: true },
    idade: { number: true, integer: true, nullable: true },
    genero: { token: true, nullable: true },
    status: { token: true, skipEmpty: true },
    dataIngresso: { skipEmpty: true },
    curso: { nullable: true },
    escolaridade: { nullable: true },
    ocupacao: { nullable: true },
    programa: { skipEmpty: true },
    perfilSocioeconomico: { nullable: true },
    rendaMensal: { number: true, nullable: true },
    nivelJornada: { nullable: true },
    categoria: { skipEmpty: true },
    tipoVinculoEmpregaticio: { nullable: true },
    origemParticipacao: { nullable: true },
    riscoEvasao: { token: true, skipEmpty: true }
  };

  let currentPerfilStudent = null;
  let currentPerfilAluno = null;
  let currentAtividades = [];
  let perfilOptions = null;
  let perfilOptionsPromise = null;

  function normalizeToken(value) {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '_');
  }

  function formatPerfilLabel(value) {
    const text = String(value ?? '').trim();
    if (!text) return 'Não informado';
    return text
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function perfilOptionLabel(value) {
    const exactLabels = {
      nao_informado: 'Não informado',
      sem_categoria: 'Sem categoria',
      em_acompanhamento: 'Em acompanhamento',
      nao_binario: 'Não binário',
      prefiro_nao_informar: 'Prefiro não informar',
      programa_pulse_mais: 'Programa Pulse Mais',
      ex_aluno_indicacao: 'Ex-aluno por indicação',
      vivencia_empresa: 'Vivência em empresa'
    };
    const wordLabels = {
      nao: 'não',
      medio: 'médio',
      indicacao: 'indicação',
      publica: 'pública',
      participacao: 'participação',
      socioeconomico: 'socioeconômico',
      vinculo: 'vínculo'
    };
    const raw = String(value ?? '').trim();
    if (!raw) return 'Não informado';
    if (exactLabels[raw.toLowerCase()]) return exactLabels[raw.toLowerCase()];
    if (/^[A-Z0-9]{2,}$/.test(raw)) return raw;
    const text = raw
      .replace(/_/g, ' ')
      .split(/\s+/)
      .map((word) => wordLabels[word.toLowerCase()] || word)
      .join(' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function normalizePrograma(value) {
    const normalized = normalizeToken(value || '');
    if (!normalized || normalized === 'nao_informado' || normalized === 'sem_programa') {
      return 'nao_informado';
    }
    if (normalized.includes('mentoria')) return 'Mentoria';
    if (normalized.includes('pulse_mais')) return 'Programa Pulse Mais';
    return 'nao_informado';
  }

  async function fetchPerfilOptions() {
    const body = await gestorApi().get('/alunos/opcoes-cadastro');
    return body.data || {};
  }

  async function ensurePerfilOptions() {
    if (perfilOptions) return perfilOptions;
    if (!perfilOptionsPromise) {
      perfilOptionsPromise = fetchPerfilOptions()
        .then((options) => {
          perfilOptions = options;
          return options;
        })
        .finally(() => {
          perfilOptionsPromise = null;
        });
    }
    return perfilOptionsPromise;
  }

  function fillPerfilSelectOptions(aluno = {}) {
    const overlay = document.getElementById('perfil-overlay');
    if (!overlay) return;

    overlay.querySelectorAll('select[data-pf-option-field]').forEach((select) => {
      const optionField = select.dataset.pfOptionField;
      const dataField = select.dataset.pfField;
      const currentValue = optionField === 'programa'
        ? normalizePrograma(aluno[dataField])
        : aluno[dataField];
      const sourceValues = Array.isArray(perfilOptions?.[optionField]) ? perfilOptions[optionField] : [];
      const values = optionField === 'programa'
        ? ['Mentoria', 'nao_informado', 'Programa Pulse Mais']
        : [...new Set([
          ...sourceValues,
          ...(currentValue ? [currentValue] : [])
        ].filter(Boolean))];

      select.innerHTML = '<option value="">Não informado</option>';
      values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = perfilOptionLabel(value);
        select.appendChild(option);
      });
    });
  }

  function setPerfilInput(id, value) {
    const input = document.getElementById(id);
    if (!input) return;
    if (input.tagName === 'SELECT') {
      const selectedValue = value === undefined || value === null ? '' : String(value);
      if (selectedValue && !Array.from(input.options).some((option) => option.value === selectedValue)) {
        const option = document.createElement('option');
        option.value = selectedValue;
        option.textContent = perfilOptionLabel(selectedValue);
        input.appendChild(option);
      }
      input.value = selectedValue;
      return;
    }
    input.placeholder = 'Não informado';
    input.value = value === undefined || value === null ? '' : String(value);
  }

  function setPerfilStatus(message, icon = 'ti-eye') {
    const footer = document.getElementById('pf-footer-status');
    if (footer) footer.innerHTML = `<i class="ti ${icon}" style="font-size:13px;"></i> ${message}`;
  }

  function showPerfilNotice(message, error) {
    if (window.showPulseNotice) {
      window.showPulseNotice(message, error);
      return;
    }
    const notice = document.createElement('div');
    notice.className = `al-notice${error ? ' al-notice--error' : ''}`;
    notice.textContent = message;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 3600);
  }

  function setPerfilEditMode(editing) {
    const overlay = document.getElementById('perfil-overlay');
    if (!overlay) return;

    overlay.querySelectorAll('[data-pf-field]').forEach((input) => {
      if (input.tagName === 'SELECT') input.disabled = !editing;
      else input.readOnly = !editing;
    });

    const editBtn = document.getElementById('pf-edit-btn');
    const saveBtn = document.getElementById('pf-save-btn');
    const cancelBtn = document.getElementById('pf-cancel-edit');
    if (editBtn) editBtn.hidden = editing;
    if (saveBtn) saveBtn.hidden = !editing;
    if (cancelBtn) cancelBtn.hidden = !editing;

    setPerfilStatus(
      editing ? 'Edição ativa — revise e salve para atualizar o banco' : 'Visualização — dados do cadastro',
      editing ? 'ti-pencil' : 'ti-eye'
    );
  }

  function fillPerfilFields(student) {
    const aluno = student?.raw || student || {};
    const codigo = aluno.codigoPm || student?.id || (aluno.idAluno ? String(aluno.idAluno) : '');
    const curso = aluno.curso || student?.techCourse || '';
    const programa = aluno.programa || student?.course || '';
    const nivel = aluno.nivelJornada || student?.mod || '';

    fillPerfilSelectOptions(aluno);

    setPerfilInput('pf-code', codigo);
    setPerfilInput('pf-fullname', aluno.nome || student?.name);
    setPerfilInput('pf-age', aluno.idade);
    setPerfilInput('pf-genero', aluno.genero);
    setPerfilInput('pf-status', aluno.status);
    setPerfilInput('pf-data-ingresso', aluno.dataIngresso ? String(aluno.dataIngresso).slice(0, 10) : '');
    setPerfilInput('pf-course', curso === 'Curso nao informado' ? '' : curso);
    setPerfilInput('pf-escolaridade', aluno.escolaridade);
    setPerfilInput('pf-ocupacao', aluno.ocupacao);
    setPerfilInput('pf-programa', normalizePrograma(programa));
    setPerfilInput('pf-perfil-socioeconomico', aluno.perfilSocioeconomico);
    setPerfilInput('pf-renda-mensal', aluno.rendaMensal);
    setPerfilInput('pf-nivel-jornada', aluno.nivelJornada);
    setPerfilInput('pf-categoria', aluno.categoria);
    setPerfilInput('pf-tipo-vinculo', aluno.tipoVinculoEmpregaticio);
    setPerfilInput('pf-origem-participacao', aluno.origemParticipacao);
    setPerfilInput('pf-risco-evasao', aluno.riscoEvasao);
    setPerfilInput('pf-email', aluno.email);
    setPerfilInput('pf-telefone', aluno.telefone);

    const nameEl = document.getElementById('pf-name');
    if (nameEl) nameEl.textContent = aluno.nome || student?.name || 'Aluno';

    const metaEl = document.getElementById('pf-meta');
    if (metaEl) {
      const metaParts = [codigo, programa || curso].filter(Boolean).map(formatPerfilLabel);
      metaEl.textContent = metaParts.length ? metaParts.join(' · ') : 'Cadastro sem detalhes informados';
    }

    const statusBadge = document.getElementById('pf-badge-status');
    if (statusBadge) {
      statusBadge.innerHTML = `<i class="ti ti-circle-filled" style="font-size:8px;"></i> ${formatPerfilLabel(aluno.status || student?.st)}`;
    }

    const badgeCurso = document.getElementById('pf-badge-curso');
    if (badgeCurso) {
      const courseForIcon = aluno.curso || student?.course;
      const icon = COURSE_ICON[courseForIcon] || 'ti-book';
      badgeCurso.innerHTML = `<i class="ti ${icon}" style="font-size:11px;"></i> ${formatPerfilLabel(curso || programa)}`;
    }

    const badgeNivel = document.getElementById('pf-badge-nivel');
    if (badgeNivel) badgeNivel.textContent = formatPerfilLabel(nivel);

    const av = document.getElementById('pf-avatar');
    if (av) {
      av.textContent = student?.ini || (aluno.nome || 'A').trim().slice(0, 2).toUpperCase();
      av.style.background = student?.bg || '#E0E7FF';
      av.style.color = student?.tc || '#4338CA';
    }
  }

  function buildPerfilPayload() {
    const payload = {};
    const overlay = document.getElementById('perfil-overlay');
    overlay?.querySelectorAll('[data-pf-field]').forEach((input) => {
      const field = input.dataset.pfField;
      const config = PERFIL_FIELD_CONFIG[field] || {};
      const rawValue = input.value.trim();

      if (!input.checkValidity()) {
        const label = input.closest('.field')?.querySelector('label')?.textContent?.trim() || field;
        throw new Error(`${label}: ${input.validationMessage}`);
      }

      if (!rawValue) {
        if (config.required) {
          throw new Error(`O campo ${field} é obrigatório.`);
        }
        if (config.skipEmpty) return;
        payload[field] = null;
        return;
      }

      if (config.number) {
        const value = Number(rawValue.replace(',', '.'));
        if (!Number.isFinite(value)) throw new Error(`O campo ${field} deve ser numérico.`);
        if (config.integer && !Number.isInteger(value)) throw new Error(`O campo ${field} deve ser inteiro.`);
        payload[field] = value;
        return;
      }

      payload[field] = config.token ? normalizeToken(rawValue) : rawValue;
    });

    if (payload.email && !String(payload.email).includes('@')) {
      throw new Error('O e-mail deve conter um endereço válido.');
    }

    return payload;
  }

  async function updatePerfilAluno(idAluno, payload) {
    const body = await gestorApi().patch(`/alunos/${idAluno}`, payload);
    return body.data;
  }

  function syncPerfilStudent(updatedAluno) {
    const previous = currentPerfilStudent || {};
    return {
      ...previous,
      raw: updatedAluno,
      id: updatedAluno.codigoPm || String(updatedAluno.idAluno),
      name: updatedAluno.nome,
      age: updatedAluno.idade,
      course: updatedAluno.curso || updatedAluno.programa || previous.course || 'Programa Pulse Mais',
      techCourse: updatedAluno.curso || previous.techCourse || 'Curso nao informado',
      mod: updatedAluno.nivelJornada || updatedAluno.categoria || updatedAluno.status || previous.mod || 'Sem etapa informada',
      pct: Math.max(0, Math.min(100, Number(updatedAluno.engajamento) || previous.pct || 0))
    };
  }

  /* ── Notas e presença (registros reais) ───────────────────── */

  function setRegistroStatus(message, isError) {
    const el = document.getElementById('pf-registro-status');
    if (!el) return;
    el.textContent = message || '';
    el.classList.toggle('is-error', !!isError);
    el.classList.toggle('is-success', !isError && !!message);
  }

  async function fetchAtividades() {
    const body = await gestorApi().get('/atividades');
    return body.data.atividades || [];
  }

  async function fetchJornadaAluno(idAluno) {
    const body = await gestorApi().get(`/jornada/alunos/${idAluno}`);
    return body.data;
  }

  async function registrarFrequencia(payload) {
    const body = await gestorApi().post('/frequencias', payload);
    return body.data;
  }

  async function registrarParticipacaoEvento(payload) {
    const body = await gestorApi().post('/participacoes', payload);
    return body.data;
  }

  function populateTipoAtividadeSelect(atividades) {
    const select = document.getElementById('pf-registro-tipo');
    if (!select) return;
    const tipos = [...new Set(atividades.map((a) => a.tipo))].sort();
    select.innerHTML = '<option value="">Selecione o tipo</option>' + tipos.map((tipo) =>
      `<option value="${tipo}">${formatPerfilLabel(tipo)}</option>`
    ).join('');
  }

  function populateAtividadeSelect(tipo) {
    const select = document.getElementById('pf-registro-atividade');
    if (!select) return;

    if (!tipo) {
      select.innerHTML = '<option value="">Selecione o tipo primeiro</option>';
      select.disabled = true;
      return;
    }

    const filtradas = currentAtividades.filter((a) => a.tipo === tipo);
    select.disabled = false;
    select.innerHTML = '<option value="">Selecione uma atividade</option>' + filtradas.map((a) =>
      `<option value="${a.idAtividade}">${a.titulo}${a.data ? ' — ' + String(a.data).slice(0, 10) : ''}</option>`
    ).join('');
  }

  function updateRegistroNotaState() {
    const semNota = document.getElementById('pf-registro-sem-nota')?.checked;
    const notaInput = document.getElementById('pf-registro-nota');
    if (!notaInput) return;
    notaInput.disabled = !!semNota;
    if (semNota) notaInput.value = '';
  }

  function renderRegistrosGrid(jornada) {
    const grid = document.getElementById('pf-registros-grid');
    if (!grid) return;

    const registros = [...(jornada?.frequencias || []), ...(jornada?.participacoesEventos || [])]
      .sort((a, b) => String(b.dataPart).localeCompare(String(a.dataPart)));

    if (registros.length === 0) {
      grid.innerHTML = '<div class="perf-card__sub">Nenhum registro de nota ou presença ainda.</div>';
      return;
    }

    grid.innerHTML = registros.map((r) => {
      const editavel = r.tipoAtividade === 'aula';
      const notaValue = r.nota !== null && r.nota !== undefined ? r.nota : '';
      return `<div class="registro-item" data-id-atividade="${r.idAtividade}" data-tipo="${r.tipoAtividade}">
        <div class="registro-titulo">
          ${r.tituloAtividade}
          <small>${formatPerfilLabel(r.tipoAtividade)} · ${r.dataPart ? String(r.dataPart).slice(0, 10) : '—'}</small>
        </div>
        <label class="registro-presenca">
          <input type="checkbox" class="registro-presenca-input" ${r.statusPart ? 'checked' : ''} ${editavel ? '' : 'disabled'}>
          Presente
        </label>
        <input type="number" class="registro-nota-input" min="0" max="10" step="0.1" value="${notaValue}" ${editavel ? '' : 'disabled'}>
        ${editavel
          ? '<button class="registro-save-btn" title="Salvar"><i class="ti ti-device-floppy"></i></button>'
          : ''}
      </div>`;
    }).join('');

    grid.querySelectorAll('.registro-save-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const item = btn.closest('.registro-item');
        const idAtividade = Number(item.dataset.idAtividade);
        const presente = item.querySelector('.registro-presenca-input').checked;
        const notaRaw = item.querySelector('.registro-nota-input').value.trim();
        const nota = notaRaw === '' ? undefined : Number(notaRaw);

        if (nota !== undefined && (!Number.isFinite(nota) || nota < 0 || nota > 10)) {
          setRegistroStatus('A nota deve ser um número entre 0 e 10.', true);
          return;
        }

        btn.disabled = true;
        try {
          await registrarFrequencia({
            idAluno: currentPerfilAluno.idAluno,
            idAtividade,
            statusPart: presente,
            nota
          });
          setRegistroStatus('Registro atualizado com sucesso.', false);
          const jornada = await fetchJornadaAluno(currentPerfilAluno.idAluno);
          renderRegistrosGrid(jornada);
        } catch (error) {
          setRegistroStatus(error.message || 'Não foi possível salvar o registro.', true);
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  window.registrarNotaPresenca = async function () {
    const btn = document.getElementById('pf-registro-btn');
    try {
      if (!currentPerfilAluno?.idAluno) {
        throw new Error('Este aluno ainda não possui identificador para registro.');
      }

      const idAtividade = Number(document.getElementById('pf-registro-atividade').value);
      if (!idAtividade) {
        throw new Error('Selecione uma atividade para registrar.');
      }

      const presente = document.getElementById('pf-registro-presenca').checked;
      const semNota = document.getElementById('pf-registro-sem-nota').checked;
      const notaRaw = document.getElementById('pf-registro-nota').value.trim();
      const nota = semNota || notaRaw === '' ? undefined : Number(notaRaw);
      if (nota !== undefined && (!Number.isFinite(nota) || nota < 0 || nota > 10)) {
        throw new Error('A nota deve ser um número entre 0 e 10.');
      }

      const atividade = currentAtividades.find((a) => a.idAtividade === idAtividade);
      if (!atividade) {
        throw new Error('Atividade inválida.');
      }

      if (btn) btn.disabled = true;
      setRegistroStatus('Registrando...', false);

      const payload = { idAluno: currentPerfilAluno.idAluno, idAtividade, statusPart: presente, nota };
      if (atividade.tipo === 'aula') {
        await registrarFrequencia(payload);
      } else {
        await registrarParticipacaoEvento(payload);
      }

      setRegistroStatus('Registro salvo com sucesso.', false);
      document.getElementById('pf-registro-tipo').value = '';
      populateAtividadeSelect('');
      document.getElementById('pf-registro-nota').value = '';
      document.getElementById('pf-registro-sem-nota').checked = false;
      updateRegistroNotaState();
      document.getElementById('pf-registro-presenca').checked = false;

      const jornada = await fetchJornadaAluno(currentPerfilAluno.idAluno);
      renderRegistrosGrid(jornada);
    } catch (error) {
      setRegistroStatus(error.message || 'Não foi possível registrar.', true);
    } finally {
      if (btn) btn.disabled = false;
    }
  };

  async function loadRegistrosTab(idAluno) {
    const grid = document.getElementById('pf-registros-grid');
    if (grid) grid.innerHTML = '<div class="perf-card__sub">Carregando registros...</div>';
    setRegistroStatus('', false);

    try {
      if (currentAtividades.length === 0) {
        currentAtividades = await fetchAtividades();
        populateTipoAtividadeSelect(currentAtividades);
      }
      const jornada = await fetchJornadaAluno(idAluno);
      renderRegistrosGrid(jornada);
    } catch (error) {
      if (grid) grid.innerHTML = '<div class="perf-card__sub">Não foi possível carregar os registros.</div>';
      setRegistroStatus(error.message || 'Erro ao carregar notas e presença.', true);
    }
  }

  async function openStudentProfile(s) {
    const overlay = document.getElementById('perfil-overlay');
    if (!overlay) return;

    currentPerfilStudent = s || {};
    currentPerfilAluno = currentPerfilStudent.raw || currentPerfilStudent;
    try {
      await ensurePerfilOptions();
    } catch (error) {
      showPerfilNotice(error.message || 'Não foi possível carregar as opções do aluno.', true);
    }
    fillPerfilFields(currentPerfilStudent);
    setPerfilEditMode(false);

    /* Frequência */
    const freqVal = document.getElementById('pf-freq-val');
    const freqBar = document.getElementById('pf-freq-bar');
    const progress = Math.max(0, Math.min(100, Number(s?.pct) || Number(currentPerfilAluno?.engajamento) || 0));
    if (freqVal) freqVal.textContent = progress + '%';
    if (freqBar) { freqBar.style.width = progress + '%'; freqBar.style.background = progress < 60 ? '#E24B4A' : progress < 75 ? '#F4A261' : 'var(--green-600,#33B458)'; }

    /* Estrelas de engajamento */
    const stars = document.getElementById('pf-eng-stars');
    if (stars) {
      const score = Math.round(progress / 10);
      stars.innerHTML = Array.from({length: 10}, (_, i) =>
        `<i class="ti ti-star${i < score ? '-filled' : ''}" style="font-size:13px;color:${i < score ? '#FFD927' : '#DEE3EA'};"></i>`
      ).join('');
    }

    /* ── Notas e Jornada dinâmicas ─────────────────────────── */
    const courseName = s?.course || currentPerfilAluno?.curso || currentPerfilAluno?.programa || 'Programa Pulse Mais';
    const modName = s?.mod || currentPerfilAluno?.nivelJornada || currentPerfilAluno?.categoria || '';
    const modules    = COURSE_MODULES[courseName] || ['Módulo 1','Módulo 2','Módulo 3','Módulo 4','Módulo 5'];
    const concluded  = String(modName).includes('Concluído');
    const modNumMatch = String(modName).match(/Módulo (\d)/);
    const currentMod = modNumMatch ? parseInt(modNumMatch[1]) : 5;
    const doneMods   = concluded ? 5 : currentMod - 1;

    /* grade determinística: varia por curso+módulo, centrada no pct do aluno */
    const baseGrade  = 5.5 + (progress / 100) * 3.5;
    const offsets    = [0.5, 0.2, 0, -0.2, -0.4];

    /* Label */
    const notasLabel = document.getElementById('pf-notas-label');
    if (notasLabel) notasLabel.textContent = `Notas — ${formatPerfilLabel(courseName)}`;

    /* Grid de notas */
    const notasGrid = document.getElementById('pf-notas-grid');
    if (notasGrid) {
      notasGrid.innerHTML = modules.map((name, i) => {
        const modN    = i + 1;
        const pending = !concluded && modN > currentMod;
        if (pending) {
          return `<div class="nota-item">
            <span class="nota-modulo">${name}</span>
            <div class="nota-bar-wrap"><div class="nota-bar"><div class="nota-bar__fill" style="width:0%"></div></div></div>
            <span class="nota-val" style="color:#C0C7D0">—</span>
          </div>`;
        }
        const g     = Math.round((baseGrade + offsets[i]) * 10) / 10;
        const color = g >= 8 ? '#33B458' : g >= 7 ? '#EF9F27' : '#E24B4A';
        const star  = g < 8 ? ' ★' : '';
        return `<div class="nota-item">
          <span class="nota-modulo">${name}</span>
          <div class="nota-bar-wrap"><div class="nota-bar"><div class="nota-bar__fill" style="width:${g * 10}%;background:${color}"></div></div></div>
          <span class="nota-val" style="color:${color}">${g.toFixed(1).replace('.', ',')}${star}</span>
        </div>`;
      }).join('');
    }

    /* Nota média (apenas módulos cursados) */
    const gradedCount = concluded ? 5 : currentMod;
    const grades      = Array.from({length: gradedCount}, (_, i) => Math.round((baseGrade + offsets[i]) * 10) / 10);
    const avg         = grades.reduce((a, b) => a + b, 0) / grades.length;
    const mediaEl     = document.getElementById('pf-nota-media-val');
    if (mediaEl) mediaEl.textContent = avg.toFixed(1).replace('.', ',');

    /* Jornada */
    const journeyEl = document.getElementById('pf-journey');
    if (journeyEl) {
      journeyEl.innerHTML = modules.map((name, i) => {
        const modN      = i + 1;
        const isDone    = concluded || modN <= doneMods;
        const isCurrent = !concluded && modN === currentMod;
        const cls       = isDone ? 'done' : isCurrent ? 'current' : '';
        const lineDone  = (isDone && !isCurrent) ? 'done' : '';
        const line      = i < 4 ? `<div class="journey-line ${lineDone}"></div>` : '';
        return `<div class="journey-step"><div class="journey-node ${cls}">${modN}</div><div class="journey-label">${name}</div></div>${line}`;
      }).join('');
    }

    /* Notas e presença reais (registros do banco) */
    if (currentPerfilAluno?.idAluno) {
      loadRegistrosTab(currentPerfilAluno.idAluno);
    }

    /* Reset para aba "Dados gerais" */
    showPerfilTab('pf-tab-dados', overlay.querySelector('.tab-btn'));

    /* Abre overlay */
    overlay.classList.add('open');
    document.body.classList.add('perfil-open');
  }

  window.startPerfilEdit = function () {
    if (!currentPerfilAluno?.idAluno) {
      setPerfilStatus('Este aluno ainda não possui identificador para edição.', 'ti-alert-circle');
      return;
    }
    setPerfilEditMode(true);
  };

  window.cancelPerfilEdit = function () {
    if (currentPerfilStudent) fillPerfilFields(currentPerfilStudent);
    setPerfilEditMode(false);
  };

  window.savePerfilAluno = async function () {
    const saveBtn = document.getElementById('pf-save-btn');
    try {
      if (!currentPerfilAluno?.idAluno) {
        throw new Error('Este aluno ainda não possui identificador para edição.');
      }

      const payload = buildPerfilPayload();
      if (saveBtn) saveBtn.disabled = true;
      setPerfilStatus('Salvando alterações...', 'ti-loader-2');

      const updatedAluno = await updatePerfilAluno(currentPerfilAluno.idAluno, payload);
      currentPerfilAluno = updatedAluno;
      currentPerfilStudent = syncPerfilStudent(updatedAluno);

      fillPerfilFields(currentPerfilStudent);
      setPerfilEditMode(false);
      setPerfilStatus('Aluno atualizado com sucesso.', 'ti-circle-check');
      showPerfilNotice('Aluno atualizado com sucesso.');

      if (window.refreshListaAlunosView) {
        await window.refreshListaAlunosView();
      }
    } catch (error) {
      setPerfilStatus(error.message || 'Não foi possível atualizar o aluno.', 'ti-alert-circle');
      showPerfilNotice(error.message || 'Não foi possível atualizar o aluno.', true);
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  };

  window.closePerfilModal = function () {
    const overlay = document.getElementById('perfil-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.classList.remove('perfil-open');
  };

  window.showPerfilTab = function (tabId, btn) {
    const overlay = document.getElementById('perfil-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    overlay.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById(tabId);
    if (panel) panel.classList.add('active');
    if (btn)   btn.classList.add('active');
  };

})();
