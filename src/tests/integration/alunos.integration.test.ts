import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';

describe('UC-03 a UC-06 - Gestao de Alunos', () => {
  let alunoRepository: Repository<Aluno>;
  let aluno: Aluno;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepository = AppDataSource.getRepository(Aluno);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

    aluno = await alunoRepository.save({
      nome: 'Carlos Mendes',
      email: 'carlos.mendes@pulsemais.org',
      idade: 25,
      genero: 'masculino',
      ocupacao: 'estudante',
      escolaridade: 'ensino_medio',
      programa: 'Jornada de empregabilidade',
      categoria: 'capacitado',
      riscoEvasao: 'medio',
      engajamento: 60,
      dataIngresso: '2026-01-10',
      status: 'ativo'
    });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('UC-03 - Cadastrar aluno (RN001, RN002)', () => {
    it('CT01 - deve cadastrar aluno e gerar codigo PM automaticamente (RN001)', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Julia Ferreira',
        email: 'julia.ferreira@pulsemais.org',
        dataIngresso: '2026-02-01',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.codigoPm).toMatch(/^PM-\d{4}-\d{3}$/);
      expect(response.body.data.email).toBe('julia.ferreira@pulsemais.org');
    });

    it('CT02 - deve rejeitar email duplicado (RN002)', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Carlos Outro',
        email: 'carlos.mendes@pulsemais.org',
        programa: 'Mentoria',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Ja existe aluno cadastrado com este e-mail.'
      });
    });

    it('CT03 - deve rejeitar email invalido', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Aluno Invalido',
        email: 'emailsemarroba',
        programa: 'Mentoria',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo email deve conter um endereco valido.'
      });
    });

    it('CT04 - deve rejeitar idade fora da faixa permitida', async () => {
      const response = await request(app).post('/api/alunos').send({
        nome: 'Aluno Idade',
        email: 'aluno.idade@pulsemais.org',
        idade: 150,
        programa: 'Mentoria',
        categoria: 'conectado',
        riscoEvasao: 'baixo'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo idade deve estar entre 0 e 120.'
      });
    });
  });

  describe('UC-04 - Listar e consultar alunos', () => {
    it('CT01 - deve listar alunos cadastrados', async () => {
      const response = await request(app).get('/api/alunos');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.alunos)).toBe(true);
      expect(response.body.data.alunos.length).toBeGreaterThanOrEqual(1);
    });

    it('CT02 - deve obter perfil de aluno pelo id', async () => {
      const response = await request(app).get(`/api/alunos/${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe('Carlos Mendes');
    });

    it('CT03 - deve retornar 404 quando aluno nao existe', async () => {
      const response = await request(app).get('/api/alunos/9999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT04 - deve filtrar alunos por status', async () => {
      const response = await request(app).get('/api/alunos?status=ativo');

      expect(response.status).toBe(200);
      expect(response.body.data.alunos.length).toBeGreaterThanOrEqual(1);
      response.body.data.alunos.forEach((a: { status: string }) => {
        expect(a.status).toBe('ativo');
      });
    });

    it('CT05 - deve retornar 400 para idAluno invalido', async () => {
      const response = await request(app).get('/api/alunos/nao-e-numero');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo idAluno deve ser um numero inteiro positivo.'
      });
    });
  });

  describe('UC-05 - Atualizar dados do aluno', () => {
    it('CT01 - deve atualizar dados do aluno', async () => {
      const response = await request(app)
        .patch(`/api/alunos/${aluno.idAluno}`)
        .send({ nome: 'Carlos Mendes Atualizado', riscoEvasao: 'alto' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe('Carlos Mendes Atualizado');
    });

    it('CT02 - deve rejeitar riscoEvasao invalido', async () => {
      const response = await request(app)
        .patch(`/api/alunos/${aluno.idAluno}`)
        .send({ riscoEvasao: 'invalido' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Risco de evasao invalido.'
      });
    });

    it('CT03 - deve retornar 404 ao atualizar aluno inexistente', async () => {
      const response = await request(app)
        .patch('/api/alunos/9999')
        .send({ nome: 'Qualquer Nome' });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });
  });

  describe('UC-06 - Inativar aluno (RN010)', () => {
    it('CT01 - deve inativar aluno sem remover do banco (RN010)', async () => {
      const response = await request(app).delete(`/api/alunos/${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('inativo');
    });

    it('CT02 - deve retornar 404 ao inativar aluno inexistente', async () => {
      const response = await request(app).delete('/api/alunos/9999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT03 - aluno inativado deve permanecer acessivel no banco (RN010)', async () => {
      await request(app).delete(`/api/alunos/${aluno.idAluno}`);

      const response = await request(app).get(`/api/alunos/${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inativo');
    });
  });

  describe('RNF - Qualidade para UC-03 a UC-06', () => {
    it('RNF-DES-UC04 - deve responder listagem de alunos em ate 1500ms', async () => {
      const inicio = Date.now();
      const response = await request(app).get('/api/alunos');
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1500);
    });

    it('RNF-SEG-UC06 - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app).delete('/api/alunos/9999');

      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();
    });
  });
});
