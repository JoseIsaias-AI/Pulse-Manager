import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { registrarConsultaDashboard } from '../../backend/integrations/dashboardAuditoriaIntegration';
import { expectErrorContract } from '../helpers/responseContract';

jest.mock('../../backend/integrations/dashboardAuditoriaIntegration', () => ({
  registrarConsultaDashboard: jest.fn().mockResolvedValue(undefined)
}));

describe('UC-14 a UC-19 - Dashboard de Impacto', () => {
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
        status: 'desligado'
      },
      {
        nome: 'Paula Ribeiro',
        email: 'paula.ribeiro@pulsemais.org',
        idade: 24,
        genero: 'feminino',
        ocupacao: 'autonomo',
        escolaridade: 'ensino_superior',
        programa: 'Jornada de empregabilidade',
        categoria: 'capacitado',
        riscoEvasao: 'baixo',
        engajamento: 64,
        dataIngresso: '2026-04-10',
        status: 'inativo'
      }
    ]);
  });

  afterAll(teardownIntegrationDatabase);

  describe('UC-14 - Visualizar dashboard de impacto', () => {
    it('CT01 - deve retornar resumo de impacto consolidado', async () => {
      const response = await request(app).get('/api/impacto/resumo');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAlunos).toBe(6);
      expect(response.body.data.conectados).toEqual({ valor: 2, percentual: 33.33 });
      expect(response.body.data.capacitados).toEqual({ valor: 3, percentual: 50 });
      expect(response.body.data.transformados).toEqual({ valor: 0, percentual: 0 });
      expect(response.body.data.alunosEmpregados.valor).toBe(2);
      expect(response.body.data.conclusaoProgramas.valor).toBe(1);
      expect(response.body.data.acessoEnsinoSuperior.valor).toBe(2);
      expect(response.body.data.porPrograma.length).toBe(3);
      expect(registrarConsultaDashboard).toHaveBeenCalledWith({
        fluxo: 'UC-14',
        endpoint: '/api/impacto/resumo',
        filtros: {},
        total: 6
      });
    });

    it('CT02 - deve retornar resumo de jornada consolidado', async () => {
      const response = await request(app).get('/api/jornada/resumo');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAlunos).toBe(6);
      expect(response.body.data.evasao.valor).toBe(2);
      expect(response.body.data.riscoAlto.valor).toBe(2);
      expect(response.body.data.riscoMedio.valor).toBe(1);
      expect(response.body.data.riscoBaixo.valor).toBe(3);
      expect(response.body.data.porPrograma.length).toBe(3);
      expect(registrarConsultaDashboard).toHaveBeenCalledWith({
        fluxo: 'UC-14',
        endpoint: '/api/jornada/resumo',
        filtros: {},
        total: 6
      });
    });

    it('CT03 - deve rejeitar dataInicio invalida no dashboard', async () => {
      const response = await request(app)
        .get('/api/impacto/resumo')
        .query({ dataInicio: '01-01-2026' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O parametro dataInicio deve estar no formato YYYY-MM-DD.'
      });
    });

    it('CT04 - deve rejeitar intervalo invalido no dashboard', async () => {
      const response = await request(app)
        .get('/api/jornada/resumo')
        .query({ dataInicio: '2026-05-10', dataFim: '2026-02-10' });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'A dataFim nao pode ser anterior a dataInicio.'
      });
    });

    it('CT05 - deve aplicar filtro por periodo no resumo de impacto (RN009)', async () => {
      const response = await request(app)
        .get('/api/impacto/resumo')
        .query({ dataInicio: '2026-03-01', dataFim: '2026-04-30' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAlunos).toBe(2);
    });

    it('CT06 - deve rejeitar dataInicio invalida no resumo de jornada', async () => {
      const response = await request(app)
        .get('/api/jornada/resumo')
        .query({ dataInicio: '2026/02/01' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O parametro dataInicio deve estar no formato YYYY-MM-DD.'
      });
    });
  });

  describe('UC-15 - Consultar conclusao de programas', () => {
    it('CT01 - deve retornar indicador de conclusao consolidado', async () => {
      const response = await request(app).get('/api/impacto/conclusao-programas');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ valor: 1, percentual: 16.67 });
      expect(registrarConsultaDashboard).toHaveBeenCalledWith({
        fluxo: 'UC-14',
        endpoint: '/api/impacto/conclusao-programas',
        filtros: {},
        total: 6
      });
    });

    it('CT02 - deve retornar indicador de conclusao por programa filtrado', async () => {
      const response = await request(app)
        .get('/api/impacto/conclusao-programas')
        .query({ programa: 'Portal de acompanhamento' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ valor: 1, percentual: 100 });
    });

    it('CT03 - deve rejeitar categoria com menos de 3 caracteres', async () => {
      const response = await request(app)
        .get('/api/impacto/conclusao-programas')
        .query({ categoria: 'ab' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O parametro categoria deve ter pelo menos 3 caracteres quando informado.'
      });
    });

    it('CT04 - deve rejeitar periodo inconsistente', async () => {
      const response = await request(app)
        .get('/api/impacto/conclusao-programas')
        .query({ dataInicio: '2026-04-10', dataFim: '2026-03-10' });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'A dataFim nao pode ser anterior a dataInicio.'
      });
    });

    it('CT05 - deve considerar categoria com termo egresso como conclusao', async () => {
      await alunoRepository.save({
        nome: 'Bruna Nogueira',
        email: 'bruna.nogueira@pulsemais.org',
        idade: 20,
        genero: 'feminino',
        ocupacao: 'estudante',
        escolaridade: 'ensino_medio',
        programa: 'Mentoria de permanencia',
        categoria: 'egresso em transicao',
        riscoEvasao: 'baixo',
        engajamento: 73,
        dataIngresso: '2026-01-18',
        status: 'ativo'
      });

      const response = await request(app).get('/api/impacto/conclusao-programas');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ valor: 2, percentual: 28.57 });
    });
  });

  describe('UC-16 - Consultar alunos empregados', () => {
    it('CT01 - deve retornar indicador de alunos empregados consolidado', async () => {
      const response = await request(app).get('/api/impacto/alunos-empregados');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ valor: 2, percentual: 33.33 });
      expect(registrarConsultaDashboard).toHaveBeenCalledWith({
        fluxo: 'UC-14',
        endpoint: '/api/impacto/alunos-empregados',
        filtros: {},
        total: 6
      });
    });

    it('CT02 - deve retornar indicador de empregados por programa filtrado', async () => {
      const response = await request(app)
        .get('/api/impacto/alunos-empregados')
        .query({ programa: 'Jornada de empregabilidade' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ valor: 1, percentual: 33.33 });
    });

    it('CT03 - deve rejeitar formato invalido de dataFim', async () => {
      const response = await request(app)
        .get('/api/impacto/alunos-empregados')
        .query({ dataFim: '2026/05/01' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O parametro dataFim deve estar no formato YYYY-MM-DD.'
      });
    });

    it('CT04 - deve rejeitar periodo inconsistente para empregados', async () => {
      const response = await request(app)
        .get('/api/impacto/alunos-empregados')
        .query({ dataInicio: '2026-04-10', dataFim: '2026-01-01' });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'A dataFim nao pode ser anterior a dataInicio.'
      });
    });

    it('CT05 - deve contabilizar vinculo informal como empregado (RN008)', async () => {
      const response = await request(app)
        .get('/api/impacto/alunos-empregados')
        .query({ programa: 'Jornada de empregabilidade' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ valor: 1, percentual: 33.33 });
    });
  });

  describe('UC-18 - Consultar acesso ao ensino superior', () => {
    it('CT01 - deve retornar indicador de acesso ao ensino superior consolidado', async () => {
      const response = await request(app).get('/api/impacto/acesso-ensino-superior');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ valor: 2, percentual: 33.33 });
      expect(registrarConsultaDashboard).toHaveBeenCalledWith({
        fluxo: 'UC-14',
        endpoint: '/api/impacto/acesso-ensino-superior',
        filtros: {},
        total: 6
      });
    });

    it('CT02 - deve retornar indicador de ensino superior por programa filtrado', async () => {
      const response = await request(app)
        .get('/api/impacto/acesso-ensino-superior')
        .query({ programa: 'Mentoria de permanencia' });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ valor: 0, percentual: 0 });
    });

    it('CT03 - deve rejeitar programa com menos de 3 caracteres', async () => {
      const response = await request(app)
        .get('/api/impacto/acesso-ensino-superior')
        .query({ programa: 'ab' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O parametro programa deve ter pelo menos 3 caracteres quando informado.'
      });
    });

    it('CT04 - deve rejeitar periodo inconsistente para ensino superior', async () => {
      const response = await request(app)
        .get('/api/impacto/acesso-ensino-superior')
        .query({ dataInicio: '2026-03-01', dataFim: '2026-02-01' });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'A dataFim nao pode ser anterior a dataInicio.'
      });
    });

    it('CT05 - deve considerar termos equivalentes de ensino superior', async () => {
      await alunoRepository.save({
        nome: 'Rafaela Lima',
        email: 'rafaela.lima@pulsemais.org',
        idade: 20,
        genero: 'feminino',
        ocupacao: 'estudante',
        escolaridade: 'faculdade incompleta',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'medio',
        engajamento: 67,
        dataIngresso: '2026-03-25',
        status: 'ativo'
      });

      const response = await request(app).get('/api/impacto/acesso-ensino-superior');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({ valor: 3, percentual: 42.86 });
    });
  });

  describe('UC-19 - Consultar evasao e risco de evasao', () => {
    it('CT01 - deve retornar indicador consolidado de evasao e risco', async () => {
      const response = await request(app).get('/api/jornada/evasao-risco');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAlunos).toBe(6);
      expect(response.body.data.evasao).toEqual({ valor: 2, percentual: 33.33 });
      expect(response.body.data.riscoAlto).toEqual({ valor: 2, percentual: 33.33 });
      expect(response.body.data.riscoMedio).toEqual({ valor: 1, percentual: 16.67 });
      expect(response.body.data.riscoBaixo).toEqual({ valor: 3, percentual: 50 });
      expect(response.body.data.porPrograma).toBeUndefined();
      expect(registrarConsultaDashboard).toHaveBeenCalledWith({
        fluxo: 'UC-14',
        endpoint: '/api/jornada/evasao-risco',
        filtros: {},
        total: 6
      });
    });

    it('CT02 - deve retornar indicador por programa filtrado', async () => {
      const response = await request(app)
        .get('/api/jornada/evasao-risco')
        .query({ programa: 'Jornada de empregabilidade' });

      expect(response.status).toBe(200);
      expect(response.body.data.totalAlunos).toBe(3);
      expect(response.body.data.evasao).toEqual({ valor: 2, percentual: 66.67 });
      expect(response.body.data.riscoAlto).toEqual({ valor: 1, percentual: 33.33 });
    });

    it('CT03 - deve rejeitar formato invalido de dataInicio', async () => {
      const response = await request(app)
        .get('/api/jornada/evasao-risco')
        .query({ dataInicio: '2026/02/01' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O parametro dataInicio deve estar no formato YYYY-MM-DD.'
      });
    });

    it('CT04 - deve rejeitar periodo inconsistente para evasao e risco', async () => {
      const response = await request(app)
        .get('/api/jornada/evasao-risco')
        .query({ dataInicio: '2026-05-01', dataFim: '2026-01-01' });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'A dataFim nao pode ser anterior a dataInicio.'
      });
    });

    it('CT05 - deve considerar evasao apenas para status inativo ou desligado', async () => {
      await alunoRepository.save({
        nome: 'Gustavo Melo',
        email: 'gustavo.melo@pulsemais.org',
        idade: 25,
        genero: 'masculino',
        ocupacao: 'empregado',
        escolaridade: 'ensino_superior',
        programa: 'Portal de acompanhamento',
        categoria: 'egresso',
        riscoEvasao: 'alto',
        engajamento: 52,
        dataIngresso: '2026-02-02',
        status: 'egresso'
      });

      const response = await request(app).get('/api/jornada/evasao-risco');

      expect(response.status).toBe(200);
      expect(response.body.data.totalAlunos).toBe(7);
      expect(response.body.data.evasao).toEqual({ valor: 2, percentual: 28.57 });
    });
  });

  describe('RNF - Qualidade para UC-14 a UC-19', () => {
    performanceIt('RNF-DES-UC14 - deve responder resumo de impacto em ate 3000ms', async () => {
      const inicio = Date.now();
      const response = await request(app).get('/api/impacto/resumo');
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(3000);
    });

    it('RNF-SEG-UC19 - deve padronizar erro sem stack trace', async () => {
      const response = await request(app)
        .get('/api/jornada/evasao-risco')
        .query({ dataInicio: '2026/02/01' });

      expect(response.status).toBe(400);
      expectErrorContract(response.body);
      expect(response.body).toEqual({
        success: false,
        data: null,
        message: 'O parametro dataInicio deve estar no formato YYYY-MM-DD.'
      });
      expect((response.body as { stack?: unknown }).stack).toBeUndefined();
    });
  });
});
