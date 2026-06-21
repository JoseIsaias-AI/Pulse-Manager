import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';
import { MembroEquipe, Psicologo } from '../../backend/models/usuarioModel';

describe('Autenticacao por CPF', () => {
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
      nomePsi: 'Psicologa Login',
      cargoPsi: 'psicologo'
    });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('deve permitir login quando o CPF existe no banco', async () => {
    const response = await request(app).post('/api/auth/login').send({
      cpf: '123.456.789-00',
      nome: 'Nome Digitado',
      perfil: 'aluno'
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Login realizado com sucesso.',
      data: {
        cpf: '12345678900',
        nome: 'Aluno Login',
        perfil: 'aluno'
      }
    });
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.idAluno).toBe(response.body.data.id);
  });

  it('deve negar login quando o CPF nao existe no banco', async () => {
    const response = await request(app).post('/api/auth/login').send({
      cpf: '00000000000',
      nome: 'Nome Digitado',
      perfil: 'aluno'
    });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Usuario nao encontrado para o perfil informado.'
    });
  });

  it('deve rejeitar CPF invalido', async () => {
    const response = await request(app).post('/api/auth/login').send({
      cpf: '123',
      nome: 'Nome Digitado',
      perfil: 'aluno'
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'CPF invalido.'
    });
  });

  it('deve permitir login de psicologo cadastrado com esse perfil', async () => {
    const response = await request(app).post('/api/auth/login').send({
      cpf: '11122233344',
      nome: 'Nome Digitado',
      perfil: 'psicologo'
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      cpf: '11122233344',
      nome: 'Psicologa Login',
      perfil: 'psicologo'
    });
  });

  it('deve permitir login de membro cadastrado como gestor', async () => {
    const response = await request(app).post('/api/auth/login').send({
      cpf: '98765432100',
      nome: 'Nome Digitado',
      perfil: 'gestor'
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      cpf: '98765432100',
      nome: 'Gestora Login',
      perfil: 'gestor'
    });
  });

  it('deve negar CPF existente quando o perfil selecionado nao pertence ao usuario', async () => {
    const response = await request(app).post('/api/auth/login').send({
      cpf: '12345678900',
      nome: 'Nome Digitado',
      perfil: 'psicologo'
    });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Usuario nao encontrado para o perfil informado.'
    });
  });

  it('deve rejeitar perfil fora das opcoes da tela', async () => {
    const response = await request(app).post('/api/auth/login').send({
      cpf: '12345678900',
      nome: 'Nome Digitado',
      perfil: 'administrador'
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Perfil invalido.'
    });
  });
});
