import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { expectErrorContract, expectSuccessContract } from '../helpers/responseContract';

describe('UC-01 a UC-02 - Portal do Aluno', () => {
  let alunoRepository: Repository<Aluno>;
  let aluno: Aluno;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    aluno = await alunoRepository.save({
      nome: 'Ana Costa',
      email: 'ana.costa@pulsemais.org',
      idade: 22,
      genero: 'feminino',
      ocupacao: 'estudante',
      escolaridade: 'ensino_medio',
      programa: 'Mentoria de permanencia',
      categoria: 'conectado',
      riscoEvasao: 'baixo',
      engajamento: 70,
      dataIngresso: '2026-01-15',
      status: 'ativo',
      codigoPm: 'PM-2026-001',
      telefone: '11999990000',
      nivelJornada: 'intermediario'
    });
  });

  afterAll(teardownIntegrationDatabase);

  describe('UC-01 - Visualizar perfil no portal', () => {
    it('CT01 - deve retornar o perfil do aluno com campos do portal', async () => {
      const response = await request(app)
        .get(`/api/portal/alunos/${aluno.idAluno}`)
        .set('x-user-id', String(aluno.idAluno));

      expect(response.status).toBe(200);
      expectSuccessContract(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        idAluno: aluno.idAluno,
        nome: 'Ana Costa',
        email: 'ana.costa@pulsemais.org',
        status: 'ativo',
        telefone: '11999990000',
        nivelJornada: 'intermediario'
      });
    });

    it('CT02 - deve retornar 404 quando aluno nao existe', async () => {
      const response = await request(app)
        .get('/api/portal/alunos/9999')
        .set('x-user-id', '9999');

      expect(response.status).toBe(404);
      expectErrorContract(response.body);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado no portal.'
      });
    });

    it('CT03 - deve retornar 400 para idAluno invalido', async () => {
      const response = await request(app)
        .get('/api/portal/alunos/abc')
        .set('x-user-id', String(aluno.idAluno));

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo idAluno deve ser um numero inteiro positivo.'
      });
    });
  });

  describe('UC-02 - Atualizar contato no portal', () => {
    it('CT01 - deve atualizar email do aluno', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .set('x-user-id', String(aluno.idAluno))
        .send({ email: 'ana.novo@pulsemais.org' });

      expect(response.status).toBe(200);
      expectSuccessContract(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('ana.novo@pulsemais.org');
    });

    it('CT02 - deve atualizar telefone do aluno', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .set('x-user-id', String(aluno.idAluno))
        .send({ telefone: '11988880000' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.telefone).toBe('11988880000');
    });

    it('CT03 - deve retornar 404 quando aluno nao existe', async () => {
      const response = await request(app)
        .patch('/api/portal/alunos/9999/contato')
        .set('x-user-id', '9999')
        .send({ telefone: '11988880000' });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado no portal.'
      });
    });

    it('CT04 - deve rejeitar email invalido', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .set('x-user-id', String(aluno.idAluno))
        .send({ email: 'emailsemarroba' });

      expect(response.status).toBe(400);
      expectErrorContract(response.body);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo email deve conter um endereco valido.'
      });
    });

    it('CT05 - deve rejeitar quando nenhum campo e informado', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .set('x-user-id', String(aluno.idAluno))
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Informe email ou telefone para atualizar o contato.'
      });
    });
  });

  describe('RNF - Qualidade para UC-01 e UC-02', () => {
    performanceIt('RNF-DES-UC01 - deve responder visualizacao do perfil em ate 1000ms', async () => {
      const inicio = Date.now();
      const response = await request(app)
        .get(`/api/portal/alunos/${aluno.idAluno}`)
        .set('x-user-id', String(aluno.idAluno));
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1000);
    });

    it('RNF-SEG-UC02 - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .set('x-user-id', String(aluno.idAluno))
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.stack).toBeUndefined();
    });

    it('RNF-SEG-UC01 - deve impedir que um aluno consulte o perfil de outro', async () => {
      const response = await request(app)
        .get(`/api/portal/alunos/${aluno.idAluno}`)
        .set('x-user-id', String(aluno.idAluno + 1));

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Acesso negado: voce so pode visualizar os seus proprios dados.'
      });
    });

    it('RNF-SEG-UC02 - deve impedir que um aluno altere o contato de outro', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .set('x-user-id', String(aluno.idAluno + 1))
        .send({ telefone: '11900000000' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
