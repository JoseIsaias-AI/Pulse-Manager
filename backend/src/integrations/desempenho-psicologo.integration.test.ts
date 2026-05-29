import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../src/app';
import { AppDataSource, initializeDatabase } from '../../src/database/connection';
import { Aluno } from '../../src/models/alunoModel';
import { Atividade } from '../../src/models/atividadeModel';
import { Participacao } from '../../src/models/participacaoModel';
import { HistoricoPsicologico } from '../../src/models/SaudeMentalModel';
import { Psicologo } from '../../src/models/UsuarioModel';

describe('UC-23 - Acessar desempenho acadêmico dos alunos (Psicólogo)', () => {
  let alunoRepo: Repository<Aluno>;
  let psicologoRepo: Repository<Psicologo>;
  let atividadeRepo: Repository<Atividade>;
  let participacaoRepo: Repository<Participacao>;
  let historicoRepo: Repository<HistoricoPsicologico>;

  let aluno: Aluno;
  let psicologo: Psicologo;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepo = AppDataSource.getRepository(Aluno);
    psicologoRepo = AppDataSource.getRepository(Psicologo);
    atividadeRepo = AppDataSource.getRepository(Atividade);
    participacaoRepo = AppDataSource.getRepository(Participacao);
    historicoRepo = AppDataSource.getRepository(HistoricoPsicologico);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

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

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('CT01 - psicologo com vinculo acessa desempenho do aluno com dados corretos', async () => {
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

  it('CT02 - psicologo sem vinculo e impedido de acessar desempenho do aluno', async () => {
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

  it('CT03 - perfil nao-psicologo e bloqueado pela verificacao de permissao', async () => {
    const response = await request(app)
      .get(`/api/psicologo/alunos/${aluno.idAluno}/desempenho`)
      .set('x-user-id', '1')
      .set('x-user-role', 'gestor');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Perfil sem permissao para executar esta acao.');
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
});
