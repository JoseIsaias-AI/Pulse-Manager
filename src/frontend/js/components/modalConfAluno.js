(function () {
  'use strict';

  function sessaoAluno() {
    try {
      const sessao = JSON.parse(sessionStorage.getItem('pulseUser') || 'null');
      const idAluno = Number(sessao && sessao.id);
      if (!sessao || sessao.perfil !== 'aluno' || !Number.isInteger(idAluno) || idAluno <= 0) {
        throw new Error('Sessão de aluno inválida. Entre novamente para acessar o portal.');
      }
      return { idAluno };
    } catch (error) {
      throw new Error(error.message || 'Sessão de aluno inválida. Entre novamente.');
    }
  }

  function endpointAluno(sufixo) {
    const { idAluno } = sessaoAluno();
    return `/portal/alunos/${idAluno}${sufixo || ''}`;
  }

  function iniciais(nome) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '--';
    return `${partes[0][0]}${partes.length > 1 ? partes[partes.length - 1][0] : partes[0][1] || ''}`.toUpperCase();
  }

  function texto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor || '--';
  }

  function valor(id, conteudo) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = conteudo || '';
  }

  function preencherSelect(id, conteudo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.replaceChildren(new Option(conteudo || 'Não informado', conteudo || ''));
  }

  function exibirErro(mensagem) {
    const erro = document.getElementById('portal-aluno-erro');
    if (!erro) return;
    erro.style.display = '';
    window.PulseUiState.set(erro, 'error', mensagem);
  }

  function limparErro() {
    const erro = document.getElementById('portal-aluno-erro');
    if (erro) window.PulseUiState.clear(erro);
  }

  function renderizarPerfil(aluno) {
    texto('m-name', aluno.nome);
    texto('m-initials', iniciais(aluno.nome));
    texto('m-meta', [aluno.codigoPm, aluno.curso].filter(Boolean).join(' · ') || 'Dados do aluno');
    texto('m-status', aluno.status);
    texto('m-curso', aluno.curso);
    texto('m-nivel', aluno.nivelJornada);
    valor('f-codigo-pm', aluno.codigoPm);
    valor('f-nome', aluno.nome);
    valor('f-email', aluno.email);
    valor('f-telefone', aluno.telefone);
    valor('f-nivel-jornada', aluno.nivelJornada);
    preencherSelect('f-curso', aluno.curso);

    const resumo = document.getElementById('portal-aluno-resumo');
    if (resumo) {
      resumo.textContent = [aluno.nome, aluno.curso, aluno.nivelJornada]
        .filter(Boolean)
        .join(' · ') || 'Perfil carregado';
    }
  }

  function renderizarOportunidades(oportunidades) {
    const lista = document.getElementById('portal-oportunidades');
    if (!lista) return;
    window.PulseUiState.clear(lista, { replace: true });

    if (!oportunidades.length) {
      window.PulseUiState.set(lista, 'empty', 'Nenhuma oportunidade disponível no momento.', { replace: true });
      return;
    }

    oportunidades.forEach(function (oportunidade) {
      const item = document.createElement('li');
      item.className = 'ini-event-item';

      const ponto = document.createElement('div');
      ponto.className = 'ini-event-dot';
      ponto.style.background = '#33B458';

      const corpo = document.createElement('div');
      corpo.className = 'ini-event-body';
      const titulo = document.createElement('span');
      titulo.className = 'ini-event-name';
      titulo.textContent = oportunidade.titulo;
      const descricao = document.createElement('span');
      descricao.className = 'ini-event-time';
      descricao.textContent = oportunidade.descricao || oportunidade.prazoInscricao || 'Confira os detalhes com a equipe.';
      corpo.append(titulo, descricao);

      const tipo = document.createElement('span');
      tipo.className = 'ini-event-tag ini-tag-mentoria';
      tipo.textContent = oportunidade.tipo || 'Oportunidade';
      item.append(ponto, corpo, tipo);
      lista.appendChild(item);
    });
  }

  async function carregarPortal() {
    limparErro();
    const estado = document.getElementById('portal-aluno-erro');
    if (estado) window.PulseUiState.set(estado, 'loading', 'Carregando dados do aluno...');
    try {
      const [perfil, oportunidades] = await Promise.allSettled([
        window.PulseApi.get(endpointAluno()),
        window.PulseApi.get('/portal/oportunidades')
      ]);
      if (perfil.status === 'rejected') throw perfil.reason;
      renderizarPerfil(perfil.value.data);
      limparErro();

      if (oportunidades.status === 'fulfilled') {
        renderizarOportunidades(Array.isArray(oportunidades.value.data) ? oportunidades.value.data : []);
      } else {
        renderizarOportunidades([]);
        exibirErro(oportunidades.reason?.message || 'Não foi possível carregar as oportunidades.');
      }
    } catch (error) {
      exibirErro(error.message || 'Não foi possível carregar os dados do aluno.');
      const resumo = document.getElementById('portal-aluno-resumo');
      if (resumo) resumo.textContent = 'Dados indisponíveis';
    }
  }

  window.openModal = function () {
    document.getElementById('overlay')?.classList.add('open');
    document.getElementById('main-content')?.classList.add('blurred');
  };

  window.closeModal = function () {
    document.getElementById('overlay')?.classList.remove('open');
    document.getElementById('main-content')?.classList.remove('blurred');
  };

  window.handleOverlayClick = function (event) {
    if (event.target === document.getElementById('overlay')) window.closeModal();
  };

  window.showTab = function (id, botao) {
    document.querySelectorAll('.tab-panel').forEach(painel => painel.classList.remove('active'));
    document.getElementById(`tab-${id}`)?.classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
    botao.classList.add('active');
  };

  window.saveProfile = async function () {
    const botao = document.querySelector('.modal-footer .btn-primary');
    const email = document.getElementById('f-email')?.value.trim();
    const telefone = document.getElementById('f-telefone')?.value.trim();
    if (botao) botao.disabled = true;
    limparErro();
    const estado = document.getElementById('portal-aluno-erro');
    if (estado) window.PulseUiState.set(estado, 'loading', 'Atualizando contato...');

    try {
      const resposta = await window.PulseApi.patch(endpointAluno('/contato'), { email, telefone });
      renderizarPerfil(resposta.data);
      window.closeModal();
      const toast = document.getElementById('toast');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
      }
      if (estado) window.PulseUiState.set(estado, 'success', 'Contato atualizado com sucesso.');
    } catch (error) {
      exibirErro(error.message || 'Não foi possível atualizar o contato.');
    } finally {
      if (botao) botao.disabled = false;
    }
  };

  window.updateHeader = function () {};
  window.selectStatus = function () {};
  window.selectJornada = function () {};
  window.updateRisco = function () {};

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') window.closeModal();
  });
  document.addEventListener('DOMContentLoaded', carregarPortal);

  window.PortalAluno = { carregar: carregarPortal, endpointAluno: endpointAluno };
})();
