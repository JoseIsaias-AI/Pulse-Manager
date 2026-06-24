import { ImportacaoService } from '../../../backend/services/importacaoService';

const baseAluno = {
  idAluno: 1,
  codigoPm: 'PM-2024-001',
  nome: 'Maria Silva',
  email: 'maria@email.com',
  telefone: null,
  idade: 20,
  genero: null,
  ocupacao: null,
  tipoVinculoEmpregaticio: null,
  rendaMensal: null,
  escolaridade: null,
  instituicaoEnsinoSuperior: null,
  cursoEnsinoSuperior: null,
  statusEnsinoSuperior: null,
  dataIngressoEnsinoSuperior: null,
  programa: 'Pulse',
  categoria: 'Jornada',
  riscoEvasao: 'baixo',
  engajamento: 0,
  dataIngresso: '2024-01-10',
  status: 'ativo',
  nivelJornada: null,
  perfilSocioeconomico: null,
  curso: null,
  origemParticipacao: null
};

function makeRepository() {
  return {
    listarAlunos: jest.fn(),
    buscarAlunoPorEmail: jest.fn(),
    criarAluno: jest.fn(),
    atualizarAluno: jest.fn()
  };
}

describe('ImportacaoService', () => {
  let repository: ReturnType<typeof makeRepository>;
  let service: ImportacaoService;

  beforeEach(() => {
    repository = makeRepository();
    service = new ImportacaoService(repository as any);
  });

  it('importa alunos novos a partir de CSV', async () => {
    repository.buscarAlunoPorEmail.mockResolvedValue(null);
    repository.criarAluno.mockResolvedValue(baseAluno);

    const result = await service.importarAlunosCsv('nome,email,idade\nMaria Silva,maria@email.com,20');

    expect(repository.criarAluno).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Maria Silva',
      email: 'maria@email.com',
      idade: 20
    }));
    expect(result.data).toEqual({
      totalLinhas: 1,
      importados: 1,
      atualizados: 0,
      ignorados: 0,
      erros: []
    });
  });

  it('atualiza aluno existente quando o email ja esta cadastrado', async () => {
    repository.buscarAlunoPorEmail.mockResolvedValue(baseAluno);
    repository.atualizarAluno.mockResolvedValue({ ...baseAluno, nome: 'Maria Atualizada' });

    const result = await service.importarAlunosCsv('nome;email;status\nMaria Atualizada;maria@email.com;ativo');

    expect(repository.atualizarAluno).toHaveBeenCalledWith(1, expect.objectContaining({
      nome: 'Maria Atualizada',
      email: 'maria@email.com',
      status: 'ativo'
    }));
    expect(result.data.importados).toBe(0);
    expect(result.data.atualizados).toBe(1);
  });

  it('ignora linhas com email preenchido em formato invalido', async () => {
    const result = await service.importarAlunosCsv('nome,email\nEmail Invalido,sem-arroba');

    expect(repository.criarAluno).not.toHaveBeenCalled();
    expect(result.data.ignorados).toBe(1);
    expect(result.data.erros[0]).toEqual(expect.objectContaining({
      linha: 2,
      motivo: expect.stringContaining('e-mail')
    }));
  });

  it('gera email tecnico quando a planilha nao informa email', async () => {
    repository.buscarAlunoPorEmail.mockResolvedValue(null);
    repository.criarAluno.mockResolvedValue(baseAluno);

    await service.importarAlunosCsv('nome,telefone,email\nSem Email,11999999999,');

    expect(repository.criarAluno).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Sem Email',
      email: 'sem-email+11999999999@pulsemais.local',
      telefone: '11999999999'
    }));
  });

  it('aceita o modelo de planilha do parceiro e consolida linhas pelo email', async () => {
    repository.buscarAlunoPorEmail.mockResolvedValue(null);
    repository.criarAluno.mockResolvedValue(baseAluno);

    const csv = [
      'Column 17,Telefone,Email,Conectado (Mes),Conectado (Ano),Capacitado (Mes),Capacitado (Ano),Programa Capacitado,Empregabilidade,Bolsa,Data Transformado,Ano Transformado,Categoria,Evento conectado,Transformados,Ano Atingido',
      'Nome e Sobrenome Aluno 1,11255826066,Aluno1@pulsemais.org.br,,,,,,08/2024,,08/2024,2024,Jovens Transformados,,Empregabilidade,#REF!',
      'Nome e Sobrenome Aluno 1,11255826066,Aluno1@pulsemais.org.br,,,09/2024,2024,Programa de Mentoria,,,,,Jovens Capacitados,,,#REF!',
      'Nome e Sobrenome Aluno 1,11255826066,Aluno1@pulsemais.org.br,07/2024,2024,,,,,,,,Jovens Conectados,Evento conectado,,#REF!'
    ].join('\n');

    const result = await service.importarAlunosCsv(csv);

    expect(repository.criarAluno).toHaveBeenCalledTimes(1);
    expect(repository.criarAluno).toHaveBeenCalledWith(expect.objectContaining({
      nome: 'Nome e Sobrenome Aluno 1',
      email: 'aluno1@pulsemais.org.br',
      telefone: '11255826066',
      dataIngresso: '2024-07-01',
      programa: 'Programa de Mentoria',
      categoria: 'Jovens Transformados | Jovens Capacitados | Jovens Conectado',
      origemParticipacao: 'Empregabilidade | Evento conectado'
    }));
    expect(result.data.totalLinhas).toBe(3);
    expect(result.data.importados).toBe(1);
    expect(result.data.ignorados).toBe(0);
  });
});
