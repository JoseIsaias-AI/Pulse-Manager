(function () {
  'use strict';

  let alunoSelecionado = null;
  let prontuarios = [];
  let labels = [];
  let cargaAtual = 0;

  function sessaoPsicologo() {
    try {
      const sessao = JSON.parse(sessionStorage.getItem('pulseUser') || 'null');
      const idPsi = Number(sessao && sessao.id);
      if (!sessao || sessao.perfil !== 'psicologo' || !Number.isInteger(idPsi) || idPsi <= 0) {
        throw new Error('Sessão de psicólogo inválida. Entre novamente para acessar os prontuários.');
      }
      return { idPsi, nome: sessao.nome || 'Psicólogo(a)' };
    } catch (error) {
      throw new Error(error.message || 'Sessão de psicólogo inválida. Entre novamente.');
    }
  }

  function escapar(valor) {
    return String(valor ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function mostrarErro(mensagem) {
    const elemento = document.getElementById('psico-form-error');
    if (!elemento) return;
    elemento.style.display = '';
    window.PulseUiState.set(elemento, 'error', mensagem);
  }

  function limparErro() {
    const elemento = document.getElementById('psico-form-error');
    if (elemento) window.PulseUiState.clear(elemento);
  }

  function renderizarProntuarios() {
    const lista = document.getElementById('psico-list');
    if (!lista) return;
    window.PulseUiState.clear(lista, { replace: true });
    if (!prontuarios.length) {
      window.PulseUiState.set(lista, 'empty', 'Nenhuma anotação registrada para este aluno.', { replace: true });
      return;
    }

    lista.innerHTML = prontuarios.map(function (registro) {
      return `<div class="psico-entry">
        <div class="psico-entry__head">
          <div class="psico-entry__date"><i class="ti ti-notes-medical"></i> Registro #${escapar(registro.idHistorico)}</div>
          <span class="psico-tipo psico-tipo--sessao">${escapar(registro.titulo)}</span>
          <div class="psico-entry__psi"><i class="ti ti-user-heart"></i> ${escapar(registro.nomePsicologo || sessaoPsicologo().nome)}</div>
        </div>
        <div class="psico-entry__body">${escapar(registro.observacao)}</div>
      </div>`;
    }).join('');
  }

  function selecionarLabel(botao) {
    document.querySelectorAll('#pf-label-picker .psico-label-btn').forEach(item => item.classList.remove('selected'));
    botao.classList.add('selected');
    const campo = document.getElementById('pf-label');
    if (campo) campo.value = botao.dataset.label || '';
  }

  function renderizarLabels() {
    const seletor = document.getElementById('pf-label-picker');
    if (!seletor) return;
    seletor.replaceChildren();

    const nenhum = document.createElement('button');
    nenhum.type = 'button';
    nenhum.className = 'psico-label-btn selected';
    nenhum.dataset.label = '';
    nenhum.textContent = 'Nenhum';
    nenhum.addEventListener('click', function () { selecionarLabel(nenhum); });
    seletor.appendChild(nenhum);

    labels.forEach(function (label) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = `psico-label-btn ${label.tipoLabel === 'risco' ? 'psico-label-btn--atencao' : 'psico-label-btn--observacao'}`;
      botao.dataset.label = String(label.idLabel);
      botao.textContent = label.descricao;
      botao.title = label.tipoLabel;
      botao.addEventListener('click', function () { selecionarLabel(botao); });
      seletor.appendChild(botao);
    });
  }

  async function carregarAluno(aluno) {
    const carga = ++cargaAtual;
    alunoSelecionado = aluno && Number.isInteger(Number(aluno.idAluno))
      ? { ...aluno, idAluno: Number(aluno.idAluno) }
      : null;
    const lista = document.getElementById('psico-list');
    if (lista) window.PulseUiState.set(lista, 'loading', 'Carregando histórico psicológico...', { replace: true });
    limparErro();

    try {
      if (!alunoSelecionado) throw new Error('Não foi possível identificar o aluno selecionado.');
      const sessao = sessaoPsicologo();
      const campoPsi = document.getElementById('pf-psi');
      if (campoPsi) campoPsi.value = sessao.nome;

      const consultas = { idAluno: alunoSelecionado.idAluno, idPsi: sessao.idPsi };
      const [respostaProntuarios, respostaLabels] = await Promise.all([
        window.PulseApi.get('/prontuarios', { query: consultas }),
        window.PulseApi.get('/labels', { query: consultas })
      ]);
      if (carga !== cargaAtual) return;
      prontuarios = Array.isArray(respostaProntuarios.data) ? respostaProntuarios.data : [];
      labels = Array.isArray(respostaLabels.data) ? respostaLabels.data : [];
      renderizarProntuarios();
      renderizarLabels();
    } catch (error) {
      if (carga !== cargaAtual) return;
      prontuarios = [];
      labels = [];
      renderizarProntuarios();
      renderizarLabels();
      mostrarErro(error.message || 'Não foi possível carregar o histórico psicológico.');
    }
  }

  async function registrarAnotacao() {
    limparErro();
    const data = document.getElementById('pf-data')?.value;
    const tipo = document.getElementById('pf-tipo')?.value;
    const observacao = document.getElementById('pf-texto')?.value.trim();
    const botao = document.getElementById('pf-registrar-anotacao');

    if (!alunoSelecionado || !data || !tipo || !observacao) {
      mostrarErro('Preencha data, tipo de atendimento e anotação.');
      return;
    }

    try {
      const sessao = sessaoPsicologo();
      if (botao) botao.disabled = true;
      const estado = document.getElementById('psico-form-error');
      if (estado) window.PulseUiState.set(estado, 'loading', 'Registrando anotação...');
      const resposta = await window.PulseApi.post('/prontuarios', {
        idAluno: alunoSelecionado.idAluno,
        idPsi: sessao.idPsi,
        titulo: `${tipo} · ${data}`,
        observacao
      });
      prontuarios.unshift({ ...resposta.data, nomePsicologo: sessao.nome });
      renderizarProntuarios();
      document.getElementById('pf-tipo').value = '';
      document.getElementById('pf-texto').value = '';
      const toast = document.getElementById('toast-hist');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
      if (estado) window.PulseUiState.set(estado, 'success', 'Anotação registrada com sucesso.');
    } catch (error) {
      mostrarErro(error.message || 'Não foi possível registrar a anotação.');
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  async function criarLabel() {
    limparErro();
    const descricaoEl = document.getElementById('pf-nova-label');
    const tipoEl = document.getElementById('pf-nova-label-tipo');
    const descricao = descricaoEl?.value.trim();
    if (!alunoSelecionado || !descricao || descricao.length < 3) {
      mostrarErro('Informe uma descrição de label com pelo menos 3 caracteres.');
      return;
    }

    try {
      const sessao = sessaoPsicologo();
      const estado = document.getElementById('psico-form-error');
      if (estado) window.PulseUiState.set(estado, 'loading', 'Criando label...');
      const resposta = await window.PulseApi.post('/labels', {
        idAluno: alunoSelecionado.idAluno,
        idPsi: sessao.idPsi,
        descricao,
        tipoLabel: tipoEl.value
      });
      labels.unshift(resposta.data);
      renderizarLabels();
      if (descricaoEl) descricaoEl.value = '';
      const criada = document.querySelector(`#pf-label-picker [data-label="${resposta.data.idLabel}"]`);
      if (criada) selecionarLabel(criada);
      if (estado) window.PulseUiState.set(estado, 'success', 'Label criada e disponível para seleção.');
    } catch (error) {
      mostrarErro(error.message || 'Não foi possível criar a label.');
    }
  }

  window.pickLabel = selecionarLabel;
  window.registrarAnotacao = registrarAnotacao;
  window.HistoricoPsicologico = { carregarAluno };

  document.getElementById('pf-criar-label')?.addEventListener('click', criarLabel);
})();
