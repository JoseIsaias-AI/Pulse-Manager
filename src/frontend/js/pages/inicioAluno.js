// Portal Aluno — interatividade complementar
// Os gráficos já são inicializados pelo script inline no HTML.
// Este arquivo cuida apenas de funcionalidades adicionais.

document.addEventListener('DOMContentLoaded', function () {
  // Seletor de módulo (tabs): só reanima se ainda não inicializado inline
  if (!window.__portalAlunoInited) {
    window.__portalAlunoInited = true;

    initEmojiSelector();
    initModuleTabs();
  }
});

function initEmojiSelector() {
  var buttons = document.querySelectorAll('.emoji-btn');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('emoji-selected'); });
      btn.classList.add('emoji-selected');

      var mood = btn.getAttribute('aria-label') || '';
      console.log('Humor registrado: ' + mood);
      // TODO: enviar para POST /saude-mental quando endpoint estiver disponível
    });
  });
}

function initModuleTabs() {
  var tabs = document.querySelectorAll('.mod-tab');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('mod-current');
        if (t.textContent && !t.textContent.includes('✓')) {
          t.classList.add('mod-pending');
        }
      });
      tab.classList.remove('mod-pending', 'mod-done');
      tab.classList.add('mod-current');
    });
  });
}
