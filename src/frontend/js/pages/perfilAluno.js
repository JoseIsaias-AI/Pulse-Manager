function closeModal() {
  document.getElementById('overlay').classList.remove('open');
}

function showTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* Estrelas de engajamento — somente exibição */
(function initStars() {
  const container = document.getElementById('eng-stars-view');
  if (!container) return;
  const score = 7;
  for (let i = 1; i <= 10; i++) {
    const s = document.createElement('div');
    s.className = 'eng-star-view' + (i <= score ? ' lit' : '');
    container.appendChild(s);
  }
})();

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
