import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../src/app';
import { AppDataSource, initializeDatabase } from '../../src/database/connection';
import { Aluno } from '../../src/models/alunoModel';
import { Psicologo } from '../../src/models/usuarioModel';

describe('UC-22 | Prontuarios de saude mental', () => {
  let alunoRepository: Repository<Aluno>;
  let psicologoRepository: Repository<Psicologo>;
  let aluno: Aluno;
  let psicologo: Psicologo;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepository = AppDataSource.getRepository(Aluno);
    psicologoRepository = AppDataSource.getRepository(Psicologo);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

    aluno = await alunoRepository.save({
      nome: 'Ana Souza',
      email: 'ana.souza@pulsemais.org',
      programa: 'Mentoria de permanencia',
      categoria: 'conectado',
      riscoEvasao: 'baixo',
      engajamento: 50,
      dataIngresso: '2026-01-01',
      status: 'ativo'
    });

    psicologo = await psicologoRepository.save({
      nomePsi: 'Dr. Carlos',
      cargoPsi: 'psicologo'
    });
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('deve criar prontuario quando o usuario for psicologo', async () => {
    const response = await request(app)
      .post('/api/prontuarios')
      .set('x-user-role', 'psicologo')
      .send({
        titulo: 'Acompanhamento inicial',
        observacao: 'Aluno apresenta melhora significativa no engajamento.',
        idAluno: aluno.idAluno,
        idPsi: psicologo.idPsi
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      titulo: 'Acompanhamento inicial',
      idAluno: aluno.idAluno,
      idPsi: psicologo.idPsi
    });
  });

  it('deve bloquear criacao quando o usuario nao for psicologo', async () => {
    const response = await request(app)
      .post('/api/prontuarios')
      .set('x-user-role', 'gestor')
      .send({
        titulo: 'Tentativa',
        observacao: 'Tentativa de registro nao autorizado.',
        idAluno: aluno.idAluno,
        idPsi: psicologo.idPsi
      });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Registros de saude mental sao restritos ao perfil psicologo.'
    });
  });

  it('deve validar campos obrigatorios', async () => {
    const response = await request(app)
      .post('/api/prontuarios')
      .set('x-user-role', 'psicologo')
      .send({
        idAluno: aluno.idAluno,
        idPsi: psicologo.idPsi
        // titulo e observacao ausentes
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('deve listar prontuarios com perfil psicologo', async () => {
    const response = await request(app)
      .get('/api/prontuarios')
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
