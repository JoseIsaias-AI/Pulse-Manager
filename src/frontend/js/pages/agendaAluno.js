(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     VIEW: AGENDA ALUNO (somente leitura — sem formulário de adição)
     Extraído de spaAluno.js › initAgendaView()
  ════════════════════════════════════════════════════════════ */
  function initAgendaView() {

    /* ── Eventos de Junho 2026 ─────────────────────────────── */
    const EVENTS = [
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
    let selectedDate = '2026-06-11';

    /* ── Helpers ───────────────────────────────────────────── */
    function toDate(s) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
    function daysBetween(a,b) { return Math.round((toDate(b)-toDate(a))/(864e5))+1; }
    function formatDate(str) { return toDate(str).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }); }
    function eventsForDay(dateStr) {
      return EVENTS
        .filter(ev => ev.start <= dateStr && ev.end >= dateStr)
        .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
    }
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
          const dateStr = valid ? `2026-06-${String(d).padStart(2, '0')}` : '';
          const hasEvents = valid && eventsForDay(dateStr).length > 0;
          const cls = [
            'ag-cell',
            !valid ? 'other-month' : '',
            isToday ? 'today' : '',
            dateStr === selectedDate ? 'selected-day' : '',
            hasEvents ? 'has-events' : ''
          ].filter(Boolean).join(' ');
          return `<div class="${cls}" ${valid ? `data-date="${dateStr}" onclick="window.__agShowDay('${dateStr}')"` : ''}><span class="ag-dn">${valid ? d : ''}</span></div>`;
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
    function showDayDetail(dateStr) {
      selectedDate = dateStr;
      const det = document.getElementById('ag-detail');
      if (!det) return;
      const dayEvents = eventsForDay(dateStr);
      const tipoLabel = { evento:'Evento', consulta:'Consulta', aula:'Aula', mentoria:'Mentoria', formatura:'Formatura' };
      const tipoIcon  = { evento:'ti-calendar-event', consulta:'ti-stethoscope', aula:'ti-school', mentoria:'ti-users', formatura:'ti-award' };
      const itemsHtml = dayEvents.length
        ? dayEvents.map(ev => `<button class="ag-day-event" type="button" onclick="window.__agShowDetail(${ev.id})">
            <span class="ag-day-event-time">${ev.hora}</span>
            <span class="ag-day-event-main">
              <strong><i class="ti ${tipoIcon[ev.tipo]}"></i> ${ev.title}</strong>
              <small>${tipoLabel[ev.tipo] || ev.tipo} · ${ev.responsavel}</small>
            </span>
            <i class="ti ti-chevron-right"></i>
          </button>`).join('')
        : `<div class="ag-day-empty">
            <i class="ti ti-calendar-off"></i>
            <strong>Nenhum evento neste dia</strong>
            <span>Quando a agenda for integrada, seus compromissos aparecerão aqui.</span>
          </div>`;

      det.innerHTML = `
        <div class="ag-det-head">
          <div>
            <div class="ag-det-kicker">Agenda do dia</div>
            <div class="ag-det-title">${formatDate(dateStr)}</div>
          </div>
          <button class="ag-det-close" onclick="document.getElementById('ag-detail').classList.remove('open')"><i class="ti ti-x"></i></button>
        </div>
        <div class="ag-day-list">${itemsHtml}</div>`;
      det.classList.add('open');
      renderCal();
      det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showDetail(id) {
      const ev = EVENTS.find(e => e.id === id);
      const det = document.getElementById('ag-detail');
      if (!ev || !det) return;
      selectedDate = ev.start;

      const tipoLabel = { evento:'Evento', consulta:'Consulta', aula:'Aula', mentoria:'Mentoria', formatura:'Formatura' };
      const tipoIcon  = { evento:'ti-calendar-event', consulta:'ti-stethoscope', aula:'ti-school', mentoria:'ti-users', formatura:'ti-award' };
      const days = daysBetween(ev.start, ev.end);
      const dateLabel = days > 1
        ? `${toDate(ev.start).toLocaleDateString('pt-BR')} – ${toDate(ev.end).toLocaleDateString('pt-BR')}`
        : toDate(ev.start).toLocaleDateString('pt-BR');

      det.innerHTML = `
        <div class="ag-det-head">
          <div>
            <div class="ag-det-kicker">Detalhe do evento</div>
            <div class="ag-det-title">${ev.title}</div>
          </div>
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
      renderCal();
      det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* Expõe o handler globalmente para os onclick do HTML gerado */
    window.__agShowDetail = showDetail;
    window.__agShowDay = showDayDetail;

    renderCal();
  }

  initAgendaView();

})();
