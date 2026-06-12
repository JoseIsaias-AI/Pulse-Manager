function openModal() {
  document.getElementById('overlay').classList.add('open');
  document.getElementById('main-content').classList.add('blurred');
}
function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('main-content').classList.remove('blurred');
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeModal();
}

function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectStatus(el, type) {
  const row = el.closest('.status-selector');
  row.querySelectorAll('.status-opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
}

function selectJornada(el) {
  const row = el.closest('.status-selector');
  row.querySelectorAll('.status-opt').forEach(o => {
    o.classList.remove('sel');
    o.style.fontWeight = '500';
  });
  el.classList.add('sel');
}

function updateHeader() {
  const val = document.getElementById('f-nome').value;
  document.getElementById('m-name').textContent = val || 'Marianne Oliveira';
  const parts = val.trim().split(' ');
  const init = parts.length >= 2 ? parts[0][0] + parts[parts.length-1][0] : (parts[0][0] + (parts[0][1] || ''));
  document.getElementById('m-initials').textContent = init.toUpperCase();
}

function updateRisco(val) {
  const fill = document.getElementById('risco-fill');
  const lbl  = document.getElementById('risco-val');
  fill.style.width = val + '%';
  const n = parseInt(val);
  if (n < 34)      { fill.style.background = 'var(--green-600)'; lbl.style.color = 'var(--green-700)'; lbl.textContent = 'Baixo · ' + n + '%'; }
  else if (n < 67) { fill.style.background = 'var(--amber-500)'; lbl.style.color = 'var(--amber-700)'; lbl.textContent = 'Médio · ' + n + '%'; }
  else             { fill.style.background = 'var(--red-500)';   lbl.style.color = 'var(--red-700)';   lbl.textContent = 'Alto · ' + n + '%'; }
}

function initStars() {
  const container = document.getElementById('eng-stars');
  if (!container) return;   // elemento opcional — pode não existir em todas as views
  let cur = 7;
  for (let i = 1; i <= 10; i++) {
    const s = document.createElement('div');
    s.className = 'eng-star' + (i <= cur ? ' lit' : '');
    s.dataset.i = i;
    s.onclick = () => {
      cur = parseInt(s.dataset.i);
      container.querySelectorAll('.eng-star').forEach(st => {
        st.className = 'eng-star' + (parseInt(st.dataset.i) <= cur ? ' lit' : '');
      });
      document.getElementById('eng-score').textContent = cur + ' / 10';
    };
    container.appendChild(s);
  }
  const score = document.createElement('span');
  score.id = 'eng-score';
  score.className = 'eng-score';
  score.textContent = '7 / 10';
  container.appendChild(score);
}
initStars();

function saveProfile() {
  closeModal();
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Auto-open desativado — o SPA controla quando abrir
// openModal();
