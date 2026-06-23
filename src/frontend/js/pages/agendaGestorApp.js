(function () {
  'use strict';

  const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  let initialized = false;
  let events = [];
  let selectedId = null;
  let editingId = null;
  let viewDate = new Date();

  function api() {
    if (!window.PulseApi) throw new Error('Cliente HTTP nao carregado.');
    return window.PulseApi;
  }

  function pulseUser() {
    try {
      return JSON.parse(sessionStorage.getItem('pulseUser') || 'null');
    } catch (_error) {
      return null;
    }
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function isoDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function normalizeDate(value) {
    return String(value || '').slice(0, 10);
  }

  function feedback(message, error, state) {
    const element = document.querySelector('[data-agenda-feedback]');
    if (!element) return;
    if (!message) return window.PulseUiState.clear(element);
    window.PulseUiState.set(element, state || (error ? 'error' : 'success'), message);
  }

  function configureForm() {
    ['ag-f-nome', 'ag-f-role', 'ag-f-type', 'ag-f-desc'].forEach((id) => {
      document.getElementById(id)?.closest('.ag-field')?.setAttribute('hidden', '');
    });

    const target = document.getElementById('ag-f-target');
    if (target) {
      target.innerHTML = '<option value="aluno">Um aluno (por ID numerico)</option>';
      target.closest('.ag-field')?.querySelector('label')?.replaceChildren('Destinatario');
    }

    const targetDetail = document.getElementById('ag-target-detail');
    if (targetDetail) {
      targetDetail.innerHTML = '<div class="ag-field"><label>ID numerico do aluno</label><input type="number" min="1" step="1" id="ag-f-tid" placeholder="Ex.: 1"></div>';
    }

    const titleLabel = document.getElementById('ag-f-title')?.closest('.ag-field')?.querySelector('label');
    if (titleLabel) titleLabel.textContent = 'Registro do compromisso';

    const footer = document.querySelector('#view-agenda .ag-form-footer');
    if (footer && !footer.querySelector('[data-agenda-feedback]')) {
      const status = document.createElement('p');
      status.dataset.agendaFeedback = '';
      status.hidden = true;
      status.style.cssText = 'font-size:11px;margin-bottom:8px;';
      footer.prepend(status);
    }
  }

  function activeEvents() {
    return events.filter((event) => Number(event.status) !== 0);
  }

  function renderCalendar() {
    const calendar = document.getElementById('ag-cal');
    if (!calendar) return;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - first.getDay());
    const today = isoDate(new Date());
    const weeks = [];

    for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
      const week = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + (weekIndex * 7) + dayIndex);
        week.push(date);
      }
      weeks.push(week);
    }

    calendar.innerHTML = `
      <div class="ag-cal-header">
        <span class="ag-cal-title">${MONTHS[month]} ${year}</span>
        <div class="ag-cal-nav">
          <button class="ag-cal-nav-btn" data-agenda-prev aria-label="Mes anterior"><i class="ti ti-chevron-left"></i></button>
          <button class="ag-cal-nav-btn" data-agenda-next aria-label="Proximo mes"><i class="ti ti-chevron-right"></i></button>
        </div>
      </div>
      <div class="ag-cal-weekdays">${WEEKDAYS.map((day, index) => `<div class="ag-cal-wd${index === 0 || index === 6 ? ' weekend' : ''}">${day}</div>`).join('')}</div>
      <div class="ag-cal-body">
        ${weeks.map((week) => {
          const weekEvents = activeEvents().filter((event) => week.some((date) => isoDate(date) === normalizeDate(event.data)));
          return `<div class="ag-week">
            <div class="ag-week-days">${week.map((date, index) => {
              const dateValue = isoDate(date);
              return `<div class="ag-cell${date.getMonth() !== month ? ' other-month' : ''}"><div class="ag-day-num${dateValue === today ? ' today' : ''}${index === 0 || index === 6 ? ' weekend' : ''}">${date.getDate()}</div></div>`;
            }).join('')}</div>
            <div class="ag-week-events">${weekEvents.map((event) => {
              const column = week.findIndex((date) => isoDate(date) === normalizeDate(event.data)) + 1;
              return `<div class="ag-ev-row"><button class="ag-event${selectedId === event.idAgenda ? ' selected' : ''}" style="grid-column:${column};background:#003870;border:0" data-agenda-id="${event.idAgenda}">${escapeHtml(event.registro)}</button></div>`;
            }).join('')}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="ag-cal-footer">${activeEvents().length} compromisso(s) ativo(s)</div>`;

    calendar.querySelector('[data-agenda-prev]')?.addEventListener('click', () => {
      viewDate = new Date(year, month - 1, 1);
      renderCalendar();
    });
    calendar.querySelector('[data-agenda-next]')?.addEventListener('click', () => {
      viewDate = new Date(year, month + 1, 1);
      renderCalendar();
    });
    calendar.querySelectorAll('[data-agenda-id]').forEach((button) => {
      button.addEventListener('click', () => selectEvent(Number(button.dataset.agendaId)));
    });
  }

  function selectEvent(idAgenda) {
    selectedId = idAgenda;
    const event = events.find((item) => item.idAgenda === idAgenda);
    const detail = document.getElementById('ag-detail');
    if (!event || !detail) return;
    detail.innerHTML = `
      <div class="ag-detail-header">
        <div class="ag-detail-title">${escapeHtml(event.registro)}</div>
        <button class="ag-detail-close" data-agenda-close><i class="ti ti-x"></i></button>
      </div>
      <div class="ag-detail-row">
        <div class="ag-detail-item"><i class="ti ti-calendar"></i>${escapeHtml(normalizeDate(event.data))}</div>
        <div class="ag-detail-item"><i class="ti ti-clock"></i>${escapeHtml(event.horaInicio || 'Horario nao informado')}</div>
        <div class="ag-detail-item"><i class="ti ti-user"></i>Aluno #${escapeHtml(event.idAluno)}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="ag-submit-btn" type="button" data-agenda-edit style="width:auto;padding:8px 14px;"><i class="ti ti-pencil"></i> Editar</button>
        <button class="ag-submit-btn" type="button" data-agenda-cancel style="width:auto;padding:8px 14px;background:#B42318;"><i class="ti ti-trash"></i> Cancelar compromisso</button>
      </div>`;
    detail.classList.add('open');
    detail.querySelector('[data-agenda-close]')?.addEventListener('click', () => detail.classList.remove('open'));
    detail.querySelector('[data-agenda-edit]')?.addEventListener('click', () => startEdit(event));
    detail.querySelector('[data-agenda-cancel]')?.addEventListener('click', () => cancelEvent(event));
    renderCalendar();
  }

  function startEdit(event) {
    editingId = event.idAgenda;
    document.getElementById('ag-f-title').value = event.registro;
    document.getElementById('ag-f-date').value = normalizeDate(event.data);
    document.getElementById('ag-f-time').value = String(event.horaInicio || '').slice(0, 5);
    document.getElementById('ag-f-tid').value = event.idAluno;
    const heading = document.querySelector('#view-agenda .ag-form-head-title');
    const button = document.querySelector('#view-agenda .ag-submit-btn[onclick]');
    if (heading) heading.textContent = 'Editar Evento';
    if (button) button.innerHTML = '<i class="ti ti-device-floppy"></i> Salvar alteracoes';
    feedback('', false);
  }

  function resetForm() {
    editingId = null;
    ['ag-f-title', 'ag-f-date', 'ag-f-time', 'ag-f-tid'].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    const heading = document.querySelector('#view-agenda .ag-form-head-title');
    const button = document.querySelector('#view-agenda .ag-submit-btn[onclick]');
    if (heading) heading.textContent = 'Adicionar Evento';
    if (button) button.innerHTML = '<i class="ti ti-plus"></i> Adicionar evento';
  }

  function formPayload() {
    const user = pulseUser();
    const registro = document.getElementById('ag-f-title')?.value.trim();
    const data = document.getElementById('ag-f-date')?.value;
    const horaInicio = document.getElementById('ag-f-time')?.value;
    const idAluno = Number(document.getElementById('ag-f-tid')?.value);
    const idMembro = Number(user?.id);
    if (!registro || registro.length < 3) throw new Error('Informe um registro com pelo menos 3 caracteres.');
    if (!data) throw new Error('Informe a data do compromisso.');
    if (!Number.isInteger(idAluno) || idAluno <= 0) throw new Error('Informe um ID de aluno valido.');
    if (!Number.isInteger(idMembro) || idMembro <= 0) throw new Error('Nao foi possivel identificar o gestor logado.');
    return { tipoUser: 'aluno', registro, data, horaInicio: horaInicio || undefined, idMembro, idAluno };
  }

  async function saveEvent() {
    const button = document.querySelector('#view-agenda .ag-submit-btn[onclick]');
    try {
      const payload = formPayload();
      if (button) button.disabled = true;
      feedback(editingId ? 'Atualizando compromisso...' : 'Criando compromisso...', false, 'loading');
      if (editingId) await api().patch(`/agenda/${editingId}`, payload);
      else await api().post('/agenda', payload);
      feedback(editingId ? 'Compromisso atualizado.' : 'Compromisso criado.', false);
      const date = payload.data.split('-').map(Number);
      viewDate = new Date(date[0], date[1] - 1, 1);
      resetForm();
      await loadEvents();
    } catch (error) {
      feedback(error.message || 'Nao foi possivel salvar o compromisso.', true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function cancelEvent(event) {
    try {
      feedback('Cancelando compromisso...', false, 'loading');
      await api().delete(`/agenda/${event.idAgenda}`);
      feedback('Compromisso cancelado.', false);
      document.getElementById('ag-detail')?.classList.remove('open');
      selectedId = null;
      await loadEvents();
    } catch (error) {
      feedback(error.message || 'Nao foi possivel cancelar o compromisso.', true);
    }
  }

  async function loadEvents() {
    try {
      feedback('Carregando compromissos...', false, 'loading');
      const response = await api().get('/agenda');
      events = Array.isArray(response.data) ? response.data : [];
      if (window.PulseUiState.isEmpty(events)) feedback('Nenhum compromisso cadastrado.', false, 'empty');
      else feedback('', false);
      renderCalendar();
    } catch (error) {
      events = [];
      renderCalendar();
      feedback(error.message || 'Nao foi possivel carregar a agenda.', true);
    }
  }

  async function initialize() {
    if (initialized) return;
    initialized = true;
    configureForm();
    window.agUpdateTargetField = function () {};
    window.agAddEvent = saveEvent;
    await loadEvents();
  }

  window.initAgendaGestorApp = initialize;
})();
