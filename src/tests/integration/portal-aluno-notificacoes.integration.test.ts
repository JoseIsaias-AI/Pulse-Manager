import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { Aluno } from '../../backend/models/alunoModel';
import { Notificacao, Oportunidade } from '../../backend/models/NotificacaoModel';

describe('UC-03 - Visualizar notificacoes e oportunidades no portal do aluno', () => {
  let alunoRepository: Repository<Aluno>;
  let notificacaoRepository: Repository<Notificacao>;
  let oportunidadeRepository: Repository<Oportunidade>;
  let aluno: Aluno;
  let outroAluno: Aluno;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
    notificacaoRepository = getIntegrationRepository(Notificacao);
    oportunidadeRepository = getIntegrationRepository(Oportunidade);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    aluno = await alunoRepository.save({
      nome: 'Marina Silva',
      email: 'marina.silva@pulsemais.org',
      programa: 'Jornada de empregabilidade',
      categoria: 'capacitado',
      riscoEvasao: 'baixo',
      engajamento: 80,
      dataIngresso: '2026-01-01',
      status: 'ativo'
    });

    outroAluno = await alunoRepository.save({
      nome: 'Pedro Souza',
      email: 'pedro.souza@pulsemais.org',
      programa: 'Mentoria',
      categoria: 'conectado',
      riscoEvasao: 'baixo',
      engajamento: 60,
      dataIngresso: '2026-02-01',
      status: 'ativo'
    });

    await notificacaoRepository.save({
      titulo: 'Sessao agendada',
      idAluno: aluno.idAluno,
      mensagem: 'Sua sessao esta marcada para amanha.',
      tipo: 'informativo',
      idRemetente: 1,
      tipoRemetente: 'membro_equipe',
      nomeRemetente: 'Equipe'
    });

    await oportunidadeRepository.save({
      titulo: 'Vaga de estagio',
      descricao: 'Oportunidade em TI.',
      tipo: 'estagio',
      idMembro: 1
    });
  });

  afterAll(teardownIntegrationDatabase);

  it('CT01 - deve exibir apenas as notificacoes do proprio aluno autenticado', async () => {
    const response = await request(app)
      .get(`/api/portal/alunos/${aluno.idAluno}/notificacoes`)
      .set('x-user-id', String(aluno.idAluno));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].idAluno).toBe(aluno.idAluno);
    expect(response.body.data[0].titulo).toBe('Sessao agendada');
  });

  it('CT02 - deve rejeitar acesso a notificacoes de outro aluno', async () => {
    const response = await request(app)
      .get(`/api/portal/alunos/${outroAluno.idAluno}/notificacoes`)
      .set('x-user-id', String(aluno.idAluno));

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      'Acesso negado: voce so pode visualizar os seus proprios dados.'
    );
  });

  it('CT03 - deve listar oportunidades disponiveis para aluno autenticado', async () => {
    const response = await request(app)
      .get('/api/portal/oportunidades')
      .set('x-user-id', String(aluno.idAluno));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].titulo).toBe('Vaga de estagio');
  });

  it('CT04 - deve retornar 400 para idAluno invalido na rota de notificacoes', async () => {
    const response = await request(app)
      .get('/api/portal/alunos/abc/notificacoes')
      .set('x-user-id', '1');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('O campo idAluno deve ser um numero inteiro positivo.');
  });

  it('CT05 - deve retornar 404 quando aluno nao existe', async () => {
    const response = await request(app)
      .get('/api/portal/alunos/9999/notificacoes')
      .set('x-user-id', '9999');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Aluno nao encontrado no portal.');
  });
});
