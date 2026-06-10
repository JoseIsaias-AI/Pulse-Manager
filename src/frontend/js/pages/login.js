// =========================================
// Login – Lógica de autenticação
// Depende de: nenhum arquivo externo
// =========================================

// Mapa de perfil → página de destino após login bem-sucedido
const ROLE_PAGES = {
  gestor:    'gestorApp.html',    // Gestor vai para o SPA de gestão da turma
  psicologo: 'gestorApp.html',   // Psicólogo usa o mesmo SPA do gestor por ora
  aluno:     'alunoApp.html',    // Aluno vai para o SPA de visão geral pessoal
};

// Armazena o perfil atualmente selecionado nos botões de role
// Começa com "gestor" porque o botão Gestor tem classe "active" no HTML
let currentRole = 'gestor';

// ---- SELEÇÃO DE PERFIL ----
// Chamada pelo onclick de cada .role-btn no HTML
// btn → referência ao botão clicado; role → string do perfil ('gestor', etc.)
function selectRole(btn, role) {
  // Remove "active" de todos os botões para limpar a seleção anterior
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));

  // Adiciona "active" apenas no botão clicado
  btn.classList.add('active');

  // Atualiza a variável de estado para o redirect correto
  currentRole = role;
}

// ---- MÁSCARA DO CPF ----
// Formata o texto enquanto o usuário digita: 000.000.000-00
function applyMaskCPF(input) {
  let v = input.value.replace(/\D/g, ''); // remove tudo que não é dígito

  v = v.replace(/(\d{3})(\d)/, '$1.$2');      // insere ponto após o 3º dígito
  v = v.replace(/(\d{3})(\d)/, '$1.$2');      // insere ponto após o 6º dígito
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // insere hífen antes dos últimos 2 dígitos

  input.value = v; // aplica o valor formatado de volta no campo
}

// ---- VALIDAÇÃO DO FORMULÁRIO ----
// Retorna uma string de erro ou null se o formulário for válido
function validateForm(cpf, nome) {
  const cpfClean = cpf.replace(/\D/g, ''); // conta apenas os dígitos do CPF

  if (cpfClean.length !== 11) return 'CPF inválido';   // CPF deve ter exatamente 11 dígitos
  if (nome.trim().length < 3) return 'Nome muito curto'; // nome mínimo de 3 caracteres

  return null; // null = sem erros = formulário válido
}

// ---- HANDLER DE SUBMIT ----
function handleSubmit() {
  const cpfInput  = document.getElementById('cpf');      // referência ao campo CPF
  const nomeInput = document.getElementById('nome');     // referência ao campo Nome
  const btnEntrar = document.getElementById('btn-entrar'); // referência ao botão

  const error = validateForm(cpfInput.value, nomeInput.value); // executa a validação

  if (error) {
    // Exibe o erro no botão temporariamente (visual de feedback)
    btnEntrar.textContent = error;       // substitui "ENTRAR" pelo texto de erro
    btnEntrar.classList.add('error');    // aplica fundo vermelho via login.css

    // Restaura o botão após 2.2 segundos
    setTimeout(() => {
      btnEntrar.textContent = 'ENTRAR';
      btnEntrar.classList.remove('error');
    }, 2200);

    return; // interrompe a função: não faz redirect com erro
  }

  // Feedback visual de carregamento antes do redirect
  btnEntrar.textContent = 'Entrando…'; // texto de transição
  btnEntrar.disabled = true;            // desabilita para evitar duplo clique

  // Aguarda 600ms (simula chamada de API) e então redireciona
  setTimeout(() => {
    window.location.href = ROLE_PAGES[currentRole]; // navega para a página do perfil
  }, 600);
}

// ---- INICIALIZAÇÃO ----
// DOMContentLoaded garante que o HTML foi completamente parseado antes de o JS rodar
document.addEventListener('DOMContentLoaded', () => {

  // Aplica a máscara de CPF a cada tecla digitada no campo
  document.getElementById('cpf').addEventListener('input', function () {
    applyMaskCPF(this); // this = o próprio input que disparou o evento
  });

  // Conecta o clique do botão ao handler de submit
  document.getElementById('btn-entrar').addEventListener('click', handleSubmit);

  // Permite submeter o formulário pressionando Enter em qualquer campo
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSubmit();
  });
});
