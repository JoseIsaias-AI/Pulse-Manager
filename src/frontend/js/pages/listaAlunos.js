(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     VIEW: LISTA DE ALUNOS
     Extraído de spaGestor.js › initAlunosView()
  ════════════════════════════════════════════════════════════ */
  function initAlunosView() {
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

  initAlunosView();

})();
