(function () {
  'use strict';

  let comunicacoes = [];
  let oportunidades = [];
  let alunos = [];

  function sessaoAtual() {
    try {
      const sessao = JSON.parse(sessionStorage.getItem('pulseUser') || 'null');
      const id = Number(sessao && sessao.id);
      if (!sessao || !['gestor', 'psicologo'].includes(sessao.perfil) || !Number.isInteger(id) || id <= 0) {
        throw new Error('Sessão inválida. Entre novamente para acessar a comunicação.');
      }
      return { id, nome: sessao.nome || 'Equipe Pulse Mais', perfil: sessao.perfil };
    } catch (error) {
      throw new Error(error.message || 'Sessão inválida. Entre novamente.');
    }
  }

  function criarInterfaceGestor() {
    if (document.getElementById('comunicacao-overlay')) return;
    const contenedor = document.createElement('div');
    contenedor.innerHTML = `<div class="overlay" id="comunicacao-overlay">
      <div class="modal" style="max-width:1080px;width:min(1080px,94vw);max-height:90vh;overflow:auto;">
        <div class="modal-header"><div class="mh-top"><div class="modal-avatar"><i class="ti ti-speakerphone"></i></div><div><div class="modal-name">Central de comunicação</div><div class="modal-meta">Notificações e oportunidades</div></div></div><button type="button" class="close-btn" id="fechar-comunicacao"><i class="ti ti-x"></i></button></div>
        <div class="modal-body" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;">
          <section><div class="sec-label">Nova comunicação</div><div class="field-grid">
            <div class="field span2"><label>Aluno destinatário</label><select id="com-aluno"><option value="">Carregando alunos...</option></select></div>
            <div class="field"><label>Título</label><input id="com-titulo"></div><div class="field"><label>Tipo</label><select id="com-tipo"><option value="informativo">Informativo</option><option value="alerta">Alerta</option><option value="convite">Convite</option><option value="urgente">Urgente</option><option value="outro">Outro</option></select></div>
            <div class="field span2"><label>Mensagem</label><textarea id="com-mensagem" rows="3"></textarea></div></div>
            <div id="com-status" role="status" style="font-size:12px;margin:8px 0;color:#6B7684;"></div><button type="button" class="btn btn-primary" id="com-enviar">Enviar comunicação</button><div class="sec-label" style="margin-top:20px;">Comunicações enviadas</div><div id="com-lista" style="display:flex;flex-direction:column;gap:8px;"></div>
          </section>
          <section><div class="sec-label">Nova oportunidade</div><div class="field-grid">
            <div class="field"><label>Título</label><input id="op-titulo"></div><div class="field"><label>Tipo</label><select id="op-tipo"><option value="emprego">Emprego</option><option value="estagio">Estágio</option><option value="curso">Curso</option><option value="evento">Evento</option><option value="bolsa">Bolsa</option><option value="voluntariado">Voluntariado</option><option value="outro">Outro</option></select></div>
            <div class="field span2"><label>Descrição</label><textarea id="op-descricao" rows="3"></textarea></div><div class="field span2"><label>Prazo de inscrição</label><input type="date" id="op-prazo"></div></div>
            <div id="op-status" role="status" style="font-size:12px;margin:8px 0;color:#6B7684;"></div><button type="button" class="btn btn-primary" id="op-criar">Publicar oportunidade</button><div class="sec-label" style="margin-top:20px;">Oportunidades publicadas</div><div id="op-lista" style="display:flex;flex-direction:column;gap:8px;"></div>
          </section>
        </div>
      </div></div>`;
    document.body.appendChild(contenedor.firstElementChild);
  }

  function garantirBotao() {
    if (document.getElementById('abrir-comunicacao')) return;
    const acoes = document.querySelector('.menuSuperior__actions');
    if (!acoes) return;
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.id = 'abrir-comunicacao';
    botao.className = 'btn btn-primary';
    botao.innerHTML = '<i class="ti ti-message-circle"></i> Comunicação';
    acoes.prepend(botao);
  }

  function status(id, mensagem, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.style.color = tipo === 'erro' ? '#B42318' : tipo === 'sucesso' ? '#1D7A36' : '#6B7684';
  }

  function criarCard(titulo, texto, meta) {
    const card = document.createElement('article');
    card.style.cssText = 'border:1px solid #DEE3EA;border-radius:9px;padding:10px 12px;background:#fff;';
    const nome = document.createElement('strong');
    nome.style.cssText = 'display:block;font-size:12px;color:#11161D;';
    nome.textContent = titulo;
    const corpo = document.createElement('p');
    corpo.style.cssText = 'font-size:11px;color:#6B7684;margin:4px 0;white-space:pre-wrap;';
    corpo.textContent = texto || 'Sem descrição.';
    const detalhe = document.createElement('small');
    detalhe.style.color = '#97A1AE';
    detalhe.textContent = meta || '';
    card.append(nome, corpo, detalhe);
    return card;
  }

  function renderizarComunicacoes() {
    const lista = document.getElementById('com-lista');
    if (!lista) return;
    lista.replaceChildren();
    if (!comunicacoes.length) {
      lista.appendChild(criarCard('Nenhuma comunicação', 'Ainda não há comunicações cadastradas.', ''));
      return;
    }
    comunicacoes.forEach(item => {
      const aluno = alunos.find(a => Number(a.idAluno) === Number(item.idAluno));
      lista.appendChild(criarCard(item.titulo, item.mensagem, `${aluno?.nome || `Aluno #${item.idAluno}`} · ${item.tipo} · ${item.dataEnvio || ''}`));
    });
  }

  function renderizarOportunidades() {
    const lista = document.getElementById('op-lista');
    if (!lista) return;
    lista.replaceChildren();
    if (!oportunidades.length) {
      lista.appendChild(criarCard('Nenhuma oportunidade', 'Ainda não há oportunidades publicadas.', ''));
      return;
    }
    oportunidades.forEach(item => lista.appendChild(
      criarCard(item.titulo, item.descricao, `${item.tipo} · prazo: ${item.prazoInscricao || 'não informado'}`)
    ));
  }

  function preencherAlunos() {
    const select = document.getElementById('com-aluno');
    if (!select) return;
    select.replaceChildren(new Option('Selecione...', ''));
    alunos.forEach(aluno => select.add(new Option(`${aluno.nome} · ${aluno.codigoPm || `#${aluno.idAluno}`}`, aluno.idAluno)));
  }

  async function carregar() {
    status('com-status', 'Carregando comunicações...', 'loading');
    status('op-status', 'Carregando oportunidades...', 'loading');
    try {
      const [resComunicacoes, resOportunidades, resAlunos] = await Promise.all([
        window.PulseApi.get('/comunicacao'),
        window.PulseApi.get('/comunicacao/oportunidades'),
        window.PulseApi.get('/alunos', { query: { limite: 100 } })
      ]);
      comunicacoes = Array.isArray(resComunicacoes.data) ? resComunicacoes.data : [];
      oportunidades = Array.isArray(resOportunidades.data) ? resOportunidades.data : [];
      alunos = Array.isArray(resAlunos.data) ? resAlunos.data : [];
      preencherAlunos();
      renderizarComunicacoes();
      renderizarOportunidades();
      status('com-status', `${comunicacoes.length} comunicação(ões) carregada(s).`, 'sucesso');
      status('op-status', `${oportunidades.length} oportunidade(s) carregada(s).`, 'sucesso');
    } catch (error) {
      status('com-status', error.message || 'Não foi possível carregar as comunicações.', 'erro');
      status('op-status', error.message || 'Não foi possível carregar as oportunidades.', 'erro');
    }
  }

  async function enviarComunicacao() {
    const botao = document.getElementById('com-enviar');
    const idAluno = Number(document.getElementById('com-aluno')?.value);
    const titulo = document.getElementById('com-titulo')?.value.trim();
    const mensagem = document.getElementById('com-mensagem')?.value.trim();
    if (!idAluno || !titulo || titulo.length < 3 || !mensagem || mensagem.length < 5) {
      status('com-status', 'Selecione o aluno e preencha título e mensagem.', 'erro');
      return;
    }
    try {
      const sessao = sessaoAtual();
      if (botao) botao.disabled = true;
      status('com-status', 'Enviando comunicação...', 'loading');
      const resposta = await window.PulseApi.post('/comunicacao', {
        titulo, idAluno, mensagem,
        tipo: document.getElementById('com-tipo').value,
        idRemetente: sessao.id,
        tipoRemetente: sessao.perfil === 'psicologo' ? 'psicologo' : 'membro_equipe',
        nomeRemetente: sessao.nome
      });
      comunicacoes.unshift({ ...resposta.data, mensagem, nomeRemetente: sessao.nome });
      renderizarComunicacoes();
      document.getElementById('com-titulo').value = '';
      document.getElementById('com-mensagem').value = '';
      status('com-status', 'Comunicação enviada com sucesso.', 'sucesso');
    } catch (error) {
      status('com-status', error.message || 'Não foi possível enviar a comunicação.', 'erro');
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  async function criarOportunidade() {
    const botao = document.getElementById('op-criar');
    const titulo = document.getElementById('op-titulo')?.value.trim();
    if (!titulo || titulo.length < 3) {
      status('op-status', 'Informe um título com pelo menos 3 caracteres.', 'erro');
      return;
    }
    try {
      const sessao = sessaoAtual();
      if (sessao.perfil !== 'gestor') throw new Error('A publicação de oportunidades é exclusiva do gestor.');
      if (botao) botao.disabled = true;
      status('op-status', 'Publicando oportunidade...', 'loading');
      const descricao = document.getElementById('op-descricao')?.value.trim();
      const prazoInscricao = document.getElementById('op-prazo')?.value || undefined;
      const resposta = await window.PulseApi.post('/comunicacao/oportunidades', {
        titulo, descricao: descricao || undefined,
        tipo: document.getElementById('op-tipo').value,
        prazoInscricao, idMembro: sessao.id
      });
      oportunidades.unshift({ ...resposta.data, descricao });
      renderizarOportunidades();
      document.getElementById('op-titulo').value = '';
      document.getElementById('op-descricao').value = '';
      document.getElementById('op-prazo').value = '';
      status('op-status', 'Oportunidade publicada com sucesso.', 'sucesso');
    } catch (error) {
      status('op-status', error.message || 'Não foi possível publicar a oportunidade.', 'erro');
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  function abrir() {
    document.getElementById('comunicacao-overlay')?.classList.add('open');
    carregar();
  }

  function fechar() {
    document.getElementById('comunicacao-overlay')?.classList.remove('open');
  }

  criarInterfaceGestor();
  garantirBotao();
  document.getElementById('abrir-comunicacao')?.addEventListener('click', abrir);
  document.getElementById('fechar-comunicacao')?.addEventListener('click', fechar);
  document.getElementById('com-enviar')?.addEventListener('click', enviarComunicacao);
  document.getElementById('op-criar')?.addEventListener('click', criarOportunidade);
  document.getElementById('comunicacao-overlay')?.addEventListener('click', event => {
    if (event.target === document.getElementById('comunicacao-overlay')) fechar();
  });
  window.Comunicacao = { abrir, carregar };
})();
