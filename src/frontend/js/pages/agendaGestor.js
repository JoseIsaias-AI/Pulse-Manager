(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════
     VIEW: AGENDA GESTOR
     Extraído de spaGestor.js › initAgendaView()
  ════════════════════════════════════════════════════════════ */
  function initAgendaView() {
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

  initAgendaView();

})();
