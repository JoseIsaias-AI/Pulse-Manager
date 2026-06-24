(function () {
  'use strict';

  /* ── VIEWS ────────────────────────────────────────────────── */
  const VIEWS = ['inicio', 'dashboard', 'agenda', 'atualizacoes', 'configuracoes'];
  const chartInited = { inicio: false, dashboard: false, agenda: false, atualizacoes: false, configuracoes: false };

  let alunoSprintChart = null;
  let alunoBarChart = null;
  let alunoLineChart = null;
  let agendaEventosAtivos = [];

  function alunoApi() {
    if (!window.PulseApi) throw new Error('Cliente HTTP central nao carregado.');
    return window.PulseApi;
  }

  function alunoSessao() {
    try {
      return JSON.parse(sessionStorage.getItem('pulseUser') || 'null');
    } catch (_error) {
      return null;
    }
  }

  function idAlunoSessao() {
    const user = alunoSessao();
    const id = Number(user && user.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Sessao do aluno nao encontrada. Faca login novamente.');
    }
    return id;
  }

  function stateHost(root, id) {
    if (!root) return null;
    let host = document.getElementById(id);
    if (!host) {
      host = document.createElement('div');
      host.id = id;
      host.className = 'pulse-ui-state';
      root.prepend(host);
    }
    return host;
  }

  function setState(host, state, message) {
    if (!host || !window.PulseUiState) return;
    window.PulseUiState.set(host, state, message);
  }

  function clearState(host) {
    if (!host || !window.PulseUiState) return;
    window.PulseUiState.clear(host);
  }

  function pct(value, total) {
    if (!total) return 0;
    return Math.round((Number(value || 0) / Number(total || 1)) * 100);
  }

  function fmtDate(value) {
    if (!value) return 'Data nao informada';
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('pt-BR');
  }

  function normalizeJornada(data) {
    const frequencias = Array.isArray(data?.frequencias) ? data.frequencias : [];
    const participacoes = Array.isArray(data?.participacoesEventos) ? data.participacoesEventos : [];
    const registros = [...frequencias, ...participacoes];
    const presentes = registros.filter((item) => item.statusPart === true || item.statusPart === 1 || item.statusPart === 'presente').length;
    const notas = registros.map((item) => Number(item.nota)).filter((nota) => Number.isFinite(nota));
    const media = notas.length ? notas.reduce((acc, nota) => acc + nota, 0) / notas.length : 0;
    const tipos = new Set(registros.map((item) => item.tipoAtividade || item.tituloAtividade).filter(Boolean));

    return {
      aluno: data?.aluno || {},
      frequencias,
      participacoes,
      registros,
      presentes,
      frequenciaPct: pct(presentes, registros.length),
      mediaNota: media,
      modulos: tipos.size,
      vazio: registros.length === 0
    };
  }

  async function carregarJornadaAluno() {
    const idAluno = idAlunoSessao();
    const response = await alunoApi().get(`/jornada/alunos/${idAluno}`);
    return normalizeJornada(response.data || {});
  }

  function showView(id) {
    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.style.display = 'none';
    });

    const target = document.getElementById('view-' + id);
    if (!target) return;
    target.style.display = 'flex';

    document.querySelectorAll('.menuLateral__item[data-page]').forEach(item => {
      item.classList.toggle('menuLateral__item--active', item.dataset.page === id);
    });

    const url = new URL(window.location.href);
    url.searchParams.set('view', id);
    window.history.replaceState({}, '', url);

    if (!chartInited[id]) {
      chartInited[id] = true;
      if (id === 'inicio')    initInicioView();
      if (id === 'dashboard') initDashboardView();
      if (id === 'agenda')    initAgendaView();
    }
  }

  /* ── MODAL ALUNO (abertura via perfil do rodapé) ──────────── */
  function openAlunoModal() {
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
      userBlock.title = 'Ver perfil';
      userBlock.addEventListener('click', openAlunoModal);
    }
  });

  /* ── ROTEADOR ─────────────────────────────────────────────── */
  window.__onMenuNav = function (pageId) {
    if (VIEWS.includes(pageId)) showView(pageId);
  };

  /* ── VIEW PADRÃO ──────────────────────────────────────────── */
  const requestedView = new URLSearchParams(window.location.search).get('view');
  showView(VIEWS.includes(requestedView) ? requestedView : 'inicio');

  /* ════════════════════════════════════════════════════════════
     VIEW: INÍCIO (Portal do Aluno)
  ════════════════════════════════════════════════════════════ */
  function initInicioView() {
    /* Emoji selector */
    var emojiRow = document.getElementById('ini-emoji-row');
    var saudeMsg = document.getElementById('ini-saude-msg');
    var MOODS = {
      '1': 'Vamos juntos superar isso 💙',
      '2': 'Não está fácil. Fale com o psicólogo 💜',
      '3': 'Tudo bem! Vá devagar hoje.',
      '4': 'Que bom! Continue assim 👏',
      '5': 'Você está arrasando! 🎉'
    };
    if (emojiRow) {
      emojiRow.querySelectorAll('.ini-emoji-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          emojiRow.querySelectorAll('.ini-emoji-btn').forEach(function (b) {
            b.classList.remove('ini-emoji-selected');
          });
          btn.classList.add('ini-emoji-selected');
          if (saudeMsg) saudeMsg.textContent = MOODS[btn.dataset.mood] || '';
        });
      });
    }

    /* Sprint progress chart */
    var sprintCanvas = document.getElementById('ini-sprint-chart');
    if (sprintCanvas) {
      new Chart(sprintCanvas, {
        type: 'bar',
        data: {
          labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
          datasets: [{
            label: 'Progresso (%)',
            data: [100, 100, 63, 0],
            backgroundColor: ['#33B458', '#33B458', '#003870', '#EEF1F4'],
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: function (c) { return ' ' + c.raw + '%'; } } }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#6B7684', font: { family: 'Poppins', size: 10 } },
              border: { display: false }
            },
            y: {
              min: 0, max: 100,
              ticks: { color: '#97A1AE', stepSize: 25, callback: function (v) { return v + '%'; }, font: { family: 'Poppins', size: 10 } },
              grid: { color: '#F0F3F7' },
              border: { display: false }
            }
          }
        }
      });
    }
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: DASHBOARD (dashboardAluno)
  ════════════════════════════════════════════════════════════ */
  function initDashboardView() {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size   = 11;

    /* BAR CHART — Presenças por Bimestre */
    new Chart(document.getElementById('a-barChart'), {
      type: 'bar',
      data: {
        labels: ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'],
        datasets: [
          {
            type: 'bar',
            data: [92, 88, 81, 95],
            backgroundColor: ['#003870', '#33B458', '#FFD927', '#003870'],
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
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw}%` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 60, max: 100, ticks: { color: '#97A1AE', stepSize: 10, callback: v => v + '%' }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });

    /* LINE CHART — Evolução por Módulo */
    const lCtx = document.getElementById('a-lineChart').getContext('2d');
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
            borderColor: '#003870', backgroundColor: grad,
            fill: true, tension: 0.4,
            pointBackgroundColor: '#003870', pointRadius: 4, pointHoverRadius: 6,
            borderWidth: 2.5, order: 2
          },
          {
            label: 'Frequência',
            data: [9.0, 8.8, 8.7, 8.6, 8.5],
            borderColor: '#97A1AE', backgroundColor: 'transparent',
            fill: false, tension: 0.4,
            pointBackgroundColor: '#fff', pointBorderColor: '#97A1AE',
            pointBorderWidth: 1.5, pointRadius: 4,
            borderDash: [5, 4], borderWidth: 1.5, order: 3
          },
          {
            label: 'Meta (7,0)',
            data: Array(5).fill(7.0),
            borderColor: '#DEE3EA', borderDash: [6, 4],
            borderWidth: 1.5, pointRadius: 0,
            fill: false, tension: 0, order: 1
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
          y: { min: 0, max: 10, ticks: { color: '#97A1AE', stepSize: 2 }, grid: { color: '#F0F3F7' }, border: { display: false } }
        }
      }
    });
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: AGENDA (somente leitura — sem formulário de adição)
  ════════════════════════════════════════════════════════════ */
  function initAgendaView() {

    /* ── Eventos de Junho 2026 ─────────────────────────────── */
    const LEGACY_EVENTS_DESATIVADOS = [
      { id:1,  title:'Aula — Letramento Digital',          tipo:'aula',      start:'2026-06-01', end:'2026-06-01', hora:'09:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Módulo 1 — Intro ao Digital. Participação obrigatória.' },
      { id:2,  title:'Mentoria em Grupo',                  tipo:'mentoria',  start:'2026-06-03', end:'2026-06-03', hora:'14:00', responsavel:'João Mário',      iniciais:'JM', ocupacao:'psicologo', occLabel:'Psicólogo', desc:'Sessão de mentoria coletiva com foco em autoconhecimento.' },
      { id:3,  title:'Consulta Psicológica',               tipo:'consulta',  start:'2026-06-05', end:'2026-06-05', hora:'10:00', responsavel:'João Mário',      iniciais:'JM', ocupacao:'psicologo', occLabel:'Psicólogo', desc:'Atendimento individual. Comparecer com antecedência.' },
      { id:4,  title:'Aula — Ferramentas de Produtividade',tipo:'aula',      start:'2026-06-08', end:'2026-06-09', hora:'09:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Módulo 2 — Fórmulas e planilhas avançadas.' },
      { id:5,  title:'Evento de Networking',               tipo:'evento',    start:'2026-06-10', end:'2026-06-12', hora:'18:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Encontro com empresas parceiras. Traje social recomendado.' },
      { id:6,  title:'Mentoria Individual',                tipo:'mentoria',  start:'2026-06-11', end:'2026-06-11', hora:'11:00', responsavel:'João Mário',      iniciais:'JM', ocupacao:'psicologo', occLabel:'Psicólogo', desc:'Sessão com foco no plano de carreira do aluno.' },
      { id:7,  title:'Aula — AI-First na Prática',         tipo:'aula',      start:'2026-06-15', end:'2026-06-16', hora:'09:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Módulo 3 — Prompt Engineering e IA aplicada.' },
      { id:8,  title:'Consulta Psicológica',               tipo:'consulta',  start:'2026-06-17', end:'2026-06-17', hora:'14:30', responsavel:'João Mário',      iniciais:'JM', ocupacao:'psicologo', occLabel:'Psicólogo', desc:'Acompanhamento de bem-estar emocional.' },
      { id:9,  title:'Workshop de Carreira',               tipo:'evento',    start:'2026-06-18', end:'2026-06-19', hora:'09:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Simulação de entrevistas e feedback profissional.' },
      { id:10, title:'Formatura Turma T1',                 tipo:'formatura', start:'2026-06-20', end:'2026-06-20', hora:'16:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Cerimônia de conclusão da Turma T1. Convidados permitidos.' },
      { id:11, title:'Aula — Autogestão no Trabalho',      tipo:'aula',      start:'2026-06-22', end:'2026-06-23', hora:'09:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Módulo 4 — Adaptabilidade e plano de ação pessoal.' },
      { id:12, title:'Mentoria em Grupo',                  tipo:'mentoria',  start:'2026-06-24', end:'2026-06-24', hora:'15:00', responsavel:'João Mário',      iniciais:'JM', ocupacao:'psicologo', occLabel:'Psicólogo', desc:'Sessão coletiva: troca de experiências entre alunos.' },
      { id:13, title:'Aula — Mercado de Trabalho',         tipo:'aula',      start:'2026-06-25', end:'2026-06-26', hora:'09:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Módulo 5 — LinkedIn, rede profissional e carreiras em TI.' },
      { id:14, title:'Consulta Psicológica',               tipo:'consulta',  start:'2026-06-29', end:'2026-06-29', hora:'10:00', responsavel:'João Mário',      iniciais:'JM', ocupacao:'psicologo', occLabel:'Psicólogo', desc:'Encerramento de ciclo. Avaliação de progresso emocional.' },
      { id:15, title:'Encerramento de Junho',              tipo:'evento',    start:'2026-06-30', end:'2026-06-30', hora:'17:00', responsavel:'Vitória Brandão', iniciais:'VB', ocupacao:'gestor',    occLabel:'Gestor',    desc:'Reunião de encerramento mensal com toda a equipe e alunos.' },
    ];

    /* ── Helpers ───────────────────────────────────────────── */
    function toDate(s) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
    function daysBetween(a,b) { return Math.round((toDate(b)-toDate(a))/(864e5))+1; }
    function colOf(dateStr) {
      const d = toDate(dateStr);
      return ((d.getDay()+6)%7); // Mon=0 … Sun=6
    }
    function weekRow(dateStr) {
      const d = toDate(dateStr);
      const first = new Date(2026,5,1);
      const offset = (first.getDay()+6)%7;
      return Math.floor((d.getDate()-1+offset)/7);
    }

    /* Agrupa eventos por semana de início para montar linhas no grid */
    function buildWeeks() {
      // 5 semanas × 7 colunas  (1 Jun = Segunda → col0)
      // Semana 0: 1–7; 1: 8–14; 2: 15–21; 3: 22–28; 4: 29–30
      const weeks = [[],[],[],[],[]];
      EVENTS.forEach(ev => {
        const wr = weekRow(ev.start);
        if (wr >= 0 && wr < 5) weeks[wr].push(ev);
      });
      return weeks;
    }

    /* ── Renderizar calendário ─────────────────────────────── */
    function renderCal() {
      const cal = document.getElementById('ag-cal');
      if (!cal) return;

      const DOWS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
      let html = `<div class="ag-dow-row">${DOWS.map(d=>`<div class="ag-dow">${d}</div>`).join('')}</div>`;

      // Junho 2026 começa na Segunda (col 0), 30 dias
      const firstDow = 0; // Monday
      const daysInMonth = 30;

      const weeks = buildWeeks();

      // Pré-calcula: para cada semana, monta ocupancy matrix para posicionar linhas de evento
      for (let w = 0; w < 5; w++) {
        const startDay = w * 7 - firstDow + 1;
        const endDay   = startDay + 6;

        // dias desta semana (d = dia do mês, pode ser <1 ou >30)
        const cells = [];
        for (let c = 0; c < 7; c++) {
          const d = startDay + c;
          cells.push(d);
        }

        // Linhas de eventos (max 3 visíveis)
        const evRows = []; // array de arrays [col, span, ev]
        const occ = Array.from({length:3}, ()=>Array(7).fill(false));

        // Ordena eventos por duração desc para preencher melhor
        const wEvs = [...weeks[w]].sort((a,b)=>daysBetween(b.start,b.end)-daysBetween(a.start,a.end));

        wEvs.forEach(ev => {
          const evStartDay = toDate(ev.start).getDate();
          const evEndDay   = toDate(ev.end).getDate();
          const col  = Math.max(0, evStartDay - startDay);
          // span: limitado à semana atual
          const span = Math.min(evEndDay, endDay) - (startDay + col) + 1;
          if (col >= 7 || span <= 0) return;
          // Encontra linha livre
          let row = -1;
          for (let r = 0; r < 3; r++) {
            let free = true;
            for (let sc = col; sc < col+span && sc < 7; sc++) {
              if (occ[r][sc]) { free = false; break; }
            }
            if (free) { row = r; break; }
          }
          if (row === -1) return;
          for (let sc = col; sc < col+span && sc < 7; sc++) occ[row][sc] = true;
          while (evRows.length <= row) evRows.push([]);
          evRows[row].push({ col, span, ev });
        });

        // Gera HTML da semana
        const cellsHtml = cells.map(d => {
          const valid = d >= 1 && d <= daysInMonth;
          const isToday = (d === 11); // hoje = 11 Jun 2026
          const cls = [
            'ag-cell',
            !valid ? 'other-month' : '',
            isToday ? 'today' : ''
          ].filter(Boolean).join(' ');
          return `<div class="${cls}"><span class="ag-dn">${valid ? d : ''}</span></div>`;
        }).join('');

        // Linhas de eventos
        let evRowsHtml = '';
        evRows.forEach(rowItems => {
          let rowHtml = `<div class="ag-ev-row">`;
          let cursor = 0;
          const sorted = [...rowItems].sort((a,b)=>a.col-b.col);
          sorted.forEach(({col, span, ev}) => {
            // gap antes do evento
            if (col > cursor) {
              rowHtml += `<div style="grid-column:${cursor+1}/span ${col-cursor}"></div>`;
            }
            const tipoCls = 'ev-tipo-' + ev.tipo;
            rowHtml += `<div class="ag-ev ${tipoCls}" style="grid-column:${col+1}/span ${span}" onclick="window.__agShowDetail(${ev.id})" title="${ev.title}">${ev.title}</div>`;
            cursor = col + span;
          });
          if (cursor < 7) rowHtml += `<div style="grid-column:${cursor+1}/span ${7-cursor}"></div>`;
          rowHtml += '</div>';
          evRowsHtml += rowHtml;
        });

        html += `<div class="ag-week"><div class="ag-day-row">${cellsHtml}</div>${evRowsHtml}</div>`;
      }

      cal.innerHTML = html;
    }

    /* ── Mostrar detalhe ────────────────────────────────────── */
    function showDetail(id) {
      const ev = EVENTS.find(e => e.id === id);
      const det = document.getElementById('ag-detail');
      if (!ev || !det) return;

      const tipoLabel = { evento:'Evento', consulta:'Consulta', aula:'Aula', mentoria:'Mentoria', formatura:'Formatura' };
      const tipoIcon  = { evento:'ti-calendar-event', consulta:'ti-stethoscope', aula:'ti-school', mentoria:'ti-users', formatura:'ti-award' };
      const days = daysBetween(ev.start, ev.end);
      const dateLabel = days > 1
        ? `${toDate(ev.start).toLocaleDateString('pt-BR')} – ${toDate(ev.end).toLocaleDateString('pt-BR')}`
        : toDate(ev.start).toLocaleDateString('pt-BR');

      det.innerHTML = `
        <div class="ag-det-head">
          <div class="ag-det-title">${ev.title}</div>
          <button class="ag-det-close" onclick="document.getElementById('ag-detail').classList.remove('open')"><i class="ti ti-x"></i></button>
        </div>
        <span class="ag-det-badge ev-tipo-${ev.tipo}"><i class="ti ${tipoIcon[ev.tipo]}"></i> ${tipoLabel[ev.tipo]}</span>
        <div class="ag-det-rows">
          <div class="ag-det-row"><i class="ti ti-calendar"></i><div><div class="ag-det-lbl">Data</div><div class="ag-det-val">${dateLabel}</div></div></div>
          <div class="ag-det-row"><i class="ti ti-clock"></i><div><div class="ag-det-lbl">Hora</div><div class="ag-det-val">${ev.hora}</div></div></div>
          <div class="ag-det-row"><i class="ti ti-user-circle"></i><div><div class="ag-det-lbl">Responsável</div><div class="ag-det-val">${ev.responsavel} <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;vertical-align:middle;background:${ev.ocupacao==='psicologo'?'rgba(123,79,217,.12)':'rgba(0,56,112,.10)'};color:${ev.ocupacao==='psicologo'?'#7B4FD9':'#003870'}">${ev.occLabel}</span></div></div></div>
          <div class="ag-det-row"><i class="ti ti-notes"></i><div><div class="ag-det-lbl">Descrição</div><div class="ag-det-val">${ev.desc}</div></div></div>
        </div>`;
      det.classList.add('open');
      det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* Expõe o handler globalmente para os onclick do HTML gerado */
    window.__agShowDetail = showDetail;

    renderCal();
  }

  function initInicioView() {
    var emojiRow = document.getElementById('ini-emoji-row');
    var saudeMsg = document.getElementById('ini-saude-msg');
    var MOODS = {
      '1': 'Vamos juntos superar isso 💙',
      '2': 'Não está fácil. Se quiser, solicite apoio psicológico.',
      '3': 'Tudo bem! Vá devagar hoje.',
      '4': 'Que bom! Continue assim 👏',
      '5': 'Você está arrasando! 🎉'
    };

    if (emojiRow) {
      emojiRow.querySelectorAll('.ini-emoji-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          emojiRow.querySelectorAll('.ini-emoji-btn').forEach(function (b) {
            b.classList.remove('ini-emoji-selected');
          });
          btn.classList.add('ini-emoji-selected');
          if (saudeMsg) saudeMsg.textContent = MOODS[btn.dataset.mood] || '';
        });
      });
    }

    const supportButton = document.querySelector('.ini-btn-psi');
    if (supportButton) {
      supportButton.innerHTML = '<i class="ti ti-heart-handshake"></i> Solicitar apoio';
      let textarea = document.getElementById('apoio-mensagem');
      if (!textarea) {
        textarea = document.createElement('textarea');
        textarea.id = 'apoio-mensagem';
        textarea.placeholder = 'Conte brevemente como podemos te apoiar.';
        textarea.rows = 3;
        textarea.style.cssText = 'width:100%;resize:vertical;border:1px solid #DEE3EA;border-radius:10px;padding:10px;font-family:Poppins,sans-serif;font-size:12px;';
        supportButton.parentElement.insertBefore(textarea, supportButton);
      }

      let feedback = document.getElementById('apoio-feedback');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'apoio-feedback';
        feedback.className = 'pulse-ui-state';
        supportButton.insertAdjacentElement('afterend', feedback);
      }

      supportButton.addEventListener('click', async function () {
        try {
          idAlunoSessao();
          const mensagem = textarea.value.trim();
          if (mensagem.length < 10) {
            setState(feedback, 'error', 'Descreva sua solicitação com pelo menos 10 caracteres.');
            return;
          }

          supportButton.disabled = true;
          setState(feedback, 'loading', 'Enviando solicitação de apoio...');
          await alunoApi().post('/apoio/solicitar', { mensagem });
          textarea.value = '';
          setState(feedback, 'success', 'Solicitação enviada. Um psicólogo irá acompanhar seu pedido.');
        } catch (error) {
          setState(feedback, 'error', window.PulseUiState?.messageFrom(error, 'Não foi possível enviar a solicitação de apoio.') || 'Não foi possível enviar a solicitação de apoio.');
        } finally {
          supportButton.disabled = false;
        }
      });
    }

    const sprintCanvas = document.getElementById('ini-sprint-chart');
    if (!sprintCanvas) return;
    const host = stateHost(sprintCanvas.closest('.chart-card') || sprintCanvas.parentElement, 'ini-jornada-state');
    setState(host, 'loading', 'Carregando progresso da jornada...');

    carregarJornadaAluno()
      .then(function (jornada) {
        clearState(host);
        const labels = jornada.registros.slice(-4).map(function (item, index) {
          return item.tituloAtividade || `Registro ${index + 1}`;
        });
        const values = jornada.registros.slice(-4).map(function (item) {
          return item.statusPart === true || item.statusPart === 1 || item.statusPart === 'presente' ? 100 : 0;
        });

        if (alunoSprintChart) alunoSprintChart.destroy();
        alunoSprintChart = new Chart(sprintCanvas, {
          type: 'bar',
          data: {
            labels: labels.length ? labels : ['Sem registros'],
            datasets: [{
              label: 'Progresso (%)',
              data: values.length ? values : [0],
              backgroundColor: values.map(function (value) { return value >= 100 ? '#33B458' : '#EEF1F4'; }),
              borderRadius: 8,
              borderSkipped: false,
              barPercentage: 0.6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return ' ' + c.raw + '%'; } } } },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#6B7684', font: { family: 'Poppins', size: 10 } }, border: { display: false } },
              y: { min: 0, max: 100, ticks: { color: '#97A1AE', stepSize: 25, callback: function (v) { return v + '%'; }, font: { family: 'Poppins', size: 10 } }, grid: { color: '#F0F3F7' }, border: { display: false } }
            }
          }
        });

        if (jornada.vazio) setState(host, 'empty', 'Sua jornada ainda nao possui registros.');
      })
      .catch(function (error) {
        setState(host, 'error', window.PulseUiState?.messageFrom(error, 'Não foi possível carregar a jornada.') || 'Não foi possível carregar a jornada.');
      });
  }

  function initDashboardView() {
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.font.size = 11;

    const root = document.getElementById('view-dashboard');
    const host = stateHost(root, 'aluno-dashboard-state');
    const values = root ? root.querySelectorAll('.stat-card__value') : [];
    const footers = root ? root.querySelectorAll('.stat-card__footer') : [];
    setState(host, 'loading', 'Carregando dados da jornada...');

    carregarJornadaAluno()
      .then(function (jornada) {
        clearState(host);

        if (values[0]) values[0].innerHTML = `${jornada.frequenciaPct}<span class="stat-card__unit">%</span>`;
        if (footers[0]) footers[0].textContent = `com base em ${jornada.registros.length} registros`;
        if (values[1]) values[1].innerHTML = `${jornada.modulos}<span class="stat-card__unit"> módulos</span>`;
        if (footers[1]) footers[1].textContent = jornada.aluno.programa || 'Programa nao informado';
        if (values[2]) values[2].textContent = jornada.mediaNota ? jornada.mediaNota.toFixed(1).replace('.', ',') : '0';
        if (footers[2]) footers[2].textContent = 'média calculada pelos registros reais';
        if (values[3]) values[3].innerHTML = `${jornada.participacoes.length}<span class="stat-card__unit"> eventos</span>`;
        if (footers[3]) footers[3].textContent = jornada.aluno.categoria || jornada.aluno.status || 'Sem categoria informada';

        const barCanvas = document.getElementById('a-barChart');
        const lineCanvas = document.getElementById('a-lineChart');
        const freqLabels = jornada.frequencias.map(function (item) { return item.tituloAtividade || fmtDate(item.dataPart); });
        const freqData = jornada.frequencias.map(function (item) {
          return item.statusPart === true || item.statusPart === 1 || item.statusPart === 'presente' ? 100 : 0;
        });
        const lineLabels = jornada.registros.map(function (item) { return item.tituloAtividade || fmtDate(item.dataPart); });
        const notas = jornada.registros.map(function (item) {
          const nota = Number(item.nota);
          return Number.isFinite(nota) ? nota : 0;
        });

        if (barCanvas) {
          if (alunoBarChart) alunoBarChart.destroy();
          alunoBarChart = new Chart(barCanvas, {
            type: 'bar',
            data: {
              labels: freqLabels.length ? freqLabels : ['Sem frequencias'],
              datasets: [
                {
                  type: 'bar',
                  data: freqData.length ? freqData : [0],
                  backgroundColor: '#003870',
                  borderRadius: 8,
                  borderSkipped: false,
                  barPercentage: 0.52,
                  order: 2
                },
                {
                  type: 'line',
                  label: 'Meta (85%)',
                  data: new Array(Math.max(freqData.length, 1)).fill(85),
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
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return ` ${c.raw}%`; } } } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
                y: { min: 0, max: 100, ticks: { color: '#97A1AE', stepSize: 25, callback: function (v) { return v + '%'; } }, grid: { color: '#F0F3F7' }, border: { display: false } }
              }
            }
          });
        }

        if (lineCanvas) {
          const lCtx = lineCanvas.getContext('2d');
          const grad = lCtx.createLinearGradient(0, 0, 0, 272);
          grad.addColorStop(0, 'rgba(0,56,112,.14)');
          grad.addColorStop(1, 'rgba(0,56,112,0)');
          if (alunoLineChart) alunoLineChart.destroy();
          alunoLineChart = new Chart(lCtx, {
            type: 'line',
            data: {
              labels: lineLabels.length ? lineLabels : ['Sem registros'],
              datasets: [
                {
                  label: 'Nota',
                  data: notas.length ? notas : [0],
                  borderColor: '#003870',
                  backgroundColor: grad,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#003870',
                  pointRadius: 4,
                  borderWidth: 2.5,
                  order: 2
                },
                {
                  label: 'Meta (7,0)',
                  data: new Array(Math.max(notas.length, 1)).fill(7),
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
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: '#6B7684' }, border: { display: false } },
                y: { min: 0, max: 10, ticks: { color: '#97A1AE', stepSize: 2 }, grid: { color: '#F0F3F7' }, border: { display: false } }
              }
            }
          });
        }

        if (jornada.vazio) setState(host, 'empty', 'Ainda nao ha dados de jornada para exibir.');
      })
      .catch(function (error) {
        setState(host, 'error', window.PulseUiState?.messageFrom(error, 'Não foi possível carregar a jornada.') || 'Não foi possível carregar a jornada.');
      });
  }

  function normalizeAgendaItem(item) {
    const id = item.idAgenda || item.id || item.idCompromisso;
    const data = String(item.data || item.dataAgenda || '').slice(0, 10);
    return {
      id,
      title: item.registro || item.titulo || 'Compromisso',
      tipo: item.tipo || item.tipoAtividade || 'evento',
      start: data,
      end: data,
      hora: item.horaInicio || item.hora || item.horario || 'Horario nao informado',
      responsavel: item.responsavel || item.nomeResponsavel || 'Equipe Pulse',
      ocupacao: item.ocupacao || 'gestor',
      occLabel: item.occLabel || 'Equipe',
      desc: item.descricao || item.registro || 'Sem descricao informada.',
      status: item.status
    };
  }

  function statusCancelado(status) {
    const normalized = String(status).toLowerCase();
    return status === 0 || status === false || normalized === 'cancelado' || normalized === 'cancelada' || normalized === 'inativo';
  }

  function initAgendaView() {
    const root = document.getElementById('view-agenda');
    const cal = document.getElementById('ag-cal');
    const det = document.getElementById('ag-detail');
    const host = stateHost(root, 'aluno-agenda-state');

    function toDate(s) {
      const parts = String(s || '').slice(0, 10).split('-').map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function daysBetween(a, b) {
      return Math.round((toDate(b) - toDate(a)) / 864e5) + 1;
    }

    function renderList(events) {
      if (!cal) return;
      if (!events.length) {
        window.PulseUiState?.set(cal, 'empty', 'Nao ha eventos ativos na sua agenda.', { replace: true });
        if (det) det.classList.remove('open');
        return;
      }

      cal.classList.remove('pulse-ui-state-host');
      const ordered = [...events].sort(function (a, b) { return a.start.localeCompare(b.start); });
      cal.innerHTML = ordered.map(function (ev) {
        const tipoCls = 'ev-tipo-' + ev.tipo;
        return `
          <div class="ag-week" style="min-height:auto">
            <div class="ag-ev ${tipoCls}" style="position:static;display:flex;justify-content:space-between;gap:12px;cursor:pointer" onclick="window.__agShowDetail(${ev.id})" title="${ev.title}">
              <span>${ev.title}</span>
              <span>${fmtDate(ev.start)} · ${ev.hora}</span>
            </div>
          </div>`;
      }).join('');
      showDetail(ordered[0].id);
    }

    function showDetail(id) {
      const ev = agendaEventosAtivos.find(function (item) { return Number(item.id) === Number(id); });
      if (!ev || !det) return;
      const days = daysBetween(ev.start, ev.end);
      const dateLabel = days > 1 ? `${fmtDate(ev.start)} – ${fmtDate(ev.end)}` : fmtDate(ev.start);
      det.innerHTML = `
        <div class="ag-det-head">
          <div class="ag-det-title">${ev.title}</div>
          <button class="ag-det-close" onclick="document.getElementById('ag-detail').classList.remove('open')"><i class="ti ti-x"></i></button>
        </div>
        <span class="ag-det-badge ev-tipo-${ev.tipo}"><i class="ti ti-calendar-event"></i> ${ev.tipo}</span>
        <div class="ag-det-rows">
          <div class="ag-det-row"><i class="ti ti-calendar"></i><div><div class="ag-det-lbl">Data</div><div class="ag-det-val">${dateLabel}</div></div></div>
          <div class="ag-det-row"><i class="ti ti-clock"></i><div><div class="ag-det-lbl">Hora</div><div class="ag-det-val">${ev.hora}</div></div></div>
          <div class="ag-det-row"><i class="ti ti-user-circle"></i><div><div class="ag-det-lbl">Responsavel</div><div class="ag-det-val">${ev.responsavel} <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;vertical-align:middle;background:rgba(0,56,112,.10);color:#003870">${ev.occLabel}</span></div></div></div>
          <div class="ag-det-row"><i class="ti ti-notes"></i><div><div class="ag-det-lbl">Descricao</div><div class="ag-det-val">${ev.desc}</div></div></div>
        </div>`;
      det.classList.add('open');
    }

    window.__agShowDetail = showDetail;
    setState(host, 'loading', 'Carregando agenda...');
    try {
      const idAluno = idAlunoSessao();
      alunoApi().get('/agenda', { query: { idAluno } })
        .then(function (response) {
          clearState(host);
          const items = Array.isArray(response.data) ? response.data : [];
          agendaEventosAtivos = items.map(normalizeAgendaItem).filter(function (item) {
            return item.start && !statusCancelado(item.status);
          });
          renderList(agendaEventosAtivos);
        })
        .catch(function (error) {
          setState(host, 'error', window.PulseUiState?.messageFrom(error, 'Não foi possível carregar a agenda.') || 'Não foi possível carregar a agenda.');
          if (cal) window.PulseUiState?.set(cal, 'error', 'Agenda indisponivel no momento.', { replace: true });
        });
    } catch (error) {
      setState(host, 'error', error.message);
      if (cal) window.PulseUiState?.set(cal, 'error', error.message, { replace: true });
    }
  }

})();
