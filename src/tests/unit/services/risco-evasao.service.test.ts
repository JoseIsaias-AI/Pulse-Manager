import {
  calcularRiscoEvasao,
  classificarRisco,
  RiscoEvasaoService
} from '../../../backend/services/riscoEvasaoService';

function indicadores(overrides: Record<string, number | null> = {}) {
  return {
    idAluno: 1,
    engajamento: 70,
    totalAulas: 10,
    faltasAulas: 1,
    totalAtividades: 5,
    ausenciasAtividades: 0,
    quantidadeNotas: 3,
    mediaNotas: 8,
    ...overrides
  };
}

describe('RiscoEvasaoService', () => {
  it('classifica como baixo um aluno com boa presenca e desempenho', () => {
    const resultado = calcularRiscoEvasao(indicadores());

    expect(resultado.classificacao).toBe('baixo');
    expect(resultado.probabilidade).not.toBeNull();
    expect(resultado.probabilidade!).toBeLessThan(40);
    expect(resultado.fatores.faltasEmAula).toBe(10);
  });

  it('classifica como alto quando faltas, ausencias, nota e engajamento sao criticos', () => {
    const resultado = calcularRiscoEvasao(indicadores({
      engajamento: 20,
      faltasAulas: 6,
      ausenciasAtividades: 4,
      mediaNotas: 4
    }));

    expect(resultado.classificacao).toBe('alto');
    expect(resultado.probabilidade!).toBeGreaterThanOrEqual(70);
  });

  it('nao altera aluno sem nenhum dado quantitativo', () => {
    const resultado = calcularRiscoEvasao(indicadores({
      engajamento: 0,
      totalAulas: 0,
      faltasAulas: 0,
      totalAtividades: 0,
      ausenciasAtividades: 0,
      quantidadeNotas: 0,
      mediaNotas: null
    }));

    expect(resultado).toEqual(expect.objectContaining({
      probabilidade: null,
      classificacao: null,
      confiabilidade: 0
    }));
  });

  it('reduz a confiabilidade quando existe somente um registro', () => {
    const resultado = calcularRiscoEvasao(indicadores({
      engajamento: 0,
      totalAulas: 1,
      faltasAulas: 1,
      totalAtividades: 0,
      quantidadeNotas: 0,
      mediaNotas: null
    }));

    expect(resultado.confiabilidade).toBe(20);
    expect(resultado.probabilidade!).toBeLessThan(70);
  });

  it('usa os limites de classificacao definidos', () => {
    expect(classificarRisco(39.99)).toBe('baixo');
    expect(classificarRisco(40)).toBe('medio');
    expect(classificarRisco(70)).toBe('alto');
  });

  it('persiste apenas resultados com dados suficientes no recalculo em lote', async () => {
    const repository = {
      listarIndicadores: jest.fn().mockResolvedValue([
        indicadores(),
        indicadores({
          idAluno: 2,
          engajamento: 0,
          totalAulas: 0,
          totalAtividades: 0,
          quantidadeNotas: 0,
          mediaNotas: null
        })
      ]),
      atualizarResultados: jest.fn().mockResolvedValue(undefined)
    };
    const service = new RiscoEvasaoService(repository as any);

    const resumo = await service.recalcularTodos();

    expect(resumo).toEqual(expect.objectContaining({
      processados: 2,
      atualizados: 1,
      semDadosSuficientes: 1
    }));
    expect(repository.atualizarResultados).toHaveBeenCalledWith([
      expect.objectContaining({ idAluno: 1, classificacao: 'baixo' })
    ]);
  });
});
