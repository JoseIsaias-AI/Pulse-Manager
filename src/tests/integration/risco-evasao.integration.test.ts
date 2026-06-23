import { Repository } from 'typeorm';
import { AppDataSource, initializeDatabase } from '../../backend/database/connection';
import { Aluno } from '../../backend/models/alunoModel';
import { Atividade } from '../../backend/models/atividadeModel';
import { Participacao } from '../../backend/models/participacaoModel';
import { RiscoEvasaoRepository } from '../../backend/repositories/riscoEvasaoRepository';
import { RiscoEvasaoService } from '../../backend/services/riscoEvasaoService';

describe('Recalculo fuzzy de risco de evasao', () => {
  let alunos: Repository<Aluno>;
  let atividades: Repository<Atividade>;
  let participacoes: Repository<Participacao>;

  beforeAll(async () => {
    await initializeDatabase();
    alunos = AppDataSource.getRepository(Aluno);
    atividades = AppDataSource.getRepository(Atividade);
    participacoes = AppDataSource.getRepository(Participacao);
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  });

  it('agrega frequencia e notas e persiste percentual e classificacao', async () => {
    const aluno = await alunos.save({
      nome: 'Aluno com faltas',
      email: 'faltas@pulsemais.org',
      programa: 'Pulse Mais',
      categoria: 'capacitado',
      riscoEvasao: 'baixo',
      engajamento: 15,
      dataIngresso: '2026-01-10',
      status: 'ativo'
    });
    const aulas = await atividades.save(
      Array.from({ length: 5 }, (_, indice) => ({
        titulo: `Aula ${indice + 1}`,
        tipo: 'aula' as const,
        data: `2026-02-${String(indice + 1).padStart(2, '0')}`
      }))
    );
    await participacoes.save(
      aulas.map((aula, indice) => ({
        idAluno: aluno.idAluno,
        idAtividade: aula.idAtividade,
        dataPart: aula.data!,
        statusPart: indice === 0,
        nota: 4
      }))
    );

    const resumo = await new RiscoEvasaoService(new RiscoEvasaoRepository()).recalcularTodos();
    const atualizado = await alunos.findOneByOrFail({ idAluno: aluno.idAluno });

    expect(resumo.atualizados).toBe(1);
    expect(atualizado.riscoEvasao).toBe('alto');
    expect(Number(atualizado.probabilidadeEvasao)).toBeGreaterThanOrEqual(70);
  });

  it('mantem a classificacao existente quando o aluno nao possui sinais quantitativos', async () => {
    const aluno = await alunos.save({
      nome: 'Aluno novo',
      email: 'novo@pulsemais.org',
      programa: 'Pulse Mais',
      categoria: 'conectado',
      riscoEvasao: 'medio',
      engajamento: 0,
      dataIngresso: '2026-06-01',
      status: 'ativo'
    });

    const resumo = await new RiscoEvasaoService(new RiscoEvasaoRepository()).recalcularTodos();
    const preservado = await alunos.findOneByOrFail({ idAluno: aluno.idAluno });

    expect(resumo.semDadosSuficientes).toBe(1);
    expect(preservado.riscoEvasao).toBe('medio');
    expect(preservado.probabilidadeEvasao).toBeNull();
  });
});
