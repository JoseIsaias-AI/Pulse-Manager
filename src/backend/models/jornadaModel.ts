import { TipoAtividade } from './atividadeModel';

export interface RegistrarFrequenciaPayload {
  idAluno: number;
  idAtividade: number;
  statusPart: boolean;
  nota?: number;
  dataPart?: string;
}

export interface RegistrarParticipacaoPayload {
  idAluno: number;
  idAtividade: number;
  statusPart: boolean;
  nota?: number;
  dataPart?: string;
}

export interface AtualizarEmpregabilidadePayload {
  ocupacao: string;
  tipoVinculoEmpregaticio?: string;
  rendaMensal?: number;
}

export interface AtualizarEnsinoSuperiorPayload {
  escolaridade: string;
  instituicaoEnsinoSuperior?: string;
  cursoEnsinoSuperior?: string;
  statusEnsinoSuperior?: string;
  dataIngressoEnsinoSuperior?: string;
}

export interface RegistrarAnotacaoQualitativaPayload {
  idAluno: number;
  titulo: string;
  descricao: string;
  autor: string;
  dataRegistro?: string;
}

export interface JornadaParticipacaoView {
  idPart: number;
  idAtividade: number;
  tituloAtividade: string;
  tipoAtividade: TipoAtividade;
  dataPart: string;
  statusPart: boolean;
  nota: number | null;
}

export interface JornadaAlunoResponseData {
  aluno: {
    idAluno: number;
    nome: string;
    email: string;
    programa: string;
    categoria: string;
    status: string;
    riscoEvasao: string;
  };
  empregabilidade: {
    ocupacao: string | null;
    tipoVinculoEmpregaticio: string | null;
    rendaMensal: number | null;
  };
  ensinoSuperior: {
    escolaridade: string | null;
    instituicaoEnsinoSuperior: string | null;
    cursoEnsinoSuperior: string | null;
    statusEnsinoSuperior: string | null;
    dataIngressoEnsinoSuperior: string | null;
  };
  frequencias: JornadaParticipacaoView[];
  participacoesEventos: JornadaParticipacaoView[];
  anotacoesQualitativas: Array<{
    idAnotacao: number;
    titulo: string;
    descricao: string;
    autor: string;
    dataRegistro: string;
  }>;
}
