import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { Aluno } from '../../backend/models/alunoModel';

describe('UC-24 - Restricao de remetente psicologo em notificacoes', () => {
  let alunoRepository: Repository<Aluno>;
  let aluno: Aluno;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    aluno = await alunoRepository.save({
      nome: 'Bia Alves',
      email: 'bia.alves@pulsemais.org',
      programa: 'Jornada de empregabilidade',
      categoria: 'capacitado',
      riscoEvasao: 'baixo',
      engajamento: 70,
      dataIngresso: '2026-03-01',
      status: 'ativo'
    });
  });

  afterAll(teardownIntegrationDatabase);

  it('CT01 - deve permitir psicologo enviar notificacao com tipoRemetente psicologo', async () => {
    const response = await request(app)
      .post('/api/comunicacao')
      .set('x-user-role', 'psicologo')
      .send({
        titulo: 'Sessao de acompanhamento',
        idAluno: aluno.idAluno,
        mensagem: 'Lembrete da sua proxima sessao.',
        tipo: 'informativo',
        idRemetente: 1,
        tipoRemetente: 'psicologo',
        nomeRemetente: 'Dra. Ana Lima'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('CT02 - deve rejeitar envio com tipoRemetente psicologo por membro_equipe', async () => {
    const response = await request(app)
      .post('/api/comunicacao')
      .set('x-user-role', 'equipe')
      .send({
        titulo: 'Tentativa indevida',
        idAluno: aluno.idAluno,
        mensagem: 'Tentando se passar por psicologo.',
        tipo: 'informativo',
        idRemetente: 2,
        tipoRemetente: 'psicologo',
        nomeRemetente: 'Fulano'
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      'Apenas psicologos podem enviar notificacoes com remetente psicologo.'
    );
  });

  it('CT03 - deve permitir membro_equipe enviar notificacao com seu proprio tipoRemetente', async () => {
    const response = await request(app)
      .post('/api/comunicacao')
      .set('x-user-role', 'equipe')
      .send({
        titulo: 'Aviso de evento',
        idAluno: aluno.idAluno,
        mensagem: 'Tem um evento na proxima semana.',
        tipo: 'convite',
        idRemetente: 2,
        tipoRemetente: 'membro_equipe',
        nomeRemetente: 'Coordenacao'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('CT04 - deve rejeitar envio com tipoRemetente psicologo quando perfil nao for informado', async () => {
    const response = await request(app)
      .post('/api/comunicacao')
      .send({
        titulo: 'Acesso anonimo',
        idAluno: aluno.idAluno,
        mensagem: 'Tentativa sem cabecalho de perfil.',
        tipo: 'informativo',
        idRemetente: 3,
        tipoRemetente: 'psicologo',
        nomeRemetente: 'Anonimo'
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      'Apenas psicologos podem enviar notificacoes com remetente psicologo.'
    );
  });
});
