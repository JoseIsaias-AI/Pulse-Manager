(function () {
  'use strict';

  const PER_PAGE = 9;
  const AVATAR_COLORS = [
    ['#E0E7FF', '#4338CA'],
    ['#FFE4E1', '#DC2626'],
    ['#DCFCE7', '#15803D'],
    ['#CFFAFE', '#0E7490'],
    ['#F3E8FF', '#7E22CE'],
    ['#FEF3C7', '#92400E']
  ];
  const SORT_CONTROLS = [
    {
      id: 'btn-desemp',
      key: 'pct',
      modes: ['none', 'desc', 'asc'],
      labels: ['Desempenho', 'Desempenho ↑', 'Desempenho ↓']
    },
    {
      id: 'btn-nota',
      key: 'nota',
      modes: ['none', 'desc', 'asc'],
      labels: ['Nota Média', 'Nota Média ↑', 'Nota Média ↓']
    },
    {
      id: 'btn-eng',
      key: 'eng',
      modes: ['none', 'desc', 'asc'],
      labels: ['Engajamento', 'Engajamento ↑', 'Engajamento ↓']
    },
    {
      id: 'btn-ord',
      key: 'name',
      modes: ['none', 'az', 'za'],
      labels: ['Ordenar', 'A → Z', 'Z → A'],
      icon: true
    }
  ];

  let activeInstance = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initials(name) {
    return String(name || 'Aluno')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  function displayLabel(value, fallback) {
    const text = String(value || fallback || '').trim();
    if (!text) return '';

    return text.replace(/(^|[\s/-])([\p{L}])/gu, (match, separator, letter) => {
      return `${separator}${letter.toLocaleUpperCase('pt-BR')}`;
    });
  }

  function normalizeStudent(aluno, index) {
    const [bg, tc] = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const employed = aluno.empregabilidade === 'empregado';
    const risk = aluno.riscoEvasao === 'alto';
    const attention = aluno.riscoEvasao === 'medio';
    const inactive = aluno.status === 'inativo' || aluno.status === 'desligado';
    const st = risk ? 'risco' : attention ? 'atencao' : inactive ? 'inativo' : employed ? 'empregado' : 'ativa';
    const progress = Math.max(0, Math.min(100, Number(aluno.frequencia ?? aluno.engajamento) || 0));

    return {
      raw: aluno,
      id: aluno.codigoPm || String(aluno.idAluno),
      name: aluno.nome,
      ini: initials(aluno.nome),
      bg,
      tc,
      age: aluno.idade,
      course: aluno.curso || aluno.programa || 'Programa Pulse Mais',
      techCourse: aluno.curso || 'Curso nao informado',
      st,
      mod: displayLabel(aluno.nivelJornada || aluno.categoria || aluno.status, 'Sem etapa informada'),
      pct: progress,
      nota: progress / 10,
      eng: progress / 10,
      employability: aluno.empregabilidade,
      schooling: aluno.escolaridade,
      entryYear: aluno.dataIngresso ? String(aluno.dataIngresso).slice(0, 4) : ''
    };
  }

  function httpClient() {
    if (!window.PulseApi) {
      throw new Error('Cliente HTTP nao carregado.');
    }
    return window.PulseApi;
  }

  async function fetchStudents(filters, signal) {
    const body = await httpClient().get('/alunos', {
      query: { limite: 100, ...(filters || {}) },
      signal
    });
    return body.data.alunos || [];
  }

  async function createStudent(payload) {
    const body = await httpClient().post('/alunos', payload);
    return body.data;
  }

  async function fetchCreateOptions() {
    const body = await httpClient().get('/alunos/opcoes-cadastro');
    return body.data || {};
  }

  function uniqueOptions(students, field) {
    return [...new Set(students.map((student) => student[field]).filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
  }

  function fillSelect(select, options) {
    if (!select) return;
    const selected = select.value;
    const firstOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOption);
    options.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = selected;
  }

  function selectedFilters(root) {
    const filters = {};
    root.querySelectorAll('[data-al-filter]').forEach((select) => {
      if (select.value) filters[select.dataset.alFilter] = select.value;
    });

    const search = document.querySelector('.menuSuperior__search-input, #top-search input');
    const searchValue = search && 'value' in search ? search.value.trim() : '';
    if (searchValue.length >= 3) filters.busca = searchValue;
    return filters;
  }

  function updateSelectState(select) {
    if (!select) return;
    select.classList.toggle('al-filter-select--active', Boolean(select.value));
  }

  function createInstance(options) {
    const root = document.getElementById('view-alunos') || document;
    const grid = root.querySelector('#al-grid');
    if (!grid) return null;

    return {
      root,
      grid,
      onSelect: options && options.onSelect,
      students: [],
      currentPage: 1,
      sort: { key: null, mode: 'none' },
      controller: null,
      createOverlay: null,
      createForm: null,
      createOptionMaps: {},
      createOptionsLoaded: false,
      initialized: false
    };
  }

  function createModalMarkup() {
    return `
      <div class="al-create-modal" role="dialog" aria-modal="true" aria-labelledby="al-create-title">
        <div class="al-create-header">
          <div>
            <h2 id="al-create-title">Novo aluno</h2>
            <p>Cadastre os dados disponiveis do aluno.</p>
          </div>
          <button class="al-create-close" type="button" aria-label="Fechar">&times;</button>
        </div>
        <form class="al-create-form">
          <fieldset class="al-create-section">
            <legend>Dados pessoais</legend>
            <div class="al-create-grid">
              <label class="al-create-field al-create-field--wide">
                Nome completo <span class="al-create-required">*</span>
                <input name="nome" type="text" minlength="3" maxlength="150" pattern="[^0-9]{3,150}" title="Nome nao pode conter numeros." required autocomplete="name">
              </label>
              <label class="al-create-field">
                E-mail <span class="al-create-required">*</span>
                <input name="email" type="email" maxlength="255" required autocomplete="email">
              </label>
              <label class="al-create-field">
                Telefone
                <input name="telefone" type="tel" maxlength="30" pattern="[0-9()+\\-.\\s]*" autocomplete="tel">
              </label>
              <label class="al-create-field">
                Idade
                <input name="idade" type="number" min="0" max="120" step="1" inputmode="numeric">
              </label>
              <label class="al-create-field">
                G&ecirc;nero
                <select name="genero" data-al-option-field="genero" data-al-empty-label="N&atilde;o informado">
                  <option value="">Carregando op&ccedil;&otilde;es...</option>
                </select>
              </label>
              <label class="al-create-field">
                Data de ingresso
                <input name="dataIngresso" type="date" min="1900-01-01" max="2100-12-31">
              </label>
              <label class="al-create-field">
                Status
                <select name="status" data-al-option-field="status" data-al-empty-label="N&atilde;o informado">
                  <option value="">Carregando op&ccedil;&otilde;es...</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset class="al-create-section">
            <legend>Jornada Pulse Mais</legend>
            <div class="al-create-grid">
              <label class="al-create-field">
                Programa
                <select name="programa" data-al-option-field="programa" data-al-empty-label="N&atilde;o informado">
                  <option value="">Carregando op&ccedil;&otilde;es...</option>
                </select>
              </label>
              <label class="al-create-field">
                Categoria
                <input name="categoria" type="text" maxlength="60" data-al-option-field="categoria">
              </label>
              <label class="al-create-field">
                Nivel da jornada
                <input name="nivelJornada" type="text" maxlength="50" data-al-option-field="nivelJornada">
              </label>
              <label class="al-create-field">
                Curso Pulse Mais
                <input name="curso" type="text" maxlength="150" data-al-option-field="curso">
              </label>
              <label class="al-create-field">
                Origem da participa&ccedil;&atilde;o
                <input name="origemParticipacao" type="text" maxlength="100" data-al-option-field="origemParticipacao">
              </label>
              <label class="al-create-field">
                Risco de evas&atilde;o
                <select name="riscoEvasao" data-al-option-field="riscoEvasao" data-al-empty-label="N&atilde;o informado">
                  <option value="">Carregando op&ccedil;&otilde;es...</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset class="al-create-section">
            <legend>Empregabilidade</legend>
            <div class="al-create-grid">
              <label class="al-create-field">
                Ocupa&ccedil;&atilde;o
                <input name="ocupacao" type="text" maxlength="150" placeholder="Digite a ocupa&ccedil;&atilde;o">
              </label>
              <label class="al-create-field">
                Tipo de v&iacute;nculo
                <input name="tipoVinculoEmpregaticio" type="text" maxlength="50" data-al-option-field="tipoVinculoEmpregaticio">
              </label>
              <label class="al-create-field">
                Renda mensal
                <input name="rendaMensal" type="number" min="0" max="99999999.99" step="0.01" inputmode="decimal">
              </label>
            </div>
          </fieldset>

          <fieldset class="al-create-section">
            <legend>Escolaridade e perfil</legend>
            <div class="al-create-grid">
              <label class="al-create-field">
                Escolaridade
                <input name="escolaridade" type="text" maxlength="100" data-al-option-field="escolaridade">
              </label>
              <label class="al-create-field">
                Perfil socioecon&ocirc;mico
                <input name="perfilSocioeconomico" type="text" maxlength="150" data-al-option-field="perfilSocioeconomico">
              </label>
            </div>
          </fieldset>

          <p class="al-create-feedback" role="alert"></p>
        </form>
        <div class="al-create-actions">
          <button class="al-create-cancel" type="button">Cancelar</button>
          <button class="al-create-submit" type="submit" form="al-create-form-placeholder">Cadastrar aluno</button>
        </div>
      </div>
    `;
  }

  function ensureCreateModal(instance) {
    if (instance.createOverlay) return;

    const overlay = document.createElement('div');
    overlay.className = 'al-create-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = createModalMarkup();
    document.body.appendChild(overlay);

    const form = overlay.querySelector('.al-create-form');
    const submit = overlay.querySelector('.al-create-submit');
    const formId = `al-create-form-${Date.now()}`;
    form.id = formId;
    submit.setAttribute('form', formId);
    instance.createOverlay = overlay;
    instance.createForm = form;
  }

  function openCreateModal(instance) {
    ensureCreateModal(instance);
    loadCreateOptions(instance);
    instance.createOverlay.classList.add('is-open');
    instance.createOverlay.setAttribute('aria-hidden', 'false');
    instance.createOverlay.querySelector('.al-create-feedback').textContent = '';
    const firstInput = instance.createForm.querySelector('input[name="nome"]');
    if (firstInput) firstInput.focus();
  }

  function closeCreateModal(instance, reset) {
    if (!instance.createOverlay) return;
    instance.createOverlay.classList.remove('is-open');
    instance.createOverlay.setAttribute('aria-hidden', 'true');
    if (reset && instance.createForm) instance.createForm.reset();
  }

  function serializeCreateForm(form, optionMaps) {
    const numericFields = new Set(['idade', 'rendaMensal']);
    const payload = {};

    new FormData(form).forEach((value, key) => {
      const normalized = String(value).trim();
      if (normalized === '') return;
      const optionMap = optionMaps[key] || {};
      const persistedValue = optionMap[normalized.toLocaleLowerCase('pt-BR')] || normalized;
      payload[key] = numericFields.has(key) ? Number(normalized) : persistedValue;
    });
    return payload;
  }

  function showNotice(message, error) {
    const previous = document.querySelector('.al-notice');
    if (previous) previous.remove();

    const notice = document.createElement('div');
    notice.className = `al-notice${error ? ' al-notice--error' : ''}`;
    notice.textContent = message;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 3600);
  }

  window.showPulseNotice = showNotice;

  function optionLabel(value) {
    const exactLabels = {
      nao_informado: 'N\u00e3o informado',
      sem_categoria: 'Sem categoria',
      em_acompanhamento: 'Em acompanhamento',
      nao_binario: 'N\u00e3o bin\u00e1rio',
      prefiro_nao_informar: 'Prefiro n\u00e3o informar',
      programa_pulse_mais: 'Programa Pulse Mais',
      ex_aluno_indicacao: 'Ex-aluno por indica\u00e7\u00e3o',
      vivencia_empresa: 'Viv\u00eancia em empresa'
    };
    const wordLabels = {
      nao: 'n\u00e3o',
      medio: 'm\u00e9dio',
      indicacao: 'indica\u00e7\u00e3o',
      publica: 'p\u00fablica',
      participacao: 'participa\u00e7\u00e3o',
      instituicao: 'institui\u00e7\u00e3o',
      socioeconomico: 'socioecon\u00f4mico',
      graduacao: 'gradua\u00e7\u00e3o',
      vinculo: 'v\u00ednculo'
    };
    const raw = String(value).trim();
    if (exactLabels[raw.toLowerCase()]) return exactLabels[raw.toLowerCase()];
    if (/^[A-Z0-9]{2,}$/.test(raw)) return raw;

    const text = raw
      .replace(/_/g, ' ')
      .split(/\s+/)
      .map((word) => wordLabels[word.toLowerCase()] || word)
      .join(' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function populateCreateOptions(instance, options) {
    instance.createForm.querySelectorAll('[data-al-option-field]').forEach((field) => {
      const values = Array.isArray(options[field.dataset.alOptionField])
        ? options[field.dataset.alOptionField]
        : [];
      const fieldName = field.dataset.alOptionField;
      instance.createOptionMaps[fieldName] = Object.fromEntries(
        values.map((value) => [optionLabel(value).toLocaleLowerCase('pt-BR'), value])
      );

      if (field.tagName === 'SELECT') {
        const selected = field.value;
        field.innerHTML = '';
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = field.dataset.alEmptyLabel || 'Nao informado';
        field.appendChild(empty);
        values.forEach((value) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = optionLabel(value);
          field.appendChild(option);
        });
        field.value = values.includes(selected) ? selected : '';
        return;
      }

      const listId = `al-options-${field.dataset.alOptionField}`;
      let list = instance.createForm.querySelector(`#${listId}`);
      if (!list) {
        list = document.createElement('datalist');
        list.id = listId;
        instance.createForm.appendChild(list);
      }
      list.innerHTML = values
        .map((value) => `<option value="${escapeHtml(optionLabel(value))}"></option>`)
        .join('');
      field.setAttribute('list', listId);
      field.placeholder = values.length ? 'Selecione ou digite um novo valor' : 'Digite um valor';
    });
  }

  async function loadCreateOptions(instance) {
    if (instance.createOptionsLoaded) return;
    try {
      populateCreateOptions(instance, await fetchCreateOptions());
      instance.createOptionsLoaded = true;
    } catch (error) {
      showNotice(error.message, true);
      instance.createForm.querySelectorAll('select[data-al-option-field]').forEach((select) => {
        select.innerHTML = '<option value="">Op&ccedil;&otilde;es indispon&iacute;veis</option>';
      });
    }
  }

  function renderEmpty(instance, message, error) {
    window.PulseUiState.set(instance.grid, error ? 'error' : 'empty', message, { replace: true });
  }

  function renderSummary(instance) {
    const rawStudents = instance.students.map((student) => student.raw);
    const total = rawStudents.length;
    const risk = rawStudents.filter((student) => student.riscoEvasao === 'alto').length;
    const employed = rawStudents.filter((student) => student.empregabilidade === 'empregado').length;
    const active = rawStudents.filter((student) => student.status === 'ativo').length;
    const average = total
      ? rawStudents.reduce((sum, student) => sum + (Number(student.engajamento) || 0), 0) / total
      : 0;

    const subtitle = instance.root.querySelector('.al-subtitle');
    if (subtitle) {
      subtitle.innerHTML = `${total} alunos &middot; <span class="al-risk">${risk} em risco</span> &middot; <span class="al-emp">${employed} empregados</span>`;
    }

    const statValues = instance.root.querySelectorAll('.al-stat-val');
    [active, risk, employed, (average / 10).toFixed(1).replace('.', ',')].forEach((value, index) => {
      if (statValues[index]) statValues[index].textContent = value;
    });

    const legendValues = instance.root.querySelectorAll('.al-leg-num');
    const legendCounts = [
      rawStudents.filter((student) => student.status === 'ativo').length,
      risk,
      rawStudents.filter((student) => student.riscoEvasao === 'medio').length,
      rawStudents.filter((student) => student.status === 'inativo' || student.status === 'desligado').length,
      employed
    ];
    legendCounts.forEach((value, index) => {
      if (legendValues[index]) legendValues[index].textContent = value;
    });
  }

  function renderPagination(instance, totalPages) {
    const info = instance.root.querySelector('#al-pag-info');
    const nums = instance.root.querySelector('#al-pag-nums');
    const prev = instance.root.querySelector('#al-prev');
    const next = instance.root.querySelector('#al-next');
    const total = instance.students.length;
    const start = total ? (instance.currentPage - 1) * PER_PAGE + 1 : 0;
    const end = Math.min(instance.currentPage * PER_PAGE, total);

    if (info) info.textContent = `Exibindo ${start}-${end} de ${total} alunos`;
    if (prev) prev.disabled = instance.currentPage <= 1;
    if (next) next.disabled = instance.currentPage >= totalPages;
    if (!nums) return;

    nums.innerHTML = '';
    for (let page = 1; page <= totalPages; page += 1) {
      const button = document.createElement('button');
      button.className = `al-pag-btn${page === instance.currentPage ? ' active' : ''}`;
      button.textContent = page;
      button.addEventListener('click', () => renderPage(instance, page));
      nums.appendChild(button);
    }
  }

  function sortedStudents(instance) {
    const students = instance.students.slice();
    const { key, mode } = instance.sort;
    if (!key || mode === 'none') return students;

    if (key === 'name') {
      students.sort((a, b) => (
        mode === 'az'
          ? a.name.localeCompare(b.name, 'pt-BR')
          : b.name.localeCompare(a.name, 'pt-BR')
      ));
      return students;
    }

    students.sort((a, b) => (
      mode === 'desc' ? Number(b[key]) - Number(a[key]) : Number(a[key]) - Number(b[key])
    ));
    return students;
  }

  function setSortButton(button, control, mode) {
    const index = Math.max(0, control.modes.indexOf(mode));
    const label = control.labels[index];
    if (control.icon) {
      button.innerHTML = `<i class="ti ti-adjustments-horizontal" style="font-size:11px;"></i> ${label}`;
    } else {
      button.textContent = label;
    }
    button.classList.toggle('al-filter-btn--active', mode !== 'none');
  }

  function resetSortControls(instance) {
    instance.sort = { key: null, mode: 'none' };
    SORT_CONTROLS.forEach((control) => {
      const button = instance.root.querySelector(`#${control.id}`);
      if (button) setSortButton(button, control, 'none');
    });
  }

  function renderPage(instance, page) {
    window.PulseUiState.clear(instance.grid, { replace: true });
    const orderedStudents = sortedStudents(instance);
    const totalPages = Math.max(1, Math.ceil(orderedStudents.length / PER_PAGE));
    instance.currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (instance.currentPage - 1) * PER_PAGE;
    const students = orderedStudents.slice(start, start + PER_PAGE);

    if (students.length === 0) {
      renderEmpty(instance, 'Nenhum aluno encontrado com os filtros selecionados.');
    } else {
      const bar = { ativa: 'c-green', risco: 'c-red', empregado: 'c-green', inativo: 'c-gray', atencao: 'c-amber' };
      const badge = {
        risco: 'Em risco',
        atencao: 'Atencao',
        empregado: 'Empregado',
        inativo: 'Inativo'
      };

      instance.grid.innerHTML = students.map((student) => `
        <button type="button" class="al-card" data-id="${escapeHtml(student.id)}">
          <div class="al-card-top">
            <div class="al-av" style="background:${student.bg};color:${student.tc};">${escapeHtml(student.ini)}</div>
            <div class="al-info">
              <div class="al-name">${escapeHtml(student.name)}</div>
              <div class="al-meta">${student.age ? `${escapeHtml(student.age)} anos` : 'Idade nao informada'} &middot; ${escapeHtml(student.techCourse)}</div>
              <div class="al-id">${escapeHtml(student.id)}</div>
            </div>
            ${badge[student.st] ? `<span class="al-badge al-badge--${student.st}">${badge[student.st]}</span>` : ''}
          </div>
          <div class="al-prog-row">
            <span class="al-module">${escapeHtml(student.mod)}</span>
            <span class="al-pct">${student.pct}%</span>
          </div>
          <div class="al-bar"><div class="al-bar-inner ${bar[student.st]}" style="width:${student.pct}%"></div></div>
        </button>
      `).join('');

      if (typeof instance.onSelect === 'function') {
        instance.grid.querySelectorAll('.al-card').forEach((card, index) => {
          card.addEventListener('click', () => instance.onSelect(students[index]));
        });
      }
    }

    renderSummary(instance);
    renderPagination(instance, totalPages);
  }

  async function applyFilters(instance) {
    if (instance.controller) instance.controller.abort();
    instance.controller = new AbortController();
    window.PulseUiState.set(instance.grid, 'loading', 'Consultando alunos...', { replace: true });

    try {
      const alunos = await fetchStudents(selectedFilters(instance.root), instance.controller.signal);
      instance.students = alunos.map(normalizeStudent);
      renderPage(instance, 1);
    } catch (error) {
      if (error.name === 'AbortError') return;
      instance.students = [];
      renderSummary(instance);
      renderPagination(instance, 1);
      renderEmpty(instance, error.message, true);
    }
  }

  async function refreshFilterOptions(instance) {
    const alunos = await fetchStudents({}, new AbortController().signal);
    const normalized = alunos.map(normalizeStudent);
    fillSelect(instance.root.querySelector('#filtro-escolaridade'), uniqueOptions(normalized, 'schooling'));
    fillSelect(instance.root.querySelector('#filtro-curso'), uniqueOptions(normalized, 'techCourse'));
    fillSelect(instance.root.querySelector('#filtro-ano-ingresso'), uniqueOptions(normalized, 'entryYear').reverse());
  }

  function bindCreateEvents(instance) {
    const openButton = instance.root.querySelector('[data-al-open-create]');
    if (!openButton) return;

    ensureCreateModal(instance);
    const overlay = instance.createOverlay;
    const form = instance.createForm;
    const closeButton = overlay.querySelector('.al-create-close');
    const cancelButton = overlay.querySelector('.al-create-cancel');
    const submitButton = overlay.querySelector('.al-create-submit');
    const feedback = overlay.querySelector('.al-create-feedback');

    openButton.addEventListener('click', () => openCreateModal(instance));
    closeButton.addEventListener('click', () => closeCreateModal(instance, true));
    cancelButton.addEventListener('click', () => closeCreateModal(instance, true));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeCreateModal(instance, true);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeCreateModal(instance, true);
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      feedback.textContent = '';
      submitButton.disabled = true;
      submitButton.textContent = 'Cadastrando...';

      let aluno;
      try {
        aluno = await createStudent(serializeCreateForm(form, instance.createOptionMaps));
      } catch (error) {
        feedback.textContent = error.message;
        return;
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Cadastrar aluno';
      }

      closeCreateModal(instance, true);
      showNotice(`${aluno.nome} foi cadastrado com o codigo ${aluno.codigoPm}.`);

      try {
        instance.createOptionsLoaded = false;
        await loadCreateOptions(instance);
        await refreshFilterOptions(instance);
        await applyFilters(instance);
      } catch (error) {
        showNotice('Aluno cadastrado, mas nao foi possivel atualizar as opcoes de filtro.', true);
      }
    });
  }

  function bindEvents(instance) {
    instance.root.querySelectorAll('[data-al-filter]').forEach((select) => {
      select.addEventListener('change', () => {
        updateSelectState(select);
        applyFilters(instance);
      });
    });

    const clear = instance.root.querySelector('#btn-limpar-filtros');
    if (clear) {
      clear.addEventListener('click', () => {
        instance.root.querySelectorAll('[data-al-filter]').forEach((select) => {
          select.value = '';
          updateSelectState(select);
        });
        resetSortControls(instance);
        applyFilters(instance);
      });
    }

    SORT_CONTROLS.forEach((control) => {
      const button = instance.root.querySelector(`#${control.id}`);
      if (!button) return;

      button.addEventListener('click', () => {
        const currentIndex = instance.sort.key === control.key
          ? control.modes.indexOf(instance.sort.mode)
          : 0;
        const mode = control.modes[(currentIndex + 1) % control.modes.length];

        resetSortControls(instance);
        if (mode !== 'none') {
          instance.sort = { key: control.key, mode };
          setSortButton(button, control, mode);
        }
        renderPage(instance, 1);
      });
    });

    const prev = instance.root.querySelector('#al-prev');
    const next = instance.root.querySelector('#al-next');
    if (prev) prev.addEventListener('click', () => renderPage(instance, instance.currentPage - 1));
    if (next) next.addEventListener('click', () => renderPage(instance, instance.currentPage + 1));

    const search = document.querySelector('.menuSuperior__search-input, #top-search input');
    if (search && 'value' in search) {
      let timer;
      search.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => applyFilters(instance), 300);
      });
    }

    bindCreateEvents(instance);
  }

  async function initialize(options) {
    if (activeInstance && activeInstance.initialized) {
      if (options && options.onSelect) activeInstance.onSelect = options.onSelect;
      return;
    }

    const instance = createInstance(options);
    if (!instance) return;
    activeInstance = instance;
    bindEvents(instance);

    try {
      const alunos = await fetchStudents({}, new AbortController().signal);
      const normalized = alunos.map(normalizeStudent);
      fillSelect(instance.root.querySelector('#filtro-escolaridade'), uniqueOptions(normalized, 'schooling'));
      fillSelect(instance.root.querySelector('#filtro-curso'), uniqueOptions(normalized, 'techCourse'));
      fillSelect(instance.root.querySelector('#filtro-ano-ingresso'), uniqueOptions(normalized, 'entryYear').reverse());
      instance.students = normalized;
      instance.initialized = true;
      renderPage(instance, 1);
    } catch (error) {
      instance.initialized = true;
      instance.students = [];
      renderSummary(instance);
      renderPagination(instance, 1);
      renderEmpty(instance, error.message, true);
    }
  }

  window.initListaAlunosView = initialize;
  window.refreshListaAlunosView = async function () {
    if (!activeInstance) return;
    await applyFilters(activeInstance);
    await refreshFilterOptions(activeInstance).catch(() => {});
  };

  if (!document.getElementById('view-alunos')) {
    initialize();
  }
})();
