import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { MembroEquipe } from '../../backend/models/usuarioModel';

describe('RF019 - Comunicacao e Oportunidades', () => {
  let alunoRepository: Repository<Aluno>;
  let membroRepository: Repository<MembroEquipe>;
  let aluno: Aluno;
  let membro: MembroEquipe;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
    membroRepository = getIntegrationRepository(MembroEquipe);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    aluno = await alunoRepository.save({
      nome: 'Rafael Lima',
      email: 'rafael.lima@pulsemais.org',
      programa: 'Jornada de empregabilidade',
      categoria: 'capacitado',
      riscoEvasao: 'baixo',
      engajamento: 75,
      dataIngresso: '2026-02-01',
      status: 'ativo'
    });

    membro = await membroRepository.save({
      nome: 'Equipe de Comunicacao',
      cargo: 'coordenador',
      email: 'comunicacao@pulsemais.org'
    });
  });

  afterAll(teardownIntegrationDatabase);

  describe('RF019a - Notificacoes', () => {
    it('CT01 - deve listar notificacoes vazia inicialmente', async () => {
      const response = await request(app).get('/api/comunicacao');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('CT02 - deve criar notificacao para aluno existente', async () => {
      const response = await request(app).post('/api/comunicacao').send({
        titulo: 'Lembrete de sessao',
        idAluno: aluno.idAluno,
        mensagem: 'Sua proxima sessao esta agendada para amanha.',
        tipo: 'informativo',
        idRemetente: membro.idMembro,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: membro.nome,
        dataEnvio: '2026-04-10'
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        titulo: 'Lembrete de sessao',
        idAluno: aluno.idAluno,
        tipo: 'informativo'
      });
    });

    it('CT03 - deve listar notificacoes apos criacao', async () => {
      await request(app).post('/api/comunicacao').send({
        titulo: 'Notificacao de teste',
        idAluno: aluno.idAluno,
        mensagem: 'Mensagem de teste para o aluno.',
        tipo: 'alerta',
        idRemetente: membro.idMembro,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: membro.nome
      });

      const response = await request(app).get('/api/comunicacao');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('CT04 - deve filtrar notificacoes por idAluno', async () => {
      await request(app).post('/api/comunicacao').send({
        titulo: 'Para Rafael',
        idAluno: aluno.idAluno,
        mensagem: 'Mensagem especifica para Rafael.',
        tipo: 'convite',
        idRemetente: membro.idMembro,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: membro.nome
      });

      const response = await request(app).get(`/api/comunicacao?idAluno=${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('CT05 - deve retornar 404 ao criar notificacao para aluno inexistente', async () => {
      const response = await request(app).post('/api/comunicacao').send({
        titulo: 'Notificacao',
        idAluno: 9999,
        mensagem: 'Mensagem para ninguem.',
        tipo: 'informativo',
        idRemetente: membro.idMembro,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: membro.nome
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno destinatario da notificacao nao encontrado.'
      });
    });

    it('CT06 - deve rejeitar tipo de notificacao invalido', async () => {
      const response = await request(app).post('/api/comunicacao').send({
        titulo: 'Notificacao',
        idAluno: aluno.idAluno,
        mensagem: 'Mensagem valida de teste.',
        tipo: 'tipo_invalido',
        idRemetente: membro.idMembro,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: membro.nome
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Tipo de notificacao invalido.'
      });
    });

    it('CT07 - deve rejeitar tipo de remetente invalido', async () => {
      const response = await request(app).post('/api/comunicacao').send({
        titulo: 'Notificacao',
        idAluno: aluno.idAluno,
        mensagem: 'Mensagem de teste com remetente errado.',
        tipo: 'informativo',
        idRemetente: membro.idMembro,
        tipoRemetente: 'remetente_invalido',
        nomeRemetente: membro.nome
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Tipo de remetente invalido.'
      });
    });

    it('CT08 - deve rejeitar dataEnvio em formato invalido', async () => {
      const response = await request(app).post('/api/comunicacao').send({
        titulo: 'Notificacao',
        idAluno: aluno.idAluno,
        mensagem: 'Mensagem com data errada.',
        tipo: 'informativo',
        idRemetente: membro.idMembro,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: membro.nome,
        dataEnvio: '10/04/2026'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo dataEnvio deve estar no formato YYYY-MM-DD.'
      });
    });
  });

  describe('RF019b - Oportunidades', () => {
    it('CT01 - deve listar oportunidades vazia inicialmente', async () => {
      const response = await request(app).get('/api/comunicacao/oportunidades');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('CT02 - deve criar oportunidade com dados validos', async () => {
      const response = await request(app).post('/api/comunicacao/oportunidades').send({
        titulo: 'Vaga de estagio em TI',
        descricao: 'Oportunidade para estudantes de tecnologia.',
        tipo: 'estagio',
        prazoInscricao: '2026-05-01',
        idMembro: membro.idMembro
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        titulo: 'Vaga de estagio em TI',
        tipo: 'estagio'
      });
    });

    it('CT03 - deve listar oportunidades apos criacao', async () => {
      await request(app).post('/api/comunicacao/oportunidades').send({
        titulo: 'Bolsa de estudos',
        tipo: 'bolsa',
        idMembro: membro.idMembro
      });

      const response = await request(app).get('/api/comunicacao/oportunidades');

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('CT04 - deve rejeitar tipo de oportunidade invalido', async () => {
      const response = await request(app).post('/api/comunicacao/oportunidades').send({
        titulo: 'Oportunidade invalida',
        tipo: 'tipo_invalido',
        idMembro: membro.idMembro
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Tipo de oportunidade invalido.'
      });
    });

    it('CT05 - deve rejeitar prazoInscricao em formato invalido', async () => {
      const response = await request(app).post('/api/comunicacao/oportunidades').send({
        titulo: 'Oportunidade com data errada',
        tipo: 'emprego',
        prazoInscricao: '01/05/2026',
        idMembro: membro.idMembro
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo prazoInscricao deve estar no formato YYYY-MM-DD.'
      });
    });
  });

  describe('RNF - Qualidade para RF019', () => {
    performanceIt('RNF-DES-RF019 - deve responder listagem de notificacoes em ate 1000ms', async () => {
      const inicio = Date.now();
      const response = await request(app).get('/api/comunicacao');
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1000);
    });

    it('RNF-SEG-RF019 - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app).post('/api/comunicacao').send({
        titulo: 'Notificacao',
        idAluno: 9999,
        mensagem: 'Mensagem qualquer.',
        tipo: 'informativo',
        idRemetente: 1,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: 'Teste'
      });

      expect(response.status).toBe(404);
      expect(response.body.stack).toBeUndefined();
    });
  });
});
