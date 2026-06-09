// Lógica da tela inicial do aluno (portal-aluno)

document.addEventListener('DOMContentLoaded', () => {
  initEmojiSelector();
  initModuleTabs();
  animateProgressBars();
});

function initEmojiSelector(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.emoji-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('emoji-selected'));
      btn.classList.add('emoji-selected');

      const mood = btn.getAttribute('aria-label') ?? '';
      console.log(`Humor registrado: ${mood}`);
      // TODO: enviar para POST /saude-mental quando endpoint estiver disponível
    });
  });
}

function initModuleTabs(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.mod-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('mod-current');
        if (!t.textContent?.includes('✓')) {
          t.classList.add('mod-pending');
        }
      });
      tab.classList.remove('mod-pending', 'mod-done');
      tab.classList.add('mod-current');
    });
  });
}

function animateProgressBars(): void {
  const bars = document.querySelectorAll<HTMLElement>('.progress-bar, .sprint-bar');

  bars.forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => {
        bar.style.transition = 'width 0.6s ease';
        bar.style.width = target;
      }, 100);
    });
  });
}
