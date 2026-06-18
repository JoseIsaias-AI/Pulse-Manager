import { SegmentacaoService } from '../../../backend/services/segmentacaoService';
import { registrarConsultaSegmentacao } from '../../../backend/integrations/auditoriaIntegration';
import { AlunoRepository } from '../../../backend/repositories/alunoRepository';
import { SegmentacaoAlunoQuery } from '../../../backend/models/alunoModel';
import { asMockedDependency } from '../../helpers/mockHelper';

jest.mock('../../../backend/integrations/auditoriaIntegration', () => ({
  registrarConsultaSegmentacao: jest.fn()
}));

function makeRepository() {
  return {
    findSegmentados: jest.fn()
  };
}

function invalidQuery(payload: Record<string, unknown>): SegmentacaoAlunoQuery {
  return payload as unknown as SegmentacaoAlunoQuery;
}

describe('SegmentacaoService', () => {
  let repository: ReturnType<typeof makeRepository>;
  let service: SegmentacaoService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    service = new SegmentacaoService(asMockedDependency<AlunoRepository>(repository));
    (registrarConsultaSegmentacao as jest.Mock).mockResolvedValue(undefined);
  });

  it('segmenta alunos com criterio valido', async () => {
    repository.findSegmentados.mockResolvedValue([{ idAluno: 1 }]);

    await service.segmentar({ status: 'ativo' });

    expect(repository.findSegmentados).toHaveBeenCalledWith({ status: 'ativo' });
  });

  it('retorna total, filtros aplicados e lista de alunos', async () => {
    const alunos = [{ idAluno: 1 }, { idAluno: 2 }];
    repository.findSegmentados.mockResolvedValue(alunos);

    const result = await service.segmentar({ risco: 'alto' });

    expect(result).toEqual({ success: true, data: { total: 2, filtrosAplicados: { risco: 'alto' }, alunos } });
  });

  it('rejeita segmentacao sem criterios', async () => {
    await expect(service.segmentar({})).rejects.toThrow('Informe ao menos um criterio de segmentacao.');
  });

  it('rejeita limite menor que 1 ou nao inteiro', async () => {
    await expect(service.segmentar({ status: 'ativo', limite: 0 })).rejects.toThrow(
      'O parametro limite deve ser um numero inteiro positivo.'
    );
  });

  it('rejeita limite maior que 100', async () => {
    await expect(service.segmentar({ status: 'ativo', limite: 101 })).rejects.toThrow(
      'O limite maximo para segmentacao de alunos e 100 registros.'
    );
  });

  it('rejeita status invalido', async () => {
    await expect(service.segmentar(invalidQuery({ status: 'pausado' }))).rejects.toThrow('Status de aluno invalido.');
  });

  it('rejeita risco de evasao invalido', async () => {
    await expect(service.segmentar(invalidQuery({ risco: 'critico' }))).rejects.toThrow('Risco de evasao invalido.');
  });

  it('rejeita busca com menos de 3 caracteres', async () => {
    await expect(service.segmentar({ busca: 'Ma' })).rejects.toThrow(
      'O parametro busca deve ter pelo menos 3 caracteres.'
    );
  });

  it('registra auditoria da consulta de segmentacao', async () => {
    repository.findSegmentados.mockResolvedValue([{ idAluno: 1 }]);

    await service.segmentar({ programa: 'Pulse' });

    expect(registrarConsultaSegmentacao).toHaveBeenCalledWith({
      fluxo: 'UC-13',
      filtros: { programa: 'Pulse' },
      total: 1
    });
  });
});
