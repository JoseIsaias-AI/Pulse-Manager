/* ── navegação de abas ── */
function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── data padrão = hoje ── */
(function () {
  const input = document.getElementById('pf-data');
  if (input) input.value = new Date().toISOString().split('T')[0];
})();

/* ── estrelas de engajamento (read-only) ── */
(function initStars() {
  const container = document.getElementById('eng-stars-view');
  if (!container) return;
  for (let i = 1; i <= 10; i++) {
    const s = document.createElement('div');
    s.className = 'eng-star-view' + (i <= 7 ? ' lit' : '');
    container.appendChild(s);
  }
})();

/* ── dados iniciais de anotações ── */
const anotacoes = [
  {
    data: '2024-10-03',
    tipo: 'Triagem inicial',
    psi: 'Dra. Fernanda Lopes',
    texto: 'Primeira sessão de triagem. Aluna demonstra bom vínculo social com colegas de turma. Relata leve ansiedade em relação às entregas do Módulo 3, porém sem impacto significativo no desempenho. Recomendado acompanhamento mensal.'
  },
  {
    data: '2024-11-07',
    tipo: 'Acompanhamento',
    psi: 'Dra. Fernanda Lopes',
    texto: 'Segunda sessão. Ansiedade reduzida em relação ao período anterior. Aluna relata melhora na organização de rotina de estudos. Engajamento nas atividades em grupo permanece positivo. Nenhuma intervenção adicional necessária no momento.'
  },
  {
    data: '2024-12-12',
    tipo: 'Acompanhamento',
    psi: 'Dr. Ricardo Almeida',
    texto: 'Sessão de final de semestre. Aluna apresentou sinais de cansaço típicos do período, porém sem indicadores de sofrimento psíquico. Orientada sobre técnicas de autocuidado durante o recesso. Retorno previsto para o início do próximo módulo.'
  }
];

/* ── renderizar lista de anotações ── */
function renderLista() {
  const list = document.getElementById('psico-list');
  if (!list) return;

  if (anotacoes.length === 0) {
    list.innerHTML = '<div class="psico-empty"><i class="ti ti-notes-off"></i><span>Nenhuma anotação registrada ainda.</span></div>';
    return;
  }

  const tipoClass = { 'Triagem inicial': 'triagem', 'Sessão individual': 'sessao', 'Acompanhamento': 'acomp', 'Grupo de apoio': 'grupo', 'Orientação familiar': 'familia', 'Encaminhamento': 'enc' };

  list.innerHTML = [...anotacoes].reverse().map((a, idx) => {
    const [y, m, d] = a.data.split('-');
    const dataFmt = `${d}/${m}/${y}`;
    const cls = tipoClass[a.tipo] || 'sessao';
    const labelHtml = a.label === 'atencao'
      ? '<span class="psico-label psico-label--atencao"><i class="ti ti-alert-triangle" style="font-size:10px;"></i> Atenção</span>'
      : a.label === 'observacao'
      ? '<span class="psico-label psico-label--observacao"><i class="ti ti-eye" style="font-size:10px;"></i> Observação</span>'
      : '';
    return `
      <div class="psico-entry" id="entry-${idx}">
        <div class="psico-entry__head">
          <div class="psico-entry__date"><i class="ti ti-calendar-event"></i> ${dataFmt}</div>
          <span class="psico-tipo psico-tipo--${cls}">${a.tipo}</span>
          ${labelHtml}
          <div class="psico-entry__psi"><i class="ti ti-user-heart"></i> ${a.psi}</div>
        </div>
        <div class="psico-entry__body">${a.texto}</div>
      </div>`;
  }).join('');
}

/* ── seletor de label ── */
function pickLabel(btn) {
  const picker = document.getElementById('pf-label-picker');
  if (picker) picker.querySelectorAll('.psico-label-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const hiddenEl = document.getElementById('pf-label');
  if (hiddenEl) hiddenEl.value = btn.dataset.label;
}

/* ── registrar nova anotação ── */
function registrarAnotacao() {
  const data  = document.getElementById('pf-data').value;
  const tipo  = document.getElementById('pf-tipo').value;
  const psi   = document.getElementById('pf-psi').value.trim();
  const texto = document.getElementById('pf-texto').value.trim();
  const label = document.getElementById('pf-label')?.value || '';

  if (!data || !tipo || !psi || !texto) {
    showFormError('Preencha todos os campos antes de registrar.');
    return;
  }

  anotacoes.push({ data, tipo, psi, texto, label });
  renderLista();

  /* limpar formulário */
  document.getElementById('pf-tipo').value  = '';
  document.getElementById('pf-psi').value   = '';
  document.getElementById('pf-texto').value = '';
  document.getElementById('pf-data').value  = new Date().toISOString().split('T')[0];

  /* reset label picker */
  const picker = document.getElementById('pf-label-picker');
  if (picker) {
    picker.querySelectorAll('.psico-label-btn').forEach(b => b.classList.remove('selected'));
    picker.querySelector('[data-label=""]')?.classList.add('selected');
  }
  const hiddenEl = document.getElementById('pf-label');
  if (hiddenEl) hiddenEl.value = '';

  showSuccessToast();
}

function showFormError(msg) {
  let err = document.getElementById('form-error');
  if (!err) {
    err = document.createElement('div');
    err.id = 'form-error';
    err.className = 'psico-error';
    document.querySelector('.psico-form__actions').prepend(err);
  }
  err.textContent = msg;
  err.style.display = 'flex';
  setTimeout(() => { err.style.display = 'none'; }, 3500);
}

function showSuccessToast() {
  const t = document.getElementById('toast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── init ── */
renderLista();
