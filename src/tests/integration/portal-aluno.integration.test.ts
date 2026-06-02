import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';

describe('UC-01/UC-02 - Portal do Aluno', () => {
  let alunoRepository: Repository<Aluno>;
  let aluno: Aluno;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepository = AppDataSource.getRepository(Aluno);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

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

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('UC-01 - Visualizar perfil no portal', () => {
    it('CT01 - deve retornar o perfil do aluno com campos do portal', async () => {
      const response = await request(app).get(`/api/portal/alunos/${aluno.idAluno}`);

      expect(response.status).toBe(200);
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
      const response = await request(app).get('/api/portal/alunos/9999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado no portal.'
      });
    });

    it('CT03 - deve retornar 400 para idAluno invalido', async () => {
      const response = await request(app).get('/api/portal/alunos/abc');

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
        .send({ email: 'ana.novo@pulsemais.org' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('ana.novo@pulsemais.org');
    });

    it('CT02 - deve atualizar telefone do aluno', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .send({ telefone: '11988880000' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.telefone).toBe('11988880000');
    });

    it('CT03 - deve retornar 404 quando aluno nao existe', async () => {
      const response = await request(app)
        .patch('/api/portal/alunos/9999/contato')
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
        .send({ email: 'emailsemarroba' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo email deve conter um endereco valido.'
      });
    });

    it('CT05 - deve rejeitar quando nenhum campo e informado', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Informe email ou telefone para atualizar o contato.'
      });
    });
  });

  describe('RNF - Qualidade para UC-01 e UC-02', () => {
    it('RNF-DES-UC01 - deve responder visualizacao do perfil em ate 1000ms', async () => {
      const inicio = Date.now();
      const response = await request(app).get(`/api/portal/alunos/${aluno.idAluno}`);
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1000);
    });

    it('RNF-SEG-UC02 - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app)
        .patch(`/api/portal/alunos/${aluno.idAluno}/contato`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.stack).toBeUndefined();
    });
  });
});
