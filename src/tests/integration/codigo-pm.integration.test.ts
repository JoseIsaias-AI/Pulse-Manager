import request from 'supertest';
import { app } from '../../backend/app';
import { resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';

describe('UC-05 - RN001: Geracao de codigo PM-AAAA-NNN com sequencial anual', () => {
  beforeAll(async () => {
    await setupIntegrationDatabase();
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();
  });

  afterAll(teardownIntegrationDatabase);

  it('CT01 - deve atribuir sequencial 001 ao primeiro aluno do ano', async () => {
    const response = await request(app).post('/api/alunos').send({
      nome: 'Alice Primeiro',
      email: 'alice.primeiro@pulsemais.org',
      dataIngresso: '2026-01-10',
      programa: 'Jornada',
      categoria: 'conectado',
      riscoEvasao: 'baixo'
    });

    expect(response.status).toBe(201);
    expect(response.body.data.codigoPm).toBe('PM-2026-001');
  });

  it('CT02 - deve atribuir sequencial 002 ao segundo aluno do mesmo ano', async () => {
    await request(app).post('/api/alunos').send({
      nome: 'Alice Primeiro',
      email: 'alice.primeiro@pulsemais.org',
      dataIngresso: '2026-03-01',
      programa: 'Jornada',
      categoria: 'conectado',
      riscoEvasao: 'baixo'
    });

    const response = await request(app).post('/api/alunos').send({
      nome: 'Bruno Segundo',
      email: 'bruno.segundo@pulsemais.org',
      dataIngresso: '2026-05-15',
      programa: 'Mentoria',
      categoria: 'capacitado',
      riscoEvasao: 'medio'
    });

    expect(response.status).toBe(201);
    expect(response.body.data.codigoPm).toBe('PM-2026-002');
  });

  it('CT03 - deve reiniciar sequencial em 001 para o primeiro aluno de um novo ano', async () => {
    await request(app).post('/api/alunos').send({
      nome: 'Alice Ano Atual',
      email: 'alice.2026@pulsemais.org',
      dataIngresso: '2026-06-01',
      programa: 'Jornada',
      categoria: 'conectado',
      riscoEvasao: 'baixo'
    });

    await request(app).post('/api/alunos').send({
      nome: 'Bruno Ano Atual',
      email: 'bruno.2026@pulsemais.org',
      dataIngresso: '2026-08-01',
      programa: 'Mentoria',
      categoria: 'capacitado',
      riscoEvasao: 'medio'
    });

    const response = await request(app).post('/api/alunos').send({
      nome: 'Carlos Ano Seguinte',
      email: 'carlos.2027@pulsemais.org',
      dataIngresso: '2027-01-15',
      programa: 'Jornada',
      categoria: 'conectado',
      riscoEvasao: 'baixo'
    });

    expect(response.status).toBe(201);
    expect(response.body.data.codigoPm).toBe('PM-2027-001');
  });

  it('CT04 - deve gerar codigo no formato PM-YYYY-NNN', async () => {
    const response = await request(app).post('/api/alunos').send({
      nome: 'Formato Teste',
      email: 'formato.teste@pulsemais.org',
      dataIngresso: '2025-11-20',
      programa: 'Jornada',
      categoria: 'conectado',
      riscoEvasao: 'baixo'
    });

    expect(response.status).toBe(201);
    expect(response.body.data.codigoPm).toMatch(/^PM-\d{4}-\d{3}$/);
  });
});
