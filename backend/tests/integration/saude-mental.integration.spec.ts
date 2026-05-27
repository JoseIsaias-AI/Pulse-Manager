import request from 'supertest';
import { app } from '../../src/app';
import * as repository from '../../src/repositories/saudeMentalRepository';

jest.mock('../../src/repositories/saudeMentalRepository', () => ({
  alunoExiste: jest.fn(),
  psicologoExiste: jest.fn(),
  criarProntuario: jest.fn(),
  listarPorPsicologo: jest.fn(),
}));

const repoMock = jest.mocked(repository);

describe('UC-22 | Prontuarios de saude mental', () => {
  beforeEach(() => {
    repoMock.alunoExiste.mockResolvedValue(true);
    repoMock.psicologoExiste.mockResolvedValue(true);
  });

  it('deve criar prontuario quando o usuario for psicologo', async () => {
    repoMock.criarProntuario.mockResolvedValue({
      id_historico: 1,
      observacao: 'Aluno apresenta melhora significativa.',
      titulo: 'acompanhamento',
      id_aluno: 1,
      id_psi: 1,
    });

    const response = await request(app)
      .post('/api/prontuarios')
      .set('x-eh-psicologo', 'true')
      .send({
        observacao: 'Aluno apresenta melhora significativa.',
        classificacao: 'acompanhamento',
        id_aluno: 1,
        id_psicologo: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_historico', 1);
    expect(repoMock.criarProntuario).toHaveBeenCalledWith({
      observacao: 'Aluno apresenta melhora significativa.',
      titulo: 'acompanhamento',
      id_aluno: 1,
      id_psi: 1,
    });
  });

  it('deve bloquear criacao quando o usuario nao for psicologo', async () => {
    const response = await request(app)
      .post('/api/prontuarios')
      .set('x-eh-psicologo', 'false')
      .send({
        observacao: 'Tentativa de registro',
        classificacao: 'acompanhamento',
        id_aluno: 1,
        id_psicologo: 1,
      });

    expect(response.status).toBe(403);
    expect(response.body.erro).toBe('Apenas psicologos podem acessar registros de saude mental');
  });

  it('deve validar campos obrigatorios', async () => {
    const response = await request(app)
      .post('/api/prontuarios')
      .set('x-eh-psicologo', 'true')
      .send({
        classificacao: 'acompanhamento',
        id_aluno: 1,
        id_psicologo: 1,
      });

    expect(response.status).toBe(400);
    expect(response.body.erro).toContain('Campos obrigatorios');
  });

  it('deve listar prontuarios do psicologo', async () => {
    repoMock.listarPorPsicologo.mockResolvedValue([
      {
        id_historico: 1,
        observacao: 'Sessao realizada',
        titulo: 'Acompanhamento inicial',
        id_aluno: 1,
        id_psi: 1,
        aluno_nome: 'Ana Souza',
        aluno_email: 'ana.souza@email.com',
      },
    ]);

    const response = await request(app)
      .get('/api/prontuarios?id_psi=1')
      .set('x-eh-psicologo', 'true');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('aluno_nome', 'Ana Souza');
  });
});
