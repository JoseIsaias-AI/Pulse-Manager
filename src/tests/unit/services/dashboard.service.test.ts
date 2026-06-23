import { DashboardService } from '../../../backend/services/dashboardService';
import { registrarConsultaDashboard } from '../../../backend/integrations/dashboardAuditoriaIntegration';
import { DashboardRepository } from '../../../backend/repositories/dashboardRepository';
import { asMockedDependency } from '../../helpers/mockHelper';

jest.mock('../../../backend/integrations/dashboardAuditoriaIntegration', () => ({
  registrarConsultaDashboard: jest.fn()
}));

const alunoBase = {
  idAluno: 1,
  codigoPm: null,
  nome: 'Aluno',
  email: 'aluno@email.com',
  telefone: null,
  idade: null,
  genero: null,
  ocupacao: null,
  tipoVinculoEmpregaticio: null,
  rendaMensal: null,
  escolaridade: null,
  instituicaoEnsinoSuperior: null,
  cursoEnsinoSuperior: null,
  statusEnsinoSuperior: null,
  dataIngressoEnsinoSuperior: null,
  programa: 'Programa A',
  categoria: 'cursando',
  riscoEvasao: 'baixo',
  engajamento: 0,
  dataIngresso: '2024-01-10',
  status: 'ativo',
  nivelJornada: null,
  perfilSocioeconomico: null,
  curso: null,
  origemParticipacao: null
};

function aluno(overrides: Record<string, unknown>) {
  return { ...alunoBase, ...overrides };
}

function makeRepository() {
  return {
    listarAlunosParaDashboard: jest.fn()
  };
}

