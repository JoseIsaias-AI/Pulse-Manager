export const PERMISSOES: Record<string, string[]> = {
  visualizarAgenda: ['gestor', 'equipe', 'psicologo', 'aluno'],
  modificarAgenda: ['gestor'],
  acessarSaudeMental: ['psicologo'],
  editarContatoAluno: ['aluno'],
  editarCadastroAluno: ['gestor', 'equipe'],
  criarCamposSegmentacao: ['gestor', 'psicologo'],
  acessarDesempenhoAluno: ['psicologo'],
  acessarDashboardPsicologo: ['psicologo']
};
