import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';
import { SolicitacaoApoioPsicologico } from '../../backend/models/ApoioPsicologicoModel';
import { Psicologo } from '../../backend/models/usuarioModel';
import { expectErrorContract, expectSuccessContract } from '../helpers/responseContract';

describe('Solicitacao de apoio psicologico', () => {
  let alunoRepo: Repository<Aluno>;
  let psicologoRepo: Repository<Psicologo>;
  let solicitacaoRepo: Repository<SolicitacaoApoioPsicologico>;

  let aluno: Aluno;
  let outroAluno: Aluno;
  let psicologo: Psicologo;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepo = AppDataSource.getRepository(Aluno);
    psicologoRepo = AppDataSource.getRepository(Psicologo);
    solicitacaoRepo = AppDataSource.getRepository(SolicitacaoApoioPsicologico);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

    aluno = await alunoRepo.save({
      nome: 'Mariana Apoio',
      email: 'mariana.apoio@pulsemais.org',
      programa: 'Acolhimento',
      categoria: 'conectado',
      riscoEvasao: 'medio',
      engajamento: 55,
      dataIngresso: '2026-03-01',
      status: 'ativo'
    });

    outroAluno = await alunoRepo.save({
      nome: 'Outro Aluno',
      email: 'outro.aluno.apoio@pulsemais.org',
      programa: 'Acolhimento',
      categoria: 'capacitado',
      riscoEvasao: 'baixo',
      engajamento: 70,
      dataIngresso: '2026-03-02',
      status: 'ativo'
    });

    psicologo = await psicologoRepo.save({
      nomePsi: 'Dra. Apoio',
      email: 'dra.apoio@pulsemais.org',
      cargoPsi: 'psicologo'
    });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('deve criar solicitacao valida usando idAluno exclusivamente da sessao', async () => {
    const response = await request(app)
      .post('/api/apoio/solicitar')
      .set('x-user-id', String(aluno.idAluno))
      .set('x-user-role', 'aluno')
      .send({ mensagem: 'Preciso conversar com um psicologo sobre ansiedade.' });

    expect(response.status).toBe(201);
    expectSuccessContract(response.body);
    expect(response.body.message).toBe('Solicitacao de apoio psicologico criada com sucesso.');
    expect(response.body.data).toMatchObject({
      idAluno: aluno.idAluno,
      idPsicologo: psicologo.idPsi,
      mensagem: 'Preciso conversar com um psicologo sobre ansiedade.',
      status: 'pendente'
    });
    expect(response.body.data.idSolicitacao).toBeDefined();
    expect(response.body.data.dataCriacao).toBeTruthy();
  });

  it('deve retornar 400 para payload invalido', async () => {
    const response = await request(app)
      .post('/api/apoio/solicitar')
      .set('x-user-id', String(aluno.idAluno))
      .set('x-user-role', 'aluno')
      .send({ mensagem: 'curta' });

    expect(response.status).toBe(400);
    expectErrorContract(response.body);
    expect(response.body.message).toBe('O campo mensagem deve ter pelo menos 10 caracteres.');
  });

  it('deve impedir spoofing de idAluno no body', async () => {
    const response = await request(app)
      .post('/api/apoio/solicitar')
      .set('x-user-id', String(aluno.idAluno))
      .set('x-user-role', 'aluno')
      .send({
        idAluno: outroAluno.idAluno,
        mensagem: 'Tentando abrir solicitacao em nome de outro aluno.'
      });

    expect(response.status).toBe(400);
    expectErrorContract(response.body);
    expect(response.body.message).toBe('O campo idAluno deve vir exclusivamente da sessao.');
  });

  it('deve listar solicitacoes pendentes do psicologo autenticado', async () => {
    await solicitacaoRepo.save([
      {
        idAluno: aluno.idAluno,
        idPsicologo: psicologo.idPsi,
        mensagem: 'Solicitacao pendente para a Dra. Apoio.',
        status: 'pendente',
        dataCriacao: '2026-03-10T10:00:00.000Z'
      },
      {
        idAluno: outroAluno.idAluno,
        idPsicologo: psicologo.idPsi,
        mensagem: 'Solicitacao concluida nao deve aparecer.',
        status: 'concluida',
        dataCriacao: '2026-03-11T10:00:00.000Z'
      }
    ]);

    const response = await request(app)
      .get('/api/apoio/solicitacoes')
      .set('x-user-id', String(psicologo.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(200);
    expectSuccessContract(response.body);
    expect(response.body.message).toBe('Solicitacoes de apoio psicologico listadas com sucesso.');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      idAluno: aluno.idAluno,
      idPsicologo: psicologo.idPsi,
      nomeAluno: 'Mariana Apoio',
      emailAluno: 'mariana.apoio@pulsemais.org',
      status: 'pendente'
    });
  });
});
