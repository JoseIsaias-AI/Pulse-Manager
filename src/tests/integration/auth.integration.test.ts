import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';

describe('Autenticacao por CPF', () => {
  let alunoRepository: Repository<Aluno>;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepository = AppDataSource.getRepository(Aluno);
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
      data: {
        cpf: '12345678900',
        nome: 'Nome Digitado',
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
      message: 'CPF nao encontrado.'
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
});
