import { RiscoEvasao } from '../models/alunoModel';
import {
  IndicadoresRiscoEvasao,
  RiscoEvasaoRepository
} from '../repositories/riscoEvasaoRepository';

export interface ResultadoRiscoEvasao {
  idAluno: number;
  probabilidade: number | null;
  classificacao: RiscoEvasao | null;
  confiabilidade: number;
  fatores: {
    faltasEmAula: number | null;
    ausenciasEmAtividades: number | null;
    desempenho: number | null;
    desengajamento: number | null;
  };
}

export interface ResumoRecalculoRisco {
  processados: number;
  atualizados: number;
  semDadosSuficientes: number;
  resultados: ResultadoRiscoEvasao[];
}

function limitar(valor: number, minimo = 0, maximo = 1): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

/** Grau de pertinencia fuzzy crescente entre os dois limites. */
function pertinenciaCrescente(valor: number, inicio: number, fim: number): number {
  return limitar((valor - inicio) / (fim - inicio));
}

/** Grau de risco fuzzy para sinais em que valores menores sao piores. */
function pertinenciaDecrescente(valor: number, ruim: number, bom: number): number {
  return limitar((bom - valor) / (bom - ruim));
}

function arredondar(valor: number): number {
  return Number(valor.toFixed(2));
}

export function classificarRisco(probabilidade: number): RiscoEvasao {
  if (probabilidade >= 70) return 'alto';
  if (probabilidade >= 40) return 'medio';
  return 'baixo';
}

/**
 * Calcula um indicador explicavel de priorizacao, nao uma previsao clinica.
 * Os pesos sao renormalizados quando um sinal nao esta disponivel.
 */
export function calcularRiscoEvasao(
  indicadores: IndicadoresRiscoEvasao
): ResultadoRiscoEvasao {
  const fatores: ResultadoRiscoEvasao['fatores'] = {
    faltasEmAula: null,
    ausenciasEmAtividades: null,
    desempenho: null,
    desengajamento: null
  };
  const sinais: Array<{ risco: number; peso: number }> = [];

  if (indicadores.totalAulas > 0) {
    const taxaFaltas = (indicadores.faltasAulas / indicadores.totalAulas) * 100;
    fatores.faltasEmAula = arredondar(taxaFaltas);
    sinais.push({ risco: pertinenciaCrescente(taxaFaltas, 10, 40), peso: 0.45 });
  }

  if (indicadores.totalAtividades > 0) {
    const taxaAusencias = (indicadores.ausenciasAtividades / indicadores.totalAtividades) * 100;
    fatores.ausenciasEmAtividades = arredondar(taxaAusencias);
    sinais.push({ risco: pertinenciaCrescente(taxaAusencias, 15, 60), peso: 0.2 });
  }

  if (indicadores.quantidadeNotas > 0 && indicadores.mediaNotas !== null) {
    fatores.desempenho = arredondar(indicadores.mediaNotas);
    sinais.push({ risco: pertinenciaDecrescente(indicadores.mediaNotas, 5, 8), peso: 0.2 });
  }

  const quantidadeRegistros = indicadores.totalAulas + indicadores.totalAtividades;
  if (quantidadeRegistros > 0 || indicadores.engajamento > 0) {
    fatores.desengajamento = arredondar(100 - indicadores.engajamento);
    sinais.push({ risco: pertinenciaDecrescente(indicadores.engajamento, 30, 80), peso: 0.15 });
  }

  if (sinais.length === 0) {
    return {
      idAluno: indicadores.idAluno,
      probabilidade: null,
      classificacao: null,
      confiabilidade: 0,
      fatores
    };
  }

  const pesoTotal = sinais.reduce((total, sinal) => total + sinal.peso, 0);
  const riscoFuzzy = sinais.reduce(
    (total, sinal) => total + sinal.risco * sinal.peso,
    0
  ) / pesoTotal;

  // Poucos registros aproximam o resultado da referencia conservadora de 25%.
  const confiabilidade = limitar((quantidadeRegistros + indicadores.quantidadeNotas) / 5);
  const probabilidade = arredondar(25 + (riscoFuzzy * 100 - 25) * confiabilidade);

  return {
    idAluno: indicadores.idAluno,
    probabilidade,
    classificacao: classificarRisco(probabilidade),
    confiabilidade: arredondar(confiabilidade * 100),
    fatores
  };
}

export class RiscoEvasaoService {
  constructor(private readonly repository: RiscoEvasaoRepository) {}

  async recalcularAluno(idAluno: number): Promise<ResultadoRiscoEvasao | null> {
    const [indicadores] = await this.repository.listarIndicadores(idAluno);
    if (!indicadores) return null;

    const resultado = calcularRiscoEvasao(indicadores);
    if (resultado.probabilidade !== null && resultado.classificacao !== null) {
      await this.repository.atualizarResultado({
        idAluno: resultado.idAluno,
        probabilidade: resultado.probabilidade,
        classificacao: resultado.classificacao
      });
    }

    return resultado;
  }

  async recalcularTodos(): Promise<ResumoRecalculoRisco> {
    const indicadores = await this.repository.listarIndicadores();
    const resultados = indicadores.map(calcularRiscoEvasao);
    const calculados = resultados.filter(
      (resultado): resultado is ResultadoRiscoEvasao & {
        probabilidade: number;
        classificacao: RiscoEvasao;
      } => resultado.probabilidade !== null && resultado.classificacao !== null
    );

    await this.repository.atualizarResultados(calculados);

    return {
      processados: resultados.length,
      atualizados: calculados.length,
      semDadosSuficientes: resultados.length - calculados.length,
      resultados
    };
  }
}
