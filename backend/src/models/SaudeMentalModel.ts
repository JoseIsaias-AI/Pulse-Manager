export interface CriarProntuarioInput {
  observacao?: string;
  titulo?: string;
  classificacao?: string;
  id_aluno?: number;
  id_psi?: number;
  id_psicologo?: number;
}

export interface Prontuario {
  id_historico: number;
  observacao: string;
  titulo: string;
  id_aluno: number;
  id_psi: number;
}

export interface ProntuarioComAluno extends Prontuario {
  aluno_nome: string;
  aluno_email: string;
}
