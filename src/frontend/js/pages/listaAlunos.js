(function () {
  'use strict';

  const API_BASE = window.PULSE_API_BASE
    || (window.location.port === '3000' ? '/api' : 'http://localhost:3000/api');
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

  function normalizeStudent(aluno, index) {
    const [bg, tc] = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const employed = aluno.empregabilidade === 'empregado';
    const risk = aluno.riscoEvasao === 'alto';
    const attention = aluno.riscoEvasao === 'medio';
    const inactive = aluno.status === 'inativo' || aluno.status === 'desligado';
    const st = risk ? 'risco' : attention ? 'atencao' : inactive ? 'inativo' : employed ? 'empregado' : 'ativa';
    const progress = Math.max(0, Math.min(100, Number(aluno.engajamento) || 0));

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
      mod: aluno.nivelJornada || aluno.categoria || aluno.status || 'Sem etapa informada',
      pct: progress,
      nota: progress / 10,
      eng: progress / 10,
      employability: aluno.empregabilidade,
      schooling: aluno.escolaridade,
      entryYear: aluno.dataIngresso ? String(aluno.dataIngresso).slice(0, 4) : ''
    };
  }

  function apiUrl(filters) {
    const params = new URLSearchParams({ limite: '100' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return `${API_BASE}/alunos?${params.toString()}`;
  }

  async function fetchStudents(filters, signal) {
    let response;
    try {
      response = await fetch(apiUrl(filters), { signal });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error('Nao foi possivel conectar a API. Inicie o backend com "npm run dev:local".');
    }

    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.success) {
      throw new Error(body.message || 'Nao foi possivel consultar os alunos.');
    }
    return body.data.alunos || [];
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
      initialized: false
    };
  }

  function renderEmpty(instance, message, error) {
    instance.grid.innerHTML = `
      <div class="al-empty ${error ? 'al-empty--error' : ''}">
        <i class="ti ${error ? 'ti-alert-circle' : 'ti-users-off'}"></i>
        <span>${escapeHtml(message)}</span>
      </div>
    `;
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
    instance.grid.innerHTML = '<div class="al-empty"><i class="ti ti-loader-2 al-spin"></i><span>Consultando alunos...</span></div>';

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

  if (!document.getElementById('view-alunos')) {
    initialize();
  }
})();
