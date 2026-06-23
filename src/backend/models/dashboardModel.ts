export interface DashboardFiltroQuery {
  programa?: string;
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
}

export interface IndicadorResumo {
  valor: number;
  percentual: number;
}

export interface ImpactoProgramaItem {
  programa: string;
  totalAlunos: number;
  empregados: number;
  concluintes: number;
  ensinoSuperior: number;
}

export interface JornadaProgramaItem {
  programa: string;
  totalAlunos: number;
  evadidos: number;
  riscoAlto: number;
}

export interface DashboardImpactoData {
  totalAlunos: number;
  conectados: IndicadorResumo;
  capacitados: IndicadorResumo;
  transformados: IndicadorResumo;
  alunosEmpregados: IndicadorResumo;
  conclusaoProgramas: IndicadorResumo;
  acessoEnsinoSuperior: IndicadorResumo;
  porPrograma: ImpactoProgramaItem[];
}

export interface DashboardJornadaData {
  totalAlunos: number;
  evasao: IndicadorResumo;
  riscoAlto: IndicadorResumo;
  riscoMedio: IndicadorResumo;
  riscoBaixo: IndicadorResumo;
  porPrograma: JornadaProgramaItem[];
}
