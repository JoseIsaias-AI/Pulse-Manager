import request from 'supertest';
import { Repository } from 'typeorm';
import { app } from '../../backend/app';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';
import { Label } from '../../backend/models/LabelModel';
import { HistoricoPsicologico } from '../../backend/models/SaudeMentalModel';
import { Psicologo } from '../../backend/models/usuarioModel';
import { expectErrorContract, expectSuccessContract } from '../helpers/responseContract';

describe('Dashboard psicologico', () => {
  let alunoRepo: Repository<Aluno>;
  let psicologoRepo: Repository<Psicologo>;
  let historicoRepo: Repository<HistoricoPsicologico>;
  let labelRepo: Repository<Label>;

  let psicologo: Psicologo;
  let outroPsicologo: Psicologo;
  let alunoAcompanhado: Aluno;
  let outroAlunoAcompanhado: Aluno;
  let alunoDeOutroPsicologo: Aluno;

  beforeAll(async () => {
    await initializeDatabase();
    alunoRepo = AppDataSource.getRepository(Aluno);
    psicologoRepo = AppDataSource.getRepository(Psicologo);
    historicoRepo = AppDataSource.getRepository(HistoricoPsicologico);
    labelRepo = AppDataSource.getRepository(Label);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);

    psicologo = await psicologoRepo.save({
      nomePsi: 'Dra. Helena Prado',
      email: 'helena.prado@pulsemais.org',
      cargoPsi: 'psicologo'
    });

    outroPsicologo = await psicologoRepo.save({
      nomePsi: 'Dr. Rafael Torres',
      email: 'rafael.torres@pulsemais.org',
      cargoPsi: 'psicologo'
    });

    alunoAcompanhado = await alunoRepo.save({
      nome: 'Bianca Lopes',
      email: 'bianca.lopes@pulsemais.org',
      programa: 'Acolhimento',
      categoria: 'conectado',
      riscoEvasao: 'alto',
      engajamento: 42,
      dataIngresso: '2026-02-01',
      status: 'em_acompanhamento'
    });

    outroAlunoAcompanhado = await alunoRepo.save({
      nome: 'Caio Martins',
      email: 'caio.martins@pulsemais.org',
      programa: 'Carreira',
      categoria: 'capacitado',
      riscoEvasao: 'medio',
      engajamento: 67,
      dataIngresso: '2026-02-03',
      status: 'ativo'
    });

    alunoDeOutroPsicologo = await alunoRepo.save({
      nome: 'Davi Ribeiro',
      email: 'davi.ribeiro@pulsemais.org',
      programa: 'Acolhimento',
      categoria: 'vulneravel',
      riscoEvasao: 'alto',
      engajamento: 21,
      dataIngresso: '2026-02-05',
      status: 'em_acompanhamento'
    });

    await historicoRepo.save([
      {
        titulo: 'Atendimento inicial',
        observacao: 'Primeiro acolhimento psicologico.',
        idAluno: alunoAcompanhado.idAluno,
        idPsi: psicologo.idPsi
      },
      {
        titulo: 'Retorno',
        observacao: 'Aluno relata melhora parcial.',
        idAluno: alunoAcompanhado.idAluno,
        idPsi: psicologo.idPsi
      },
      {
        titulo: 'Acompanhamento de carreira',
        observacao: 'Aluno demanda apoio emocional para entrevistas.',
        idAluno: outroAlunoAcompanhado.idAluno,
        idPsi: psicologo.idPsi
      },
      {
        titulo: 'Atendimento de outro psicologo',
        observacao: 'Este registro nao deve aparecer no dashboard da Helena.',
        idAluno: alunoDeOutroPsicologo.idAluno,
        idPsi: outroPsicologo.idPsi
      }
    ]);

    await labelRepo.save([
      {
        descricao: 'Risco psicossocial elevado',
        tipoLabel: 'risco',
        idAluno: alunoAcompanhado.idAluno,
        idPsi: psicologo.idPsi
      },
      {
        descricao: 'Interesse em mentoria socioemocional',
        tipoLabel: 'interesse',
        idAluno: outroAlunoAcompanhado.idAluno,
        idPsi: psicologo.idPsi
      },
      {
        descricao: 'Risco de outro psicologo',
        tipoLabel: 'risco',
        idAluno: alunoDeOutroPsicologo.idAluno,
        idPsi: outroPsicologo.idPsi
      }
    ]);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('deve retornar dados reais apenas dos alunos vinculados ao psicologo', async () => {
    const response = await request(app)
      .get(`/api/psicologo/dashboard/${psicologo.idPsi}`)
      .set('x-user-id', String(psicologo.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(200);
    expectSuccessContract(response.body);
    expect(response.body.message).toBe('Dashboard psicologico carregado com sucesso.');
    expect(response.body.data).toMatchObject({
      idPsicologo: psicologo.idPsi,
      totalAtendimentos: 3,
      alunosEmRisco: 1,
      indicadoresSaudeMental: {
        totalAlunosAcompanhados: 2,
        totalLabels: 2,
        labelsPorTipo: {
          risco: 1,
          interesse: 1
        },
        alunosPorStatus: {
          ativo: 1,
          em_acompanhamento: 1
        }
      }
    });
    expect(response.body.data.evolucaoAtendimentos).toEqual([{ periodo: 'geral', total: 3 }]);
  });

  it('deve retornar valores zerados quando o psicologo nao possui registros', async () => {
    const psicologoSemRegistros = await psicologoRepo.save({
      nomePsi: 'Dra. Sem Registros',
      email: 'sem.registros@pulsemais.org',
      cargoPsi: 'psicologo'
    });

    const response = await request(app)
      .get(`/api/psicologo/dashboard/${psicologoSemRegistros.idPsi}`)
      .set('x-user-id', String(psicologoSemRegistros.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(200);
    expectSuccessContract(response.body);
    expect(response.body.data).toEqual({
      idPsicologo: psicologoSemRegistros.idPsi,
      totalAtendimentos: 0,
      alunosEmRisco: 0,
      evolucaoAtendimentos: [{ periodo: 'geral', total: 0 }],
      indicadoresSaudeMental: {
        totalAlunosAcompanhados: 0,
        totalLabels: 0,
        labelsPorTipo: {},
        alunosPorStatus: {}
      }
    });
  });

  it('deve negar tentativa de acesso ao dashboard de outro psicologo', async () => {
    const response = await request(app)
      .get(`/api/psicologo/dashboard/${outroPsicologo.idPsi}`)
      .set('x-user-id', String(psicologo.idPsi))
      .set('x-user-role', 'psicologo');

    expect(response.status).toBe(403);
    expectErrorContract(response.body);
    expect(response.body.message).toBe('Psicologo nao pode acessar dashboard de outro psicologo.');
  });
});
