export const PERMISSOES: Record<string, string[]> = {
  visualizarAgenda: ['gestor', 'equipe', 'psicologo', 'aluno'],
  modificarAgenda: ['gestor'],
  acessarSaudeMental: ['psicologo'],
  editarContatoAluno: ['aluno'],
  editarCadastroAluno: ['gestor', 'equipe'],
  gerenciarImportacaoCsv: ['gestor'],
  criarCamposSegmentacao: ['gestor', 'psicologo'],
  acessarDesempenhoAluno: ['psicologo'],
  acessarDashboardPsicologo: ['psicologo'],
  solicitarApoioPsicologico: ['aluno'],
  listarSolicitacoesApoio: ['psicologo']
};
