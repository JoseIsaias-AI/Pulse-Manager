import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { Psicologo } from '../../backend/models/usuarioModel';

describe('UC-20 - Saude Mental e Historico Psicologico', () => {
  let alunoRepository: Repository<Aluno>;
  let psicologoRepository: Repository<Psicologo>;
  let aluno: Aluno;
  let psicologo: Psicologo;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
    psicologoRepository = getIntegrationRepository(Psicologo);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    aluno = await alunoRepository.save({
      nome: 'Lucia Nunes',
      email: 'lucia.nunes@pulsemais.org',
      programa: 'Acolhimento',
      categoria: 'vulneravel',
      riscoEvasao: 'alto',
      engajamento: 30,
      dataIngresso: '2026-01-05',
      status: 'em_acompanhamento'
    });

    psicologo = await psicologoRepository.save({
      nomePsi: 'Dra. Camila Souza',
      cargoPsi: 'psicologa'
    });
  });

  afterAll(teardownIntegrationDatabase);

  describe('UC-20a - Historico psicologico (prontuarios)', () => {
    it('CT01 - deve listar prontuarios com perfil psicologo', async () => {
      const response = await request(app)
        .get('/api/prontuarios')
        .set('x-user-role', 'psicologo');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('CT02 - deve rejeitar listagem de prontuarios sem perfil psicologo', async () => {
      const response = await request(app).get('/api/prontuarios');

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Registros de saude mental sao restritos ao perfil psicologo.'
      });
    });

    it('CT03 - deve criar registro psicologico com perfil psicologo', async () => {
      const response = await request(app)
        .post('/api/prontuarios')
        .set('x-user-role', 'psicologo')
        .send({
          idAluno: aluno.idAluno,
          idPsi: psicologo.idPsi,
          titulo: 'Primeira consulta',
          observacao: 'Aluno demonstra sinais de ansiedade moderada.'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        titulo: 'Primeira consulta',
        idAluno: aluno.idAluno,
        idPsi: psicologo.idPsi
      });
    });

    it('CT04 - deve retornar 404 ao criar registro para aluno inexistente', async () => {
      const response = await request(app)
        .post('/api/prontuarios')
        .set('x-user-role', 'psicologo')
        .send({
          idAluno: 9999,
          idPsi: psicologo.idPsi,
          titulo: 'Consulta para inexistente',
          observacao: 'Observacao para aluno que nao existe.'
        });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado para registro psicologico.'
      });
    });

    it('CT05 - deve rejeitar criacao sem perfil psicologo', async () => {
      const response = await request(app)
        .post('/api/prontuarios')
        .send({
          idAluno: aluno.idAluno,
          idPsi: psicologo.idPsi,
          titulo: 'Registro nao autorizado',
          observacao: 'Tentativa sem perfil correto.'
        });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Registros de saude mental sao restritos ao perfil psicologo.'
      });
    });

    it('CT06 - deve filtrar prontuarios por idAluno', async () => {
      await request(app)
        .post('/api/prontuarios')
        .set('x-user-role', 'psicologo')
        .send({
          idAluno: aluno.idAluno,
          idPsi: psicologo.idPsi,
          titulo: 'Sessao de Lucia',
          observacao: 'Relato de evolucao positiva ao longo das sessoes.'
        });

      const response = await request(app)
        .get(`/api/prontuarios?idAluno=${aluno.idAluno}`)
        .set('x-user-role', 'psicologo');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('UC-20b - Labels psicologicas', () => {
    it('CT01 - deve listar labels com perfil psicologo', async () => {
      const response = await request(app)
        .get('/api/labels')
        .set('x-user-role', 'psicologo');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('CT02 - deve criar label com perfil psicologo', async () => {
      const response = await request(app)
        .post('/api/labels')
        .set('x-user-role', 'psicologo')
        .send({
          idAluno: aluno.idAluno,
          idPsi: psicologo.idPsi,
          descricao: 'Aluno com alta ansiedade em provas',
          tipoLabel: 'risco'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        tipoLabel: 'risco',
        idAluno: aluno.idAluno
      });
    });

    it('CT03 - deve rejeitar tipo de label invalido', async () => {
      const response = await request(app)
        .post('/api/labels')
        .set('x-user-role', 'psicologo')
        .send({
          idAluno: aluno.idAluno,
          idPsi: psicologo.idPsi,
          descricao: 'Label com tipo errado',
          tipoLabel: 'tipo_inexistente'
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Tipo de label invalido.'
      });
    });

    it('CT04 - deve retornar 404 ao criar label para aluno inexistente', async () => {
      const response = await request(app)
        .post('/api/labels')
        .set('x-user-role', 'psicologo')
        .send({
          idAluno: 9999,
          idPsi: psicologo.idPsi,
          descricao: 'Label para inexistente',
          tipoLabel: 'perfil'
        });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado para registro psicologico.'
      });
    });

    it('CT05 - deve rejeitar criacao de label sem perfil psicologo', async () => {
      const response = await request(app)
        .post('/api/labels')
        .send({
          idAluno: aluno.idAluno,
          idPsi: psicologo.idPsi,
          descricao: 'Label sem permissao',
          tipoLabel: 'perfil'
        });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Registros de saude mental sao restritos ao perfil psicologo.'
      });
    });

    it('CT06 - deve rejeitar listagem de labels sem perfil psicologo', async () => {
      const response = await request(app).get('/api/labels');

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Registros de saude mental sao restritos ao perfil psicologo.'
      });
    });
  });

  describe('RNF - Qualidade para UC-20', () => {
    performanceIt('RNF-DES-UC20 - deve responder listagem de prontuarios em ate 1000ms', async () => {
      const inicio = Date.now();
      const response = await request(app)
        .get('/api/prontuarios')
        .set('x-user-role', 'psicologo');
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1000);
    });

    it('RNF-SEG-UC20 - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app).get('/api/prontuarios');

      expect(response.status).toBe(422);
      expect(response.body.stack).toBeUndefined();
    });
  });
});
