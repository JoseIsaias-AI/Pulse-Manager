// Portal Psicólogo — interatividade
// O gráfico de bem-estar já é inicializado pelo script inline no HTML.
// Este arquivo cuida apenas dos botões "Notificar".

document.addEventListener('DOMContentLoaded', function () {
  initNotificar();
});

function initNotificar() {
  var buttons = document.querySelectorAll('.btn-notificar');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.alerta-item');
      var nomeEl = item ? item.querySelector('.alerta-nome') : null;
      var nome = nomeEl ? (nomeEl.textContent || '') : '';
      console.log('Notificação enviada para: ' + nome);
      // TODO: integrar com POST /notificacoes quando endpoint disponível
    });
  });
}
