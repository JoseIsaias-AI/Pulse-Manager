import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../app';
import { AppDataSource, initializeDatabase } from '../database/connection';
import { Aluno } from '../models/alunoModel';

describe('UC-24 - Restrição de remetente psicólogo em notificações', () => {
  let alunoRepository: Repository<Aluno>;
  let aluno: Aluno;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepository = AppDataSource.getRepository(Aluno);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

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

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('CT01 - psicologo pode enviar notificacao com tipoRemetente psicologo', async () => {
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

  it('CT02 - membro_equipe nao pode enviar notificacao com tipoRemetente psicologo', async () => {
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

  it('CT03 - membro_equipe pode enviar notificacao com seu proprio tipoRemetente', async () => {
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

  it('CT04 - requisicao sem perfil informado nao pode enviar com tipoRemetente psicologo', async () => {
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
