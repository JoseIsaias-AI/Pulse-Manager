(function () {
  'use strict';

  var comunicacoes = [];
  var oportunidades = [];
  var alunos = [];

  function sessaoAtual() {
    try {
      var sessao = JSON.parse(sessionStorage.getItem('pulseUser') || 'null');
      var id = Number(sessao && sessao.id);
      if (!sessao || !['gestor', 'psicologo'].includes(sessao.perfil) || !Number.isInteger(id) || id <= 0) {
        throw new Error('Sessão inválida. Entre novamente para acessar a comunicação.');
      }
      return {
        id: id,
        nome: sessao.nome || 'Equipe Pulse Mais',
        perfil: sessao.perfil
      };
    } catch (error) {
      throw new Error(error.message || 'Sessão inválida. Entre novamente.');
    }
  }

  function extrairAlunos(resposta) {
    if (resposta && resposta.data && Array.isArray(resposta.data.alunos)) return resposta.data.alunos;
    if (resposta && Array.isArray(resposta.data)) return resposta.data;
    return [];
  }

  function garantirEstilos() {
    if (document.getElementById('comunicacao-style')) return;
    var estilo = document.createElement('style');
    estilo.id = 'comunicacao-style';
    estilo.textContent = [
      '.com-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:20px}',
      '.com-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.com-fields label{font-size:11px;color:#4d5663;display:flex;flex-direction:column;gap:4px}',
      '.com-fields .wide{grid-column:1/-1}',
      '.com-fields input,.com-fields select,.com-fields textarea{border:1px solid #dce2e9;border-radius:7px;padding:8px;font:inherit}',
      '.com-list{display:flex;flex-direction:column;gap:8px;max-height:230px;overflow:auto}',
      '.com-card{border:1px solid #e3e7ec;border-radius:8px;padding:10px;background:#fff}',
      '.com-card strong{display:block;font-size:12px;color:#11161d}',
      '.com-card p,.com-card small{font-size:11px;color:#6b7684}',
      '.com-card p{white-space:pre-wrap;margin:4px 0}',
      '.com-actions{display:flex;justify-content:flex-end;margin-top:10px}',
      '.com-status{font-size:11px;min-height:18px;margin-top:7px}',
      '.com-section-title{font-size:13px;font-weight:700;color:#003870;margin:0 0 10px}',
      '.com-subtitle{font-size:11px;font-weight:600;color:#6b7684;margin:18px 0 8px}'
    ].join('');
    document.head.appendChild(estilo);
  }

  function criarInterface() {
    garantirEstilos();
    if (!document.getElementById('comunicacao-overlay')) {
      var overlay = document.createElement('div');
      overlay.id = 'comunicacao-overlay';
      overlay.className = 'overlay';
      overlay.innerHTML = '<div class="modal" style="width:min(1080px,94vw);max-width:1080px;max-height:90vh;overflow:auto">' +
        '<div class="modal-header"><div class="mh-top"><div class="modal-avatar"><i class="ti ti-speakerphone"></i></div><div><div class="modal-name">Central de comunicação</div><div class="modal-meta">Notificações e oportunidades reais</div></div></div><button class="close-btn" id="fechar-comunicacao" type="button" aria-label="Fechar"><i class="ti ti-x"></i></button></div>' +
        '<div class="modal-body com-grid">' +
          '<section><h3 class="com-section-title">Nova comunicação</h3><div class="com-fields">' +
            '<label class="wide">Aluno<select id="com-aluno"><option value="">Carregando...</option></select></label>' +
            '<label>Título<input id="com-titulo" maxlength="255"></label><label>Tipo<select id="com-tipo"><option value="informativo">Informativo</option><option value="alerta">Alerta</option><option value="convite">Convite</option><option value="urgente">Urgente</option><option value="outro">Outro</option></select></label>' +
            '<label class="wide">Mensagem<textarea id="com-mensagem" rows="3" maxlength="500"></textarea></label></div>' +
            '<div class="com-status" id="com-status" role="status"></div><div class="com-actions"><button class="btn btn-primary" id="com-enviar" type="button">Enviar comunicação</button></div>' +
            '<div class="com-subtitle">Comunicações enviadas</div><div class="com-list" id="com-lista"></div></section>' +
          '<section><h3 class="com-section-title">Nova oportunidade</h3><div class="com-fields">' +
            '<label>Título<input id="op-titulo" maxlength="255"></label><label>Tipo<select id="op-tipo"><option value="emprego">Emprego</option><option value="estagio">Estágio</option><option value="curso">Curso</option><option value="evento">Evento</option><option value="bolsa">Bolsa</option><option value="voluntariado">Voluntariado</option><option value="outro">Outro</option></select></label>' +
            '<label class="wide">Descrição<textarea id="op-descricao" rows="3" maxlength="500"></textarea></label><label class="wide">Prazo<input id="op-prazo" type="date"></label></div>' +
            '<div class="com-status" id="op-status" role="status"></div><div class="com-actions"><button class="btn btn-primary" id="op-criar" type="button">Publicar oportunidade</button></div>' +
            '<div class="com-subtitle">Oportunidades publicadas</div><div class="com-list" id="op-lista"></div></section>' +
        '</div></div>';
      document.body.appendChild(overlay);
    }

    if (!document.getElementById('abrir-comunicacao')) {
      var acoes = document.querySelector('.menuSuperior__actions');
      if (acoes) {
        var botao = document.createElement('button');
        botao.id = 'abrir-comunicacao';
        botao.type = 'button';
        botao.className = 'btn btn-primary';
        botao.innerHTML = '<i class="ti ti-message-circle"></i> Comunicação';
        acoes.prepend(botao);
      }
    }
  }

  function definirStatus(id, texto, tipo) {
    var el = document.getElementById(id);
    if (!el) return;
    if (window.PulseUiState && typeof window.PulseUiState.set === 'function') {
      window.PulseUiState.set(el, tipo === 'erro' ? 'error' : tipo === 'sucesso' ? 'success' : tipo, texto);
      return;
    }
    el.textContent = texto;
    el.style.color = tipo === 'erro' ? '#B42318' : tipo === 'sucesso' ? '#1D7A36' : '#6B7684';
  }

  function limparLista(lista) {
    if (!lista) return;
    if (window.PulseUiState && typeof window.PulseUiState.clear === 'function') {
      window.PulseUiState.clear(lista, { replace: true });
    } else {
      lista.replaceChildren();
    }
  }

  function estadoVazio(lista, mensagem) {
    if (!lista) return;
    if (window.PulseUiState && typeof window.PulseUiState.set === 'function') {
      window.PulseUiState.set(lista, 'empty', mensagem, { replace: true });
      return;
    }
    lista.appendChild(criarCard('Nada por aqui ainda', mensagem, ''));
  }

  function criarCard(titulo, corpo, meta) {
    var item = document.createElement('article');
    item.className = 'com-card';
    var strong = document.createElement('strong');
    strong.textContent = titulo || 'Sem título';
    var p = document.createElement('p');
    p.textContent = corpo || 'Sem descrição.';
    var small = document.createElement('small');
    small.textContent = meta || '';
    item.append(strong, p, small);
    return item;
  }

  function renderizarComunicacoes() {
    var lista = document.getElementById('com-lista');
    limparLista(lista);
    if (!lista) return;
    if (!comunicacoes.length) {
      estadoVazio(lista, 'Nenhuma comunicação cadastrada.');
      return;
    }
    comunicacoes.forEach(function (item) {
      var aluno = alunos.find(function (a) { return Number(a.idAluno) === Number(item.idAluno); });
      var metaAluno = aluno ? aluno.nome : 'Aluno #' + item.idAluno;
      var metaData = item.dataEnvio ? ' · ' + item.dataEnvio : '';
      lista.appendChild(criarCard(item.titulo, item.mensagem, metaAluno + ' · ' + item.tipo + metaData));
    });
  }

  function renderizarOportunidades() {
    var lista = document.getElementById('op-lista');
    limparLista(lista);
    if (!lista) return;
    if (!oportunidades.length) {
      estadoVazio(lista, 'Nenhuma oportunidade publicada.');
      return;
    }
    oportunidades.forEach(function (item) {
      lista.appendChild(criarCard(item.titulo, item.descricao, item.tipo + ' · prazo: ' + (item.prazoInscricao || 'não informado')));
    });
  }

  function preencherAlunos() {
    var select = document.getElementById('com-aluno');
    if (!select) return;
    select.replaceChildren(new Option('Selecione...', ''));
    alunos.forEach(function (aluno) {
      select.add(new Option(aluno.nome + ' · ' + (aluno.codigoPm || '#' + aluno.idAluno), aluno.idAluno));
    });
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
      preencherAlunos();
      renderizarComunicacoes();
      renderizarOportunidades();
      definirStatus('com-status', comunicacoes.length + ' comunicação(ões) carregada(s).', 'sucesso');
      definirStatus('op-status', oportunidades.length + ' oportunidade(s) carregada(s).', 'sucesso');
    } catch (error) {
      definirStatus('com-status', error.message || 'Não foi possível carregar as comunicações.', 'erro');
      definirStatus('op-status', error.message || 'Não foi possível carregar as oportunidades.', 'erro');
    }
  }

  async function enviarComunicacao() {
    var idAluno = Number(document.getElementById('com-aluno') && document.getElementById('com-aluno').value);
    var titulo = (document.getElementById('com-titulo') && document.getElementById('com-titulo').value.trim()) || '';
    var mensagem = (document.getElementById('com-mensagem') && document.getElementById('com-mensagem').value.trim()) || '';
    if (!idAluno || titulo.length < 3 || mensagem.length < 5) {
      definirStatus('com-status', 'Selecione o aluno e preencha título e mensagem.', 'erro');
      return;
    }

    var botao = document.getElementById('com-enviar');
    try {
      var usuario = sessaoAtual();
      if (botao) botao.disabled = true;
      definirStatus('com-status', 'Enviando comunicação...', 'loading');
      var resposta = await window.PulseApi.post('/comunicacao', {
        titulo: titulo,
        idAluno: idAluno,
        mensagem: mensagem,
        tipo: document.getElementById('com-tipo').value,
        idRemetente: usuario.id,
        tipoRemetente: usuario.perfil === 'psicologo' ? 'psicologo' : 'membro_equipe',
        nomeRemetente: usuario.nome
      });
      comunicacoes.unshift(Object.assign({}, resposta.data, { mensagem: mensagem, nomeRemetente: usuario.nome }));
      renderizarComunicacoes();
      document.getElementById('com-titulo').value = '';
      document.getElementById('com-mensagem').value = '';
      definirStatus('com-status', 'Comunicação enviada com sucesso.', 'sucesso');
    } catch (error) {
      definirStatus('com-status', error.message || 'Não foi possível enviar a comunicação.', 'erro');
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  async function criarOportunidade() {
    var titulo = (document.getElementById('op-titulo') && document.getElementById('op-titulo').value.trim()) || '';
    if (titulo.length < 3) {
      definirStatus('op-status', 'Informe um título com pelo menos 3 caracteres.', 'erro');
      return;
    }

    var botao = document.getElementById('op-criar');
    try {
      var usuario = sessaoAtual();
      if (usuario.perfil !== 'gestor') throw new Error('A publicação de oportunidades é exclusiva do gestor.');
      if (botao) botao.disabled = true;
      definirStatus('op-status', 'Publicando oportunidade...', 'loading');
      var descricao = (document.getElementById('op-descricao') && document.getElementById('op-descricao').value.trim()) || '';
      var prazoInscricao = (document.getElementById('op-prazo') && document.getElementById('op-prazo').value) || undefined;
      var resposta = await window.PulseApi.post('/comunicacao/oportunidades', {
        titulo: titulo,
        descricao: descricao || undefined,
        tipo: document.getElementById('op-tipo').value,
        prazoInscricao: prazoInscricao,
        idMembro: usuario.id
      });
      oportunidades.unshift(Object.assign({}, resposta.data, { descricao: descricao }));
      renderizarOportunidades();
      document.getElementById('op-titulo').value = '';
      document.getElementById('op-descricao').value = '';
      document.getElementById('op-prazo').value = '';
      definirStatus('op-status', 'Oportunidade publicada com sucesso.', 'sucesso');
    } catch (error) {
      definirStatus('op-status', error.message || 'Não foi possível publicar a oportunidade.', 'erro');
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  function abrir() {
    var overlay = document.getElementById('comunicacao-overlay');
    if (overlay) overlay.classList.add('open');
    carregar();
  }

  function fechar() {
    var overlay = document.getElementById('comunicacao-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  criarInterface();
  var botaoAbrir = document.getElementById('abrir-comunicacao');
  var botaoFechar = document.getElementById('fechar-comunicacao') || document.getElementById('com-fechar');
  var botaoEnviar = document.getElementById('com-enviar');
  var botaoCriar = document.getElementById('op-criar');
  var overlay = document.getElementById('comunicacao-overlay');

  if (botaoAbrir) botaoAbrir.addEventListener('click', abrir);
  if (botaoFechar) botaoFechar.addEventListener('click', fechar);
  if (botaoEnviar) botaoEnviar.addEventListener('click', enviarComunicacao);
  if (botaoCriar) botaoCriar.addEventListener('click', criarOportunidade);
  if (overlay) {
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) fechar();
    });
  }

  window.Comunicacao = {
    abrir: abrir,
    carregar: carregar,
    extrairAlunos: extrairAlunos
  };
})();
