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

function togglePerm(el) {
  el.classList.toggle('checked');
}

function updateHeader() {
  const input    = document.getElementById('f-nome');
  const fallback = document.getElementById('m-name').textContent || '';
  const val      = input ? input.value : fallback;
  if (val) document.getElementById('m-name').textContent = val;
  const parts = (val || fallback).trim().split(' ');
  const init  = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0][0] + (parts[0][1] || ''));
  document.getElementById('m-initials').textContent = init.toUpperCase();
}

function updateCargo() {
  const cargo = document.getElementById('f-cargo').value;
  document.getElementById('m-cargo-meta').textContent = cargo + ' · Pulse Manager';
}

function saveProfile() {
  closeModal();
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Auto-open desativado — o SPA controla quando abrir
// setTimeout(openModal, 300);
