import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';
import { MembroEquipe, Psicologo } from '../../backend/models/usuarioModel';
import { expectErrorContract, expectSuccessContract } from '../helpers/responseContract';

describe('Autenticacao por email e nome', () => {
  let alunoRepository: Repository<Aluno>;
  let membroRepository: Repository<MembroEquipe>;
  let psicologoRepository: Repository<Psicologo>;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepository = AppDataSource.getRepository(Aluno);
    membroRepository = AppDataSource.getRepository(MembroEquipe);
    psicologoRepository = AppDataSource.getRepository(Psicologo);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

    await alunoRepository.save({
      codigoPm: 'PM-LOGIN-001',
      cpf: '12345678900',
      nome: 'Aluno Login',
      email: 'aluno.login@pulsemais.org',
      idade: 20,
      programa: 'Jornada de empregabilidade',
      categoria: 'conectado',
      riscoEvasao: 'baixo',
      engajamento: 80,
      dataIngresso: '2026-01-10',
      status: 'ativo'
    });

    await membroRepository.save({
      cpf: '98765432100',
      nome: 'Gestora Login',
      cargo: 'gestor',
      email: 'gestora.login@pulsemais.org'
    });

    await psicologoRepository.save({
      cpf: '11122233344',
      email: 'psicologa.login@pulsemais.org',
      nomePsi: 'Psicologa Login',
      cargoPsi: 'psicologo'
    });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('deve permitir login quando email e nome existem no banco', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'aluno.login@pulsemais.org',
      nome: 'Aluno Login',
      perfil: 'aluno'
    });

    expect(response.status).toBe(200);
    expectSuccessContract(response.body);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Login realizado com sucesso.',
      data: {
        email: 'aluno.login@pulsemais.org',
        nome: 'Aluno Login',
        perfil: 'aluno',
        codigoPm: 'PM-LOGIN-001'
      }
    });
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.idAluno).toBe(response.body.data.id);
  });

  it('deve negar login quando o email nao existe no banco', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'inexistente@pulsemais.org',
      nome: 'Aluno Login',
      perfil: 'aluno'
    });

    expect(response.status).toBe(404);
    expectErrorContract(response.body);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Usuario nao encontrado.'
    });
  });

  it('deve rejeitar email invalido', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'email-invalido',
      nome: 'Aluno Login',
      perfil: 'aluno'
    });

    expect(response.status).toBe(400);
    expectErrorContract(response.body);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Email invalido.'
    });
  });

  it('deve permitir login de psicologo cadastrado com esse perfil', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'psicologa.login@pulsemais.org',
      nome: 'Psicologa Login',
      perfil: 'psicologo'
    });

    expect(response.status).toBe(200);
    expectSuccessContract(response.body);
    expect(response.body.data).toMatchObject({
      email: 'psicologa.login@pulsemais.org',
      nome: 'Psicologa Login',
      perfil: 'psicologo',
      codigoPm: null
    });
  });

  it('deve permitir login de membro cadastrado como gestor', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'gestora.login@pulsemais.org',
      nome: 'Gestora Login',
      perfil: 'gestor'
    });

    expect(response.status).toBe(200);
    expectSuccessContract(response.body);
    expect(response.body.data).toMatchObject({
      email: 'gestora.login@pulsemais.org',
      nome: 'Gestora Login',
      perfil: 'gestor',
      codigoPm: null
    });
  });

  it('deve negar email existente quando o perfil selecionado nao pertence ao usuario', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'aluno.login@pulsemais.org',
      nome: 'Aluno Login',
      perfil: 'psicologo'
    });

    expect(response.status).toBe(403);
    expectErrorContract(response.body);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Perfil informado nao corresponde ao cadastro do usuario.'
    });
  });

  it('deve permitir login por email e perfil mesmo quando o nome digitado diverge', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'aluno.login@pulsemais.org',
      nome: 'Outro Nome',
      perfil: 'aluno'
    });

    expect(response.status).toBe(200);
    expectSuccessContract(response.body);
    expect(response.body.data).toMatchObject({
      email: 'aluno.login@pulsemais.org',
      nome: 'Aluno Login',
      perfil: 'aluno'
    });
  });

  it('deve rejeitar perfil fora das opcoes da tela', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'aluno.login@pulsemais.org',
      nome: 'Aluno Login',
      perfil: 'administrador'
    });

    expect(response.status).toBe(400);
    expectErrorContract(response.body);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Perfil invalido.'
    });
  });
});
