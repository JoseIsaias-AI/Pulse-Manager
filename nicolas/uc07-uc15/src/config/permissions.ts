export type PerfilUsuario = 'gestor' | 'equipe' | 'psicologo' | 'aluno';

export const PERMISSOES: Record<string, PerfilUsuario[]> = {
  visualizarAgenda: ['gestor', 'equipe', 'psicologo', 'aluno'],
  modificarAgenda: ['gestor'],
  acessarSaudeMental: ['psicologo'],
  editarContatoAluno: ['aluno'],
  editarCadastroAluno: ['gestor', 'equipe'],
  criarCamposSegmentacao: ['gestor', 'psicologo'],
  acessarDesempenhoAluno: ['psicologo']
};

export function temPermissao(perfil: string | undefined, permissao: keyof typeof PERMISSOES): boolean {
  if (!perfil) {
    return false;
  }

  return PERMISSOES[permissao].includes(perfil as PerfilUsuario);
}
