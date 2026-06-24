import { registrarConsultaSegmentacao } from '../integrations/auditoriaIntegration';
import {
  RISCOS_EVASAO,
  STATUS_ALUNO,
  EMPREGABILIDADES_ALUNO,
  CRITERIOS_SEGMENTACAO,
  SegmentacaoAlunoQuery,
  SegmentacaoAlunoResponse
} from '../models/alunoModel';
import { AlunoRepository } from '../repositories/alunoRepository';
import { BusinessRuleError, PayloadValidationError } from '../utils/errors';

export class SegmentacaoService {
  constructor(private readonly alunoRepository: AlunoRepository) {}

  async segmentar(filtros: SegmentacaoAlunoQuery): Promise<SegmentacaoAlunoResponse> {
    const filtrosValidados = this.validarFiltros(filtros);
    const alunos = await this.alunoRepository.findSegmentados(filtrosValidados);

    await registrarConsultaSegmentacao({
      fluxo: 'UC-13',
      filtros: filtrosValidados,
      total: alunos.length
    });

    return {
      success: true,
      data: {
        total: alunos.length,
        filtrosAplicados: filtrosValidados,
        alunos
      }
    };
  }

  private validarFiltros(filtros: SegmentacaoAlunoQuery): SegmentacaoAlunoQuery {
    if (filtros.limite !== undefined && (!Number.isInteger(filtros.limite) || filtros.limite < 1)) {
      throw new PayloadValidationError('O parametro limite deve ser um numero inteiro positivo.');
    }

    if (filtros.limite !== undefined && filtros.limite > 100) {
      throw new BusinessRuleError('O limite maximo para segmentacao de alunos e 100 registros.');
    }

    if (filtros.status && !STATUS_ALUNO.includes(filtros.status)) {
      throw new PayloadValidationError('Status de aluno invalido.');
    }

    if (filtros.risco && !RISCOS_EVASAO.includes(filtros.risco)) {
      throw new PayloadValidationError('Risco de evasao invalido.');
    }

    if (filtros.empregabilidade && !EMPREGABILIDADES_ALUNO.includes(filtros.empregabilidade)) {
      throw new PayloadValidationError('Empregabilidade invalida.');
    }

    if (
      filtros.anoIngresso !== undefined &&
      (!Number.isInteger(filtros.anoIngresso) || filtros.anoIngresso < 1900 || filtros.anoIngresso > 2100)
    ) {
      throw new PayloadValidationError('O parametro anoIngresso deve ser um ano valido.');
    }

    if (filtros.busca !== undefined && filtros.busca.trim().length < 3) {
      throw new PayloadValidationError('O parametro busca deve ter pelo menos 3 caracteres.');
    }

    const temCriterio = CRITERIOS_SEGMENTACAO.some((criterio) => {
      const valor = filtros[criterio];
      return typeof valor === 'string' ? valor.trim().length > 0 : valor !== undefined;
    });

    if (!temCriterio) {
      throw new BusinessRuleError('Informe ao menos um criterio de segmentacao.');
    }

    return filtros;
  }
}
