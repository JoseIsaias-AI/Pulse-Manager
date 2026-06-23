import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { getIntegrationRepository, resetIntegrationDatabase, setupIntegrationDatabase, teardownIntegrationDatabase } from '../helpers/databaseTestHelper';
import { performanceIt } from '../helpers/performanceTest';
import { Aluno } from '../../backend/models/alunoModel';
import { Atividade } from '../../backend/models/atividadeModel';
import { Participacao } from '../../backend/models/participacaoModel';
import { AnotacaoQualitativa } from '../../backend/models/anotacaoQualitativaModel';
import { expectErrorContract } from '../helpers/responseContract';

describe('UC-07 a UC-12 - Jornada do aluno', () => {
  let alunoRepository: Repository<Aluno>;
  let atividadeRepository: Repository<Atividade>;
  let participacaoRepository: Repository<Participacao>;
  let anotacaoRepository: Repository<AnotacaoQualitativa>;

  let alunoMaria: Aluno;
  let alunoJoao: Aluno;
  let aulaLogica: Atividade;
  let aulaProjeto: Atividade;
  let eventoCarreira: Atividade;
  let eventoDemoDay: Atividade;

  beforeAll(async () => {
    await setupIntegrationDatabase();
    alunoRepository = getIntegrationRepository(Aluno);
    atividadeRepository = getIntegrationRepository(Atividade);
    participacaoRepository = getIntegrationRepository(Participacao);
    anotacaoRepository = getIntegrationRepository(AnotacaoQualitativa);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase();

    [alunoMaria, alunoJoao] = await alunoRepository.save([
      {
        nome: 'Maria Silva',
        email: 'maria.silva@pulsemais.org',
        idade: 19,
        genero: 'feminino',
        ocupacao: 'estudante',
        escolaridade: 'ensino_medio',
        programa: 'Mentoria de permanencia',
        categoria: 'conectado',
        riscoEvasao: 'alto',
        engajamento: 42,
        dataIngresso: '2026-02-10',
        status: 'em_acompanhamento'
      },
      {
        nome: 'Joao Pereira',
        email: 'joao.pereira@pulsemais.org',
        idade: 21,
        genero: 'masculino',
        ocupacao: 'buscando_emprego',
        escolaridade: 'ensino_medio',
        programa: 'Jornada de empregabilidade',
        categoria: 'capacitado',
        riscoEvasao: 'baixo',
        engajamento: 88,
        dataIngresso: '2026-02-12',
        status: 'ativo'
      }
    ]);

    [aulaLogica, aulaProjeto, eventoCarreira, eventoDemoDay] = await atividadeRepository.save([
      {
        titulo: 'Aula de logica',
        tipo: 'aula',
        descricao: 'Fundamentos de logica',
        data: '2026-03-10'
      },
      {
        titulo: 'Aula de projeto',
        tipo: 'aula',
        descricao: 'Projeto aplicado',
        data: '2026-03-20'
      },
      {
        titulo: 'Evento de carreira',
        tipo: 'evento',
        descricao: 'Encontro com recrutadores',
        data: '2026-03-15'
      },
      {
        titulo: 'Demo Day',
        tipo: 'evento',
        descricao: 'Apresentacoes finais',
        data: '2026-03-25'
      }
    ]);
  });

  afterAll(teardownIntegrationDatabase);

  describe('UC-07 - Manter jornada do aluno', () => {
    it('CT01 - deve consolidar jornada do aluno com frequencias, eventos e anotacoes', async () => {
      await participacaoRepository.save([
        {
          idAluno: alunoMaria.idAluno,
          idAtividade: aulaLogica.idAtividade,
          dataPart: '2026-03-10',
          statusPart: true,
          nota: 8.5
        },
        {
          idAluno: alunoMaria.idAluno,
          idAtividade: eventoCarreira.idAtividade,
          dataPart: '2026-03-15',
          statusPart: true,
          nota: null
        }
      ]);

      await anotacaoRepository.save({
        idAluno: alunoMaria.idAluno,
        titulo: 'Evolucao na comunicacao',
        descricao: 'Demonstrou melhora no trabalho em equipe.',
        autor: 'Equipe Pedagogica',
        dataRegistro: '2026-03-16'
      });

      const response = await request(app).get(`/api/jornada/alunos/${alunoMaria.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.aluno.nome).toBe('Maria Silva');
      expect(response.body.data.frequencias.length).toBe(1);
      expect(response.body.data.participacoesEventos.length).toBe(1);
      expect(response.body.data.anotacoesQualitativas.length).toBe(1);
    });

    it('CT02 - deve retornar 404 quando aluno nao existe', async () => {
      const response = await request(app).get('/api/jornada/alunos/9999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado para consolidacao da jornada.'
      });
    });

    it('CT03 - deve retornar 400 para idAluno invalido', async () => {
      const response = await request(app).get('/api/jornada/alunos/abc');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O parametro idAluno deve ser um numero inteiro positivo.'
      });
    });

    it('CT04 - deve retornar jornada vazia de registros quando nao ha participacoes', async () => {
      const response = await request(app).get(`/api/jornada/alunos/${alunoJoao.idAluno}`);

      expect(response.status).toBe(200);
      expect(response.body.data.frequencias).toEqual([]);
      expect(response.body.data.participacoesEventos).toEqual([]);
      expect(response.body.data.anotacoesQualitativas).toEqual([]);
    });
  });

  describe('UC-08 - Registrar frequencia em aulas', () => {
    it('CT01 - deve registrar frequencia para atividade do tipo aula', async () => {
      const response = await request(app).post('/api/frequencias').send({
        idAluno: alunoMaria.idAluno,
        idAtividade: aulaLogica.idAtividade,
        statusPart: true,
        nota: 9.0,
        dataPart: '2026-03-10'
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.operacao).toBe('criado');
      expect(response.body.data.registro).toMatchObject({
        idAluno: alunoMaria.idAluno,
        idAtividade: aulaLogica.idAtividade
      });

      const alunoAtualizado = await alunoRepository.findOneByOrFail({ idAluno: alunoMaria.idAluno });
      expect(alunoAtualizado.probabilidadeEvasao).not.toBeNull();
      expect(alunoAtualizado.riscoEvasao).toBe('baixo');
    });

    it('CT02 - deve atualizar frequencia existente para mesma aula', async () => {
      await request(app).post('/api/frequencias').send({
        idAluno: alunoMaria.idAluno,
        idAtividade: aulaProjeto.idAtividade,
        statusPart: false,
        nota: 6.5,
        dataPart: '2026-03-20'
      });

      const response = await request(app).post('/api/frequencias').send({
        idAluno: alunoMaria.idAluno,
        idAtividade: aulaProjeto.idAtividade,
        statusPart: true,
        nota: 8.0,
        dataPart: '2026-03-20'
      });

      expect(response.status).toBe(200);
      expect(response.body.data.operacao).toBe('atualizado');
      expect(response.body.data.registro.statusPart).toBe(true);
      expect(Number(response.body.data.registro.nota)).toBe(8);
    });

    it('CT03 - deve rejeitar frequencia para atividade que nao e aula', async () => {
      const response = await request(app).post('/api/frequencias').send({
        idAluno: alunoMaria.idAluno,
        idAtividade: eventoCarreira.idAtividade,
        statusPart: true
      });

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        success: false,
        message: 'A atividade informada nao e do tipo aula para registro de frequencia.'
      });
    });

    it('CT04 - deve rejeitar nota fora da faixa permitida', async () => {
      const response = await request(app).post('/api/frequencias').send({
        idAluno: alunoMaria.idAluno,
        idAtividade: aulaLogica.idAtividade,
        statusPart: true,
        nota: 11
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo nota deve ser um numero entre 0 e 10.'
      });
    });

    it('CT05 - deve retornar 404 quando atividade nao existe', async () => {
      const response = await request(app).post('/api/frequencias').send({
        idAluno: alunoMaria.idAluno,
        idAtividade: 9999,
        statusPart: true
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Atividade nao encontrada.'
      });
    });
  });

  describe('UC-09 - Registrar participacao em eventos', () => {
    it('CT01 - deve registrar participacao para atividade do tipo evento', async () => {
      const response = await request(app).post('/api/participacoes').send({
        idAluno: alunoJoao.idAluno,
        idAtividade: eventoCarreira.idAtividade,
        statusPart: true,
        dataPart: '2026-03-15'
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.registro).toMatchObject({
        idAluno: alunoJoao.idAluno,
        idAtividade: eventoCarreira.idAtividade
      });
    });

    it('CT02 - deve retornar 409 quando participacao ja existe', async () => {
      await request(app).post('/api/participacoes').send({
        idAluno: alunoJoao.idAluno,
        idAtividade: eventoDemoDay.idAtividade,
        statusPart: true
      });

      const response = await request(app).post('/api/participacoes').send({
        idAluno: alunoJoao.idAluno,
        idAtividade: eventoDemoDay.idAtividade,
        statusPart: true
      });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Ja existe participacao registrada para este aluno nesta atividade.'
      });
    });

    it('CT04 - deve retornar 404 quando atividade nao existe', async () => {
      const response = await request(app).post('/api/participacoes').send({
        idAluno: alunoJoao.idAluno,
        idAtividade: 9999,
        statusPart: true
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Atividade nao encontrada.'
      });
    });

    it('CT05 - deve retornar 400 para idAtividade invalido', async () => {
      const response = await request(app).post('/api/participacoes').send({
        idAluno: alunoJoao.idAluno,
        idAtividade: 0,
        statusPart: true
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo idAtividade deve ser um numero inteiro positivo.'
      });
    });
  });

  describe('UC-10 - Registrar empregabilidade', () => {
    it('CT01 - deve atualizar dados de empregabilidade do aluno', async () => {
      const response = await request(app).patch(`/api/empregabilidade/${alunoMaria.idAluno}`).send({
        ocupacao: 'empregada',
        tipoVinculoEmpregaticio: 'formal',
        rendaMensal: 3200
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        alunoId: alunoMaria.idAluno,
        ocupacao: 'empregada',
        tipoVinculoEmpregaticio: 'formal',
        rendaMensal: 3200
      });
    });

    it('CT02 - deve retornar 404 ao atualizar empregabilidade de aluno inexistente', async () => {
      const response = await request(app).patch('/api/empregabilidade/9999').send({
        ocupacao: 'empregada'
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT03 - deve rejeitar ocupacao invalida', async () => {
      const response = await request(app).patch(`/api/empregabilidade/${alunoMaria.idAluno}`).send({
        ocupacao: 'ab'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo ocupacao deve ter pelo menos 3 caracteres.'
      });
    });

    it('CT04 - deve rejeitar rendaMensal negativa', async () => {
      const response = await request(app).patch(`/api/empregabilidade/${alunoMaria.idAluno}`).send({
        ocupacao: 'empregada',
        rendaMensal: -100
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo rendaMensal deve ser um numero maior ou igual a zero.'
      });
    });
  });

  describe('UC-11 - Registrar ensino superior', () => {
    it('CT01 - deve atualizar dados de ensino superior do aluno', async () => {
      const response = await request(app).patch(`/api/ensino-superior/${alunoJoao.idAluno}`).send({
        escolaridade: 'ensino_superior',
        instituicaoEnsinoSuperior: 'Universidade Federal',
        cursoEnsinoSuperior: 'Ciencia da Computacao',
        statusEnsinoSuperior: 'cursando',
        dataIngressoEnsinoSuperior: '2026-03-01'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        alunoId: alunoJoao.idAluno,
        escolaridade: 'ensino_superior',
        instituicaoEnsinoSuperior: 'Universidade Federal',
        cursoEnsinoSuperior: 'Ciencia da Computacao',
        statusEnsinoSuperior: 'cursando',
        dataIngressoEnsinoSuperior: '2026-03-01'
      });
    });

    it('CT02 - deve retornar 404 ao atualizar ensino superior de aluno inexistente', async () => {
      const response = await request(app).patch('/api/ensino-superior/9999').send({
        escolaridade: 'ensino_superior'
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT03 - deve rejeitar escolaridade invalida', async () => {
      const response = await request(app).patch(`/api/ensino-superior/${alunoJoao.idAluno}`).send({
        escolaridade: 'ab'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo escolaridade deve ter pelo menos 3 caracteres.'
      });
    });

    it('CT04 - deve rejeitar dataIngressoEnsinoSuperior invalida', async () => {
      const response = await request(app).patch(`/api/ensino-superior/${alunoJoao.idAluno}`).send({
        escolaridade: 'ensino_superior',
        dataIngressoEnsinoSuperior: '01-03-2026'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo dataIngressoEnsinoSuperior deve estar no formato YYYY-MM-DD.'
      });
    });
  });

  describe('UC-12 - Registrar anotacoes qualitativas', () => {
    it('CT01 - deve registrar anotacao qualitativa para aluno existente', async () => {
      const response = await request(app).post('/api/anotacoes-qualitativas').send({
        idAluno: alunoMaria.idAluno,
        titulo: 'Comunicacao e lideranca',
        descricao: 'Apresentou crescimento consistente na lideranca do grupo.',
        autor: 'Coordenacao',
        dataRegistro: '2026-03-18'
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.alunoId).toBe(alunoMaria.idAluno);
      expect(response.body.data.titulo).toBe('Comunicacao e lideranca');
    });

    it('CT02 - deve retornar 404 ao registrar anotacao para aluno inexistente', async () => {
      const response = await request(app).post('/api/anotacoes-qualitativas').send({
        idAluno: 9999,
        titulo: 'Observacao',
        descricao: 'Texto de observacao valido.',
        autor: 'Coordenacao'
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Aluno nao encontrado.'
      });
    });

    it('CT03 - deve rejeitar descricao curta', async () => {
      const response = await request(app).post('/api/anotacoes-qualitativas').send({
        idAluno: alunoMaria.idAluno,
        titulo: 'Observacao',
        descricao: 'abc',
        autor: 'Coordenacao'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo descricao deve ter pelo menos 5 caracteres.'
      });
    });

    it('CT04 - deve rejeitar dataRegistro invalida', async () => {
      const response = await request(app).post('/api/anotacoes-qualitativas').send({
        idAluno: alunoMaria.idAluno,
        titulo: 'Observacao',
        descricao: 'Descricao valida para registro.',
        autor: 'Coordenacao',
        dataRegistro: '18/03/2026'
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        message: 'O campo dataRegistro deve estar no formato YYYY-MM-DD.'
      });
    });
  });

  describe('RNF - Qualidade para UC-07 a UC-12', () => {
    performanceIt('RNF-DES-UC07 - deve responder historico consolidado em ate 1500ms', async () => {
      const inicio = Date.now();
      const response = await request(app).get(`/api/jornada/alunos/${alunoMaria.idAluno}`);
      const duracaoMs = Date.now() - inicio;

      expect(response.status).toBe(200);
      expect(duracaoMs).toBeLessThan(1500);
    });

    it('RNF-SEG-UC08 - deve padronizar erro sem expor stack trace', async () => {
      const response = await request(app).post('/api/frequencias').send({
        idAluno: alunoMaria.idAluno,
        idAtividade: eventoCarreira.idAtividade,
        statusPart: true
      });

      expect(response.status).toBe(422);
      expectErrorContract(response.body);
      expect(response.body).toEqual({
        success: false,
        data: null,
        message: 'A atividade informada nao e do tipo aula para registro de frequencia.'
      });
      expect((response.body as { stack?: unknown }).stack).toBeUndefined();
    });
  });
});
