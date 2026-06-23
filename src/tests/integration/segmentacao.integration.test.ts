import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { registrarConsultaSegmentacao } from '../../backend/integrations/auditoriaIntegration';
import { expectErrorContract } from '../helpers/responseContract';

jest.mock('../../backend/integrations/auditoriaIntegration', () => ({
  registrarConsultaSegmentacao: jest.fn().mockResolvedValue(undefined)
}));

describe('UC-13 - Segmentacao de alunos', () => {
  let alunoRepository: Repository<Aluno>;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();
    jest.clearAllMocks();

    await alunoRepository.save([
      {
        nome: 'Maria Silva',
        email: 'maria.silva@pulsemais.org',
        idade: 19,
        genero: 'feminino',
        ocupacao: 'estudante',
        escolaridade: 'ensino_medio',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'alto',
        engajamento: 42,
        dataIngresso: '2026-02-10',
        status: 'em_acompanhamento'
      },
      {
        nome: 'Joao Pereira',
        email: 'joao.pereira@pulsemais.org',
        idade: 21,
        genero: 'masculino',
        ocupacao: 'buscando_emprego',
        escolaridade: 'ensino_medio',
        programa: 'Jornada de empregabilidade',
        categoria: 'capacitado',
        riscoEvasao: 'baixo',
        engajamento: 88,
        dataIngresso: '2026-02-12',
        status: 'ativo'
      },
      {
        nome: 'Ana Costa',
        email: 'ana.costa@pulsemais.org',
        idade: 23,
        genero: 'feminino',
        ocupacao: 'empregada',
        escolaridade: 'ensino_superior',
        programa: 'Portal de acompanhamento',
        categoria: 'egresso',
        riscoEvasao: 'medio',
        engajamento: 71,
        dataIngresso: '2025-11-05',
        status: 'egresso'
      },
      {
        nome: 'Luana Santos',
        email: 'luana.santos@pulsemais.org',
        idade: 18,
        genero: 'feminino',
        ocupacao: 'estudante',
        escolaridade: 'ensino_medio',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'baixo',
        engajamento: 79,
        dataIngresso: '2026-03-01',
        status: 'ativo'
      },
      {
        nome: 'Carlos Henrique',
        email: 'carlos.henrique@pulsemais.org',
        idade: 22,
        genero: 'masculino',
        ocupacao: 'buscando_emprego',
        escolaridade: 'ensino_medio',
        programa: 'Jornada de empregabilidade',
        categoria: 'capacitado',
        riscoEvasao: 'alto',
        engajamento: 38,
        dataIngresso: '2026-01-20',
        status: 'ativo'
      }
    ]);
  });

  afterAll(teardownIntegrationDatabase);

  it('CT01 - deve consultar e segmentar alunos por programa e risco com sucesso', async () => {
    const response = await request(app)
      .get('/api/alunos/segmentacao')
      .query({ programa: 'Mentoria de permanencia', risco: 'alto' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.alunos[0]).toMatchObject({
      nome: 'Maria Silva',
      email: 'maria.silva@pulsemais.org',
      programa: 'Mentoria de permanencia',
      riscoEvasao: 'alto'
    });
    expect(registrarConsultaSegmentacao).toHaveBeenCalledWith({
      fluxo: 'UC-13',
      filtros: expect.objectContaining({
        programa: 'Mentoria de permanencia',
        risco: 'alto'
      }),
      total: 1
    });
  });

  it('CT02 - deve rejeitar consulta ampla sem criterio de segmentacao', async () => {
    const response = await request(app).get('/api/alunos/segmentacao');

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Informe ao menos um criterio de segmentacao.'
    });
    expect(registrarConsultaSegmentacao).not.toHaveBeenCalled();
  });

  it('CT03 - deve rejeitar payload de query com limite em tipo invalido', async () => {
    const response = await request(app)
      .get('/api/alunos/segmentacao')
      .query({ programa: 'Mentoria de permanencia', limite: 'abc' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'O parametro limite deve ser um numero inteiro positivo.'
    });
    expect(registrarConsultaSegmentacao).not.toHaveBeenCalled();
  });

  it('CT04 - deve retornar aluno correto ao buscar por email', async () => {
    const alunoPersistido = await alunoRepository.findOneBy({
      email: 'carlos.henrique@pulsemais.org'
    });

    expect(alunoPersistido).toMatchObject({
      nome: 'Carlos Henrique',
      email: 'carlos.henrique@pulsemais.org',
      programa: 'Jornada de empregabilidade',
      riscoEvasao: 'alto',
      status: 'ativo'
    });

    const response = await request(app)
      .get('/api/alunos/segmentacao')
      .query({ busca: 'carlos.henrique' });

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(1);
    expect(response.body.data.alunos[0]).toMatchObject({
      idAluno: alunoPersistido?.idAluno,
      nome: 'Carlos Henrique',
      email: 'carlos.henrique@pulsemais.org'
    });
  });

  it('CT05 - deve rejeitar limite acima do maximo de segmentacao (RN de governanca)', async () => {
    const response = await request(app)
      .get('/api/alunos/segmentacao')
      .query({ programa: 'Mentoria de permanencia', limite: '101' });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      message: 'O limite maximo para segmentacao de alunos e 100 registros.'
    });
    expect(registrarConsultaSegmentacao).not.toHaveBeenCalled();
  });

  it('CT06 - deve rejeitar risco de evasao invalido', async () => {
    const response = await request(app)
      .get('/api/alunos/segmentacao')
      .query({ programa: 'Mentoria de permanencia', risco: 'critico' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Risco de evasao invalido.'
    });
  });

  performanceIt('RNF-DES-UC13 - deve responder segmentacao em ate 2000ms com base ampliada', async () => {
    const massa = Array.from({ length: 300 }).map((_, index) => ({
      nome: `Aluno ${index + 1}`,
      email: `aluno.${index + 1}@pulsemais.org`,
      idade: 18 + (index % 10),
      genero: index % 2 === 0 ? 'feminino' : 'masculino',
      ocupacao: index % 4 === 0 ? 'estudante' : 'buscando_emprego',
      escolaridade: 'ensino_medio',
      programa: index % 3 === 0 ? 'Mentoria de permanencia' : 'Jornada de empregabilidade',
      categoria: index % 2 === 0 ? 'conectado' : 'capacitado',
      riscoEvasao: (index % 3 === 0 ? 'alto' : index % 3 === 1 ? 'medio' : 'baixo') as
        | 'alto'
        | 'medio'
        | 'baixo',
      engajamento: 30 + (index % 60),
      dataIngresso: '2026-01-15',
      status: 'ativo' as const
    }));

    await alunoRepository.save(massa);

    const inicio = Date.now();
    const response = await request(app)
      .get('/api/alunos/segmentacao')
      .query({ programa: 'Mentoria de permanencia', limite: '100' });
    const duracaoMs = Date.now() - inicio;

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.total).toBeLessThanOrEqual(100);
    expect(duracaoMs).toBeLessThan(2000);
  });

  it('RNF-SEG-UC13 - deve padronizar erro sem campos sensiveis adicionais', async () => {
    const response = await request(app).get('/api/alunos/segmentacao').query({ busca: 'ab' });

    expect(response.status).toBe(400);
    expectErrorContract(response.body);
    expect(response.body).toEqual({
      success: false,
      data: null,
      message: 'O parametro busca deve ter pelo menos 3 caracteres.'
    });
    expect((response.body as { stack?: unknown }).stack).toBeUndefined();
  });
});
