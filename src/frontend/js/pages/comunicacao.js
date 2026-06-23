(function () {
  'use strict';

  var comunicacoes = [];
  var oportunidades = [];
  var alunos = [];

  function sessao() {
    var usuario;
    try { usuario = JSON.parse(sessionStorage.getItem('pulseUser') || 'null'); } catch (_error) { usuario = null; }
    var id = Number(usuario && usuario.id);
    if (!usuario || !['gestor', 'psicologo'].includes(usuario.perfil) || !Number.isInteger(id) || id < 1) {
      throw new Error('Sessão inválida. Entre novamente para acessar a comunicação.');
    }
    return { id: id, nome: usuario.nome || 'Equipe Pulse Mais', perfil: usuario.perfil };
  }

  function extrairAlunos(resposta) {
    return resposta && resposta.data && Array.isArray(resposta.data.alunos)
      ? resposta.data.alunos
      : [];
  }

  function criarInterface() {
    var estilo = document.createElement('style');
    estilo.textContent = '.com-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:20px}.com-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}.com-fields label{font-size:11px;color:#4d5663;display:flex;flex-direction:column;gap:4px}.com-fields .wide{grid-column:1/-1}.com-fields input,.com-fields select,.com-fields textarea{border:1px solid #dce2e9;border-radius:7px;padding:8px;font:inherit}.com-list{display:flex;flex-direction:column;gap:8px;max-height:230px;overflow:auto}.com-card{border:1px solid #e3e7ec;border-radius:8px;padding:10px;background:#fff}.com-card strong{display:block;font-size:12px}.com-card p,.com-card small{font-size:11px;color:#6b7684}.com-actions{display:flex;justify-content:flex-end;margin-top:10px}.com-status{font-size:11px;min-height:18px;margin-top:7px}.com-section-title{font-size:13px;font-weight:700;color:#003870;margin:0 0 10px}.com-subtitle{font-size:11px;font-weight:600;color:#6b7684;margin:18px 0 8px}';
    document.head.appendChild(estilo);

    var overlay = document.createElement('div');
    overlay.id = 'comunicacao-overlay';
    overlay.className = 'overlay';
    overlay.innerHTML = '<div class="modal" style="width:min(1080px,94vw);max-width:1080px;max-height:90vh;overflow:auto">' +
      '<div class="modal-header"><div class="mh-top"><div class="modal-avatar"><i class="ti ti-speakerphone"></i></div><div><div class="modal-name">Central de comunicação</div><div class="modal-meta">Notificações e oportunidades reais</div></div></div><button class="close-btn" id="com-fechar" type="button"><i class="ti ti-x"></i></button></div>' +
      '<div class="modal-body com-grid">' +
        '<section><h3 class="com-section-title">Nova comunicação</h3><div class="com-fields">' +
          '<label class="wide">Aluno<select id="com-aluno"><option value="">Carregando...</option></select></label>' +
          '<label>Título<input id="com-titulo" maxlength="255"></label><label>Tipo<select id="com-tipo"><option value="informativo">Informativo</option><option value="alerta">Alerta</option><option value="convite">Convite</option><option value="urgente">Urgente</option><option value="outro">Outro</option></select></label>' +
          '<label class="wide">Mensagem<textarea id="com-mensagem" rows="3" maxlength="500"></textarea></label></div>' +
          '<div class="com-status" id="com-status" role="status"></div><div class="com-actions"><button class="btn btn-primary" id="com-enviar" type="button">Enviar</button></div>' +
          '<div class="com-subtitle">Comunicações enviadas</div><div class="com-list" id="com-lista"></div></section>' +
        '<section><h3 class="com-section-title">Nova oportunidade</h3><div class="com-fields">' +
          '<label>Título<input id="op-titulo" maxlength="255"></label><label>Tipo<select id="op-tipo"><option value="emprego">Emprego</option><option value="estagio">Estágio</option><option value="curso">Curso</option><option value="evento">Evento</option><option value="bolsa">Bolsa</option><option value="voluntariado">Voluntariado</option><option value="outro">Outro</option></select></label>' +
          '<label class="wide">Descrição<textarea id="op-descricao" rows="3" maxlength="500"></textarea></label><label class="wide">Prazo<input id="op-prazo" type="date"></label></div>' +
          '<div class="com-status" id="op-status" role="status"></div><div class="com-actions"><button class="btn btn-primary" id="op-criar" type="button">Publicar</button></div>' +
          '<div class="com-subtitle">Oportunidades publicadas</div><div class="com-list" id="op-lista"></div></section>' +
      '</div></div>';
    document.body.appendChild(overlay);

    var botao = document.createElement('button');
    botao.id = 'abrir-comunicacao';
    botao.type = 'button';
    botao.className = 'btn btn-primary';
    botao.innerHTML = '<i class="ti ti-message-circle"></i> Comunicação';
    var acoes = document.querySelector('.menuSuperior__actions');
    if (acoes) acoes.prepend(botao);
  }

  function definirStatus(id, texto, tipo) {
    var el = document.getElementById(id);
    if (!el) return;
    window.PulseUiState.set(el, tipo === 'erro' ? 'error' : tipo === 'sucesso' ? 'success' : tipo, texto);
  }

  function card(titulo, corpo, meta) {
    var item = document.createElement('article');
    item.className = 'com-card';
    var strong = document.createElement('strong'); strong.textContent = titulo || 'Sem título';
    var p = document.createElement('p'); p.textContent = corpo || 'Sem descrição.';
    var small = document.createElement('small'); small.textContent = meta || '';
    item.append(strong, p, small);
    return item;
  }

  function renderComunicacoes() {
    var lista = document.getElementById('com-lista');
    window.PulseUiState.clear(lista, { replace: true });
    if (!comunicacoes.length) return window.PulseUiState.set(lista, 'empty', 'Nenhuma comunicação cadastrada.', { replace: true });
    comunicacoes.forEach(function (item) {
      var aluno = alunos.find(function (a) { return Number(a.idAluno) === Number(item.idAluno); });
      lista.appendChild(card(item.titulo, item.mensagem, (aluno ? aluno.nome : 'Aluno #' + item.idAluno) + ' · ' + item.tipo));
    });
  }

  function renderOportunidades() {
    var lista = document.getElementById('op-lista');
    window.PulseUiState.clear(lista, { replace: true });
    if (!oportunidades.length) return window.PulseUiState.set(lista, 'empty', 'Nenhuma oportunidade publicada.', { replace: true });
    oportunidades.forEach(function (item) {
      lista.appendChild(card(item.titulo, item.descricao, item.tipo + ' · prazo: ' + (item.prazoInscricao || 'não informado')));
    });
  }

  function preencherAlunos() {
    var select = document.getElementById('com-aluno');
    select.replaceChildren(new Option('Selecione...', ''));
    alunos.forEach(function (aluno) { select.add(new Option(aluno.nome + ' · ' + (aluno.codigoPm || '#' + aluno.idAluno), aluno.idAluno)); });
  }

  async function carregar() {
    definirStatus('com-status', 'Carregando comunicações...', 'loading');
    definirStatus('op-status', 'Carregando oportunidades...', 'loading');
    try {
      var respostas = await Promise.all([
        window.PulseApi.get('/comunicacao'),
        window.PulseApi.get('/comunicacao/oportunidades'),
        window.PulseApi.get('/alunos', { query: { limite: 100 } })
      ]);
      comunicacoes = Array.isArray(respostas[0].data) ? respostas[0].data : [];
      oportunidades = Array.isArray(respostas[1].data) ? respostas[1].data : [];
      alunos = extrairAlunos(respostas[2]);
      preencherAlunos(); renderComunicacoes(); renderOportunidades();
      definirStatus('com-status', comunicacoes.length + ' comunicação(ões) carregada(s).', 'sucesso');
      definirStatus('op-status', oportunidades.length + ' oportunidade(s) carregada(s).', 'sucesso');
    } catch (error) {
      definirStatus('com-status', error.message || 'Falha ao carregar comunicações.', 'erro');
      definirStatus('op-status', error.message || 'Falha ao carregar oportunidades.', 'erro');
    }
  }

  async function enviar() {
    var idAluno = Number(document.getElementById('com-aluno').value);
    var titulo = document.getElementById('com-titulo').value.trim();
    var mensagem = document.getElementById('com-mensagem').value.trim();
    if (!idAluno || titulo.length < 3 || mensagem.length < 5) return definirStatus('com-status', 'Selecione um aluno e preencha título e mensagem.', 'erro');
    var botao = document.getElementById('com-enviar');
    try {
      var user = sessao(); botao.disabled = true; definirStatus('com-status', 'Enviando...', 'loading');
      var resposta = await window.PulseApi.post('/comunicacao', { titulo: titulo, idAluno: idAluno, mensagem: mensagem, tipo: document.getElementById('com-tipo').value, idRemetente: user.id, tipoRemetente: user.perfil === 'psicologo' ? 'psicologo' : 'membro_equipe', nomeRemetente: user.nome });
      comunicacoes.unshift(Object.assign({}, resposta.data, { mensagem: mensagem })); renderComunicacoes();
      document.getElementById('com-titulo').value = ''; document.getElementById('com-mensagem').value = '';
      definirStatus('com-status', 'Comunicação enviada com sucesso.', 'sucesso');
    } catch (error) { definirStatus('com-status', error.message || 'Falha ao enviar comunicação.', 'erro'); }
    finally { botao.disabled = false; }
  }

  async function publicar() {
    var titulo = document.getElementById('op-titulo').value.trim();
    if (titulo.length < 3) return definirStatus('op-status', 'Informe um título válido.', 'erro');
    var botao = document.getElementById('op-criar');
    try {
      var user = sessao();
      if (user.perfil !== 'gestor') throw new Error('Apenas gestores podem publicar oportunidades.');
      botao.disabled = true; definirStatus('op-status', 'Publicando...', 'loading');
      var descricao = document.getElementById('op-descricao').value.trim();
      var prazo = document.getElementById('op-prazo').value || undefined;
      var resposta = await window.PulseApi.post('/comunicacao/oportunidades', { titulo: titulo, descricao: descricao || undefined, tipo: document.getElementById('op-tipo').value, prazoInscricao: prazo, idMembro: user.id });
      oportunidades.unshift(Object.assign({}, resposta.data, { descricao: descricao })); renderOportunidades();
      document.getElementById('op-titulo').value = ''; document.getElementById('op-descricao').value = ''; document.getElementById('op-prazo').value = '';
      definirStatus('op-status', 'Oportunidade publicada com sucesso.', 'sucesso');
    } catch (error) { definirStatus('op-status', error.message || 'Falha ao publicar oportunidade.', 'erro'); }
    finally { botao.disabled = false; }
  }

  criarInterface();
  document.getElementById('abrir-comunicacao').addEventListener('click', function () { document.getElementById('comunicacao-overlay').classList.add('open'); carregar(); });
  document.getElementById('com-fechar').addEventListener('click', function () { document.getElementById('comunicacao-overlay').classList.remove('open'); });
  document.getElementById('com-enviar').addEventListener('click', enviar);
  document.getElementById('op-criar').addEventListener('click', publicar);
  window.Comunicacao = { carregar: carregar, extrairAlunos: extrairAlunos };
})();
