import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { Aluno } from '../../backend/models/alunoModel';
import { Atividade } from '../../backend/models/atividadeModel';
import { Participacao } from '../../backend/models/participacaoModel';
import { HistoricoPsicologico } from '../../backend/models/SaudeMentalModel';
import { Psicologo } from '../../backend/models/usuarioModel';

describe('UC-23 - Acessar desempenho academico dos alunos (Psicologo)', () => {
  let alunoRepo: Repository<Aluno>;
  let psicologoRepo: Repository<Psicologo>;
  let atividadeRepo: Repository<Atividade>;
  let participacaoRepo: Repository<Participacao>;
  let historicoRepo: Repository<HistoricoPsicologico>;

  let aluno: Aluno;
  let psicologo: Psicologo;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepo = getIntegrationRepository(Aluno);
    psicologoRepo = getIntegrationRepository(Psicologo);
    atividadeRepo = getIntegrationRepository(Atividade);
    participacaoRepo = getIntegrationRepository(Participacao);
    historicoRepo = getIntegrationRepository(HistoricoPsicologico);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    psicologo = await psicologoRepo.save({
      nomePsi: 'Dra. Carla Mendes',
      cargoPsi: 'psicologo'
    });

    aluno = await alunoRepo.save({
      nome: 'Lucas Ramos',
      email: 'lucas.ramos@pulsemais.org',
      programa: 'Jornada de empregabilidade',
      categoria: 'capacitado',
      riscoEvasao: 'baixo',
      engajamento: 75,
      dataIngresso: '2026-01-10',
      status: 'ativo'
    });

    await historicoRepo.save({
      titulo: 'Acompanhamento inicial',
      observacao: 'Aluno demonstra boa evolucao.',
      idAluno: aluno.idAluno,
      idPsi: psicologo.idPsi
    });

    const atividade = await atividadeRepo.save({
      titulo: 'Aula de logica de programacao',
      tipo: 'aula',
      data: '2026-02-10'
    });

    await participacaoRepo.save({
      idAluno: aluno.idAluno,
      idAtividade: atividade.idAtividade,
      dataPart: '2026-02-10',
      statusPart: true,
      nota: 8.5
    });
  });

  afterAll(teardownIntegrationDatabase);

  it('CT01 - deve retornar desempenho do aluno para psicologo com vinculo', async () => {
    const response = await request(app)
      .get(`/api/psicologo/alunos/${aluno.idAluno}/desempenho`)
      .set('x-user-id', String(psicologo.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.idAluno).toBe(aluno.idAluno);
    expect(response.body.data.nomeAluno).toBe('Lucas Ramos');
    expect(Array.isArray(response.body.data.participacoes)).toBe(true);
    expect(response.body.data.participacoes.length).toBe(1);
    expect(response.body.data.participacoes[0].statusPart).toBe(true);
    expect(response.body.data.resumo.totalParticipacoes).toBe(1);
    expect(response.body.data.resumo.presencas).toBe(1);
    expect(response.body.data.resumo.mediaNotas).toBe(8.5);
  });

  it('CT02 - deve rejeitar acesso de psicologo sem vinculo com o aluno', async () => {
    const outroPsi = await psicologoRepo.save({
      nomePsi: 'Dr. Marcos Lima',
      cargoPsi: 'psicologo'
    });

    const response = await request(app)
      .get(`/api/psicologo/alunos/${aluno.idAluno}/desempenho`)
      .set('x-user-id', String(outroPsi.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Psicologo nao possui vinculo com este aluno.');
  });

  it('CT03 - deve bloquear acesso para perfil nao autorizado como psicologo', async () => {
    const response = await request(app)
      .get(`/api/psicologo/alunos/${aluno.idAluno}/desempenho`)
      .set('x-user-id', '1')
      .set('x-user-role', 'gestor');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Acesso nao permitido para este perfil.');
  });

  it('CT04 - deve retornar 400 para idAluno invalido', async () => {
    const response = await request(app)
      .get('/api/psicologo/alunos/abc/desempenho')
      .set('x-user-id', String(psicologo.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('O campo idAluno deve ser um numero inteiro positivo.');
  });

  it('CT05 - deve retornar 404 quando aluno nao existe', async () => {
    const response = await request(app)
      .get('/api/psicologo/alunos/9999/desempenho')
      .set('x-user-id', String(psicologo.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Aluno nao encontrado.');
  });
});
