import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { Agenda } from '../../backend/models/AgendaModel';
import { MembroEquipe } from '../../backend/models/usuarioModel';
import { expectErrorContract, expectSuccessContract } from '../helpers/responseContract';

describe('RF020/RF021 - Gestao de Agenda', () => {
  let alunoRepository: Repository<Aluno>;
  let agendaRepository: Repository<Agenda>;
  let membroRepository: Repository<MembroEquipe>;
  let aluno: Aluno;
  let membro: MembroEquipe;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
    agendaRepository = getIntegrationRepository(Agenda);
    membroRepository = getIntegrationRepository(MembroEquipe);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    aluno = await alunoRepository.save({
      nome: 'Pedro Alves',
      email: 'pedro.alves@pulsemais.org',
      programa: 'Mentoria de permanencia',
      categoria: 'conectado',
      riscoEvasao: 'baixo',
      engajamento: 50,
      dataIngresso: '2026-01-10',
      status: 'ativo'
    });

    membro = await membroRepository.save({
      nome: 'Coordenador Teste',
      cargo: 'coordenador',
      email: 'coordenador@pulsemais.org'
    });
  });

  afterAll(teardownIntegrationDatabase);

  describe('RF020 - Listar agenda', () => {
    it('CT01 - deve listar agenda vazia inicialmente', async () => {
      const response = await request(app).get('/api/agenda');

      expect(response.status).toBe(200);
      expectSuccessContract(response.body);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('CT02 - deve listar agenda com itens apos criacao', async () => {
      await agendaRepository.save({
        tipoUser: 'aluno',
        registro: 'Sessao de mentoria',
        data: '2026-04-10',
        horaInicio: '09:00',
        horaFim: '10:00',
        status: 1,
        idMembro: membro.idMembro,
        idAluno: aluno.idAluno
      });

      const response = await request(app).get('/api/agenda');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        tipoUser: 'aluno',
        registro: 'Sessao de mentoria'
      });
    });

    it('CT03 - deve filtrar agenda por idAluno', async () => {
      await agendaRepository.save([
        {
          tipoUser: 'aluno',
          registro: 'Evento para Pedro',
          data: '2026-04-10',
          status: 1,
          idMembro: membro.idMembro,
          idAluno: aluno.idAluno
        },
        {
          tipoUser: 'membro_equipe',
          registro: 'Evento para outro aluno',
          data: '2026-04-11',
          status: 1,
          idMembro: membro.idMembro,
          idAluno: 999
        }
      ]);

      const response = await request(app).get(`/api/agenda?idAluno=${aluno.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].registro).toBe('Evento para Pedro');
    });

    it('CT04 - deve rejeitar dataInicio no formato invalido', async () => {
      const response = await request(app).get('/api/agenda?dataInicio=10-04-2026');

      expect(response.status).toBe(400);
      expectErrorContract(response.body);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo dataInicio deve estar no formato YYYY-MM-DD.'
      });
    });

    it('CT05 - deve rejeitar dataFim anterior a dataInicio', async () => {
      const response = await request(app).get('/api/agenda?dataInicio=2026-04-10&dataFim=2026-04-01');

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'A dataFim nao pode ser anterior a dataInicio.'
      });
    });
  });

  describe('RF021 - Criar item na agenda (RN019)', () => {
    it('CT01 - deve criar item de agenda com perfil gestor (RN019)', async () => {
      const response = await request(app)
        .post('/api/agenda')
        .set('x-user-role', 'gestor')
        .send({
          tipoUser: 'aluno',
          registro: 'Reuniao de acompanhamento',
          data: '2026-04-15',
          horaInicio: '14:00',
          horaFim: '15:00',
          idMembro: membro.idMembro,
          idAluno: aluno.idAluno
        });

      expect(response.status).toBe(201);
      expectSuccessContract(response.body);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        tipoUser: 'aluno',
        registro: 'Reuniao de acompanhamento',
        data: '2026-04-15',
        idAluno: aluno.idAluno
      });
    });

    it('CT02 - deve rejeitar criacao sem perfil gestor (RN019)', async () => {
      const response = await request(app)
        .post('/api/agenda')
        .send({
          tipoUser: 'aluno',
          registro: 'Reuniao sem permissao',
          data: '2026-04-15',
          idMembro: membro.idMembro,
          idAluno: aluno.idAluno
        });

      expect(response.status).toBe(422);
      expectErrorContract(response.body);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Apenas usuarios com perfil gestor podem modificar a agenda.'
      });
    });

    it('CT03 - deve rejeitar tipoUser invalido', async () => {
      const response = await request(app)
        .post('/api/agenda')
        .set('x-user-role', 'gestor')
        .send({
          tipoUser: 'invalido',
          registro: 'Registro com tipo errado',
          data: '2026-04-15',
          idMembro: membro.idMembro,
          idAluno: aluno.idAluno
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo tipoUser deve ser aluno ou membro_equipe.'
      });
    });

    it('CT04 - deve rejeitar data no formato invalido', async () => {
      const response = await request(app)
        .post('/api/agenda')
        .set('x-user-role', 'gestor')
        .send({
          tipoUser: 'aluno',
          registro: 'Registro com data errada',
          data: '15/04/2026',
          idMembro: membro.idMembro,
          idAluno: aluno.idAluno
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo data deve estar no formato YYYY-MM-DD.'
      });
    });
  });

  describe('RF021 - Atualizar e cancelar item de agenda (RN019)', () => {
    let itemAgenda: Agenda;

    beforeEach(async () => {
      itemAgenda = await agendaRepository.save({
        tipoUser: 'aluno',
        registro: 'Item original',
        data: '2026-04-20',
        status: 1,
        idMembro: membro.idMembro,
        idAluno: aluno.idAluno
      });
    });

    it('CT01 - deve atualizar item de agenda com perfil gestor', async () => {
      const response = await request(app)
        .patch(`/api/agenda/${itemAgenda.idAgenda}`)
        .set('x-user-role', 'gestor')
        .send({ registro: 'Item atualizado' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.registro).toBe('Item atualizado');
    });

    it('CT02 - deve retornar 404 ao atualizar item inexistente', async () => {
      const response = await request(app)
        .patch('/api/agenda/9999')
        .set('x-user-role', 'gestor')
        .send({ registro: 'Atualizacao de inexistente' });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Item de agenda nao encontrado.'
      });
    });

    it('CT03 - deve cancelar item de agenda com perfil gestor', async () => {
      const response = await request(app)
        .delete(`/api/agenda/${itemAgenda.idAgenda}`)
        .set('x-user-role', 'gestor');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(0);
    });

    it('CT04 - deve retornar 404 ao cancelar item inexistente', async () => {
      const response = await request(app)
        .delete('/api/agenda/9999')
        .set('x-user-role', 'gestor');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Item de agenda nao encontrado.'
      });
    });

    it('CT05 - deve rejeitar atualizacao sem perfil gestor (RN019)', async () => {
      const response = await request(app)
        .patch(`/api/agenda/${itemAgenda.idAgenda}`)
        .send({ registro: 'Tentativa sem permissao' });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Apenas usuarios com perfil gestor podem modificar a agenda.'
      });
    });

    it('CT06 - deve rejeitar cancelamento sem perfil gestor (RN019)', async () => {
      const response = await request(app)
        .delete(`/api/agenda/${itemAgenda.idAgenda}`);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Apenas usuarios com perfil gestor podem modificar a agenda.'
      });
    });

    it('CT07 - deve retornar 400 para idAgenda invalido no patch', async () => {
      const response = await request(app)
        .patch('/api/agenda/abc')
        .set('x-user-role', 'gestor')
        .send({ registro: 'Qualquer valor' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo idAgenda deve ser um numero inteiro positivo.'
      });
    });
  });

  describe('RNF - Qualidade para agenda', () => {
    performanceIt('RNF-DES - deve responder listagem da agenda em ate 1000ms', async () => {
      const inicio = Date.now();
      const response = await request(app).get('/api/agenda');
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1000);
    });

    it('RNF-SEG - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app)
        .post('/api/agenda')
        .send({ tipoUser: 'aluno', registro: 'Sem permissao', data: '2026-04-15', idMembro: 1, idAluno: 1 });

      expect(response.status).toBe(422);
      expect(response.body.stack).toBeUndefined();
    });
  });
});