describe('DashboardService', () => {
  let repository: ReturnType<typeof makeRepository>;
  let service: DashboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = makeRepository();
    service = new DashboardService(asMockedDependency<DashboardRepository>(repository));
    (registrarConsultaDashboard as jest.Mock).mockResolvedValue(undefined);
  });

  it('calcula resumo de impacto', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ ocupacao: 'empregado', status: 'egresso', escolaridade: 'ensino_superior' }),
      aluno({ idAluno: 2, ocupacao: 'desempregado', status: 'ativo', escolaridade: 'medio' })
    ]);

    const result = await service.obterResumoImpacto({});

    expect(result.data.totalAlunos).toBe(2);
    expect(result.data.alunosEmpregados.valor).toBe(1);
    expect(result.data.conclusaoProgramas.valor).toBe(1);
    expect(result.data.acessoEnsinoSuperior.valor).toBe(1);
  });

  it('calcula percentuais com duas casas decimais', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ ocupacao: 'empregado' }),
      aluno({ idAluno: 2, ocupacao: 'empregada' }),
      aluno({ idAluno: 3, ocupacao: 'desempregado' })
    ]);

    const result = await service.obterResumoImpacto({});

    expect(result.data.alunosEmpregados).toEqual({ valor: 2, percentual: 66.67 });
  });

  it('calcula os estagios do indicador de impacto pela categoria', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ categoria: 'conectado' }),
      aluno({ idAluno: 2, categoria: 'capacitado' }),
      aluno({ idAluno: 3, categoria: 'transformado' })
    ]);

    const result = await service.obterResumoImpacto({});

    expect(result.data.conectados).toEqual({ valor: 1, percentual: 33.33 });
    expect(result.data.capacitados).toEqual({ valor: 1, percentual: 33.33 });
    expect(result.data.transformados).toEqual({ valor: 1, percentual: 33.33 });
  });

  it('retorna percentual zero quando nao houver alunos', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([]);

    const result = await service.obterResumoImpacto({});

    expect(result.data.alunosEmpregados.percentual).toBe(0);
    expect(result.data.conclusaoProgramas.percentual).toBe(0);
    expect(result.data.acessoEnsinoSuperior.percentual).toBe(0);
  });

  it('agrupa impacto por programa', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ programa: 'Programa B', ocupacao: 'empregado' }),
      aluno({ idAluno: 2, programa: null, status: 'egresso' }),
      aluno({ idAluno: 3, programa: 'Programa B', escolaridade: 'faculdade' })
    ]);

    const result = await service.obterResumoImpacto({});

    expect(result.data.porPrograma).toEqual([
      { programa: 'Programa B', totalAlunos: 2, empregados: 1, concluintes: 0, ensinoSuperior: 1 },
      { programa: 'Sem programa', totalAlunos: 1, empregados: 0, concluintes: 1, ensinoSuperior: 0 }
    ]);
  });

  it('calcula resumo de jornada', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ status: 'desligado', riscoEvasao: 'alto' }),
      aluno({ idAluno: 2, status: 'ativo', riscoEvasao: 'medio' }),
      aluno({ idAluno: 3, status: 'ativo', riscoEvasao: 'baixo' })
    ]);

    const result = await service.obterResumoJornada({});

    expect(result.data.evasao).toEqual({ valor: 1, percentual: 33.33 });
    expect(result.data.riscoAlto.valor).toBe(1);
    expect(result.data.riscoMedio.valor).toBe(1);
    expect(result.data.riscoBaixo.valor).toBe(1);
  });

  it('identifica alunos evadidos', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ status: 'desligado' }),
      aluno({ idAluno: 2, status: 'inativo' }),
      aluno({ idAluno: 3, status: 'ativo' })
    ]);

    const result = await service.obterResumoJornada({});

    expect(result.data.evasao.valor).toBe(2);
  });

  it('retorna indicador de alunos empregados', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ ocupacao: 'trabalhando' }),
      aluno({ idAluno: 2, ocupacao: 'buscando_emprego' })
    ]);

    const result = await service.consultarAlunosEmpregados({});

    expect(result).toEqual({ success: true, data: { valor: 1, percentual: 50 } });
  });

  it('retorna indicador de conclusao de programas', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ status: 'egresso' }),
      aluno({ idAluno: 2, categoria: 'egresso destaque' })
    ]);

    const result = await service.consultarConclusaoProgramas({});

    expect(result.data).toEqual({ valor: 2, percentual: 100 });
  });

  it('retorna indicador de acesso ao ensino superior', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([
      aluno({ escolaridade: 'graduacao' }),
      aluno({ idAluno: 2, escolaridade: 'ensino medio' })
    ]);

    const result = await service.consultarAcessoEnsinoSuperior({});

    expect(result.data).toEqual({ valor: 1, percentual: 50 });
  });

  it('retorna resumo de evasao e risco sem porPrograma', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([aluno({ status: 'inativo', riscoEvasao: 'alto' })]);

    const result = await service.consultarEvasaoRisco({});

    expect(result.data).toEqual({
      totalAlunos: 1,
      evasao: { valor: 1, percentual: 100 },
      riscoAlto: { valor: 1, percentual: 100 },
      riscoMedio: { valor: 0, percentual: 0 },
      riscoBaixo: { valor: 0, percentual: 0 }
    });
    expect(result.data).not.toHaveProperty('porPrograma');
  });

  it('rejeita programa ou categoria com menos de 3 caracteres', async () => {
    await expect(service.obterResumoImpacto({ programa: 'AB' })).rejects.toThrow(
      'O parametro programa deve ter pelo menos 3 caracteres quando informado.'
    );
  });

  it('rejeita datas fora do formato YYYY-MM-DD', async () => {
    await expect(service.obterResumoImpacto({ dataInicio: '01/01/2024' })).rejects.toThrow(
      'O parametro dataInicio deve estar no formato YYYY-MM-DD.'
    );
  });

  it('rejeita data final anterior a data inicial', async () => {
    await expect(service.obterResumoImpacto({ dataInicio: '2024-06-10', dataFim: '2024-06-01' })).rejects.toThrow(
      'A dataFim nao pode ser anterior a dataInicio.'
    );
  });

  it('registra auditoria da consulta de dashboard', async () => {
    repository.listarAlunosParaDashboard.mockResolvedValue([aluno({})]);

    await service.obterResumoImpacto({ programa: 'Pulse' });

    expect(registrarConsultaDashboard).toHaveBeenCalledWith({
      fluxo: 'UC-14',
      endpoint: '/api/impacto/resumo',
      filtros: { programa: 'Pulse' },
      total: 1
    });
  });
});
