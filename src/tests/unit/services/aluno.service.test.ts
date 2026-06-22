import { AlunoService } from '../../../backend/services/alunoService';
import { AlunoRepository } from '../../../backend/repositories/alunoRepository';
import { asMockedDependency } from '../../helpers/mockHelper';

const baseAluno = {
  idAluno: 1,
  codigoPm: 'PM-2024-001',
  nome: 'Maria Silva',
  email: 'maria@email.com',
  telefone: null,
  idade: 20,
  genero: null,
  ocupacao: null,
  empregabilidade: 'nao_informado',
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
    list: jest.fn(),
    getCadastroOptions: jest.fn(),
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDeactivate: jest.fn()
  };
}

describe('AlunoService', () => {
  let repository: ReturnType<typeof makeRepository>;
  let service: AlunoService;

  beforeEach(() => {
    repository = makeRepository();
    service = new AlunoService(asMockedDependency<AlunoRepository>(repository));
  });

  it('lista alunos com filtros', async () => {
    repository.list.mockResolvedValue([baseAluno]);

    const result = await service.listar({
      busca: 'Maria',
      status: 'ativo',
      programa: 'Pulse',
      empregabilidade: 'empregado',
      escolaridade: 'ensino_superior',
      curso: 'Desenvolvimento Web',
      anoIngresso: 2024,
      limite: 10
    });

    expect(repository.list).toHaveBeenCalledWith({
      busca: 'Maria',
      status: 'ativo',
      programa: 'Pulse',
      empregabilidade: 'empregado',
      escolaridade: 'ensino_superior',
      curso: 'Desenvolvimento Web',
      anoIngresso: 2024,
      limite: 10
    });
    expect(result).toEqual({ success: true, data: { alunos: [baseAluno] } });
  });

  it('lista opcoes de cadastro combinando enums e valores do banco', async () => {
    repository.getCadastroOptions.mockResolvedValue({
      genero: ['masculino'],
      ocupacao: ['Estudante'],
      tipoVinculoEmpregaticio: ['CLT'],
      escolaridade: ['Ensino medio completo'],
      instituicaoEnsinoSuperior: [],
      cursoEnsinoSuperior: [],
      statusEnsinoSuperior: [],
      programa: ['Pulse'],
      categoria: ['Conectado'],
      riscoEvasao: ['baixo'],
      status: ['ativo'],
      nivelJornada: ['conectado'],
      perfilSocioeconomico: ['bolsista'],
      curso: ['Tecnologia'],
      origemParticipacao: ['evento']
    });

    const result = await service.listarOpcoesCadastro();

    expect(result.data.genero).toEqual(expect.arrayContaining(['masculino', 'nao_binario']));
    expect(result.data.status).toEqual(expect.arrayContaining(['ativo', 'desligado']));
    expect(result.data.riscoEvasao).toEqual(expect.arrayContaining(['baixo', 'medio', 'alto']));
    expect(result.data.curso).toEqual(['Tecnologia']);
  });

  it('rejeita filtros de empregabilidade e ano de ingresso invalidos', async () => {
    await expect(service.listar({ empregabilidade: 'talvez' as any })).rejects.toThrow(
      'Empregabilidade invalida.'
    );
    await expect(service.listar({ anoIngresso: 22 })).rejects.toThrow(
      'O campo anoIngresso deve ser um ano valido.'
    );
  });

  it('cadastra aluno com payload valido', async () => {
    repository.findOneByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(baseAluno);

    const result = await service.cadastrar({ nome: 'Maria Silva', email: 'maria@email.com', dataIngresso: '2024-01-10' });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Maria Silva', email: 'maria@email.com' }));
    expect(result).toEqual({ success: true, data: baseAluno });
  });

  it('normaliza email para letras minusculas', async () => {
    repository.findOneByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(baseAluno);

    await service.cadastrar({ nome: 'Maria Silva', email: 'MARIA@EMAIL.COM', dataIngresso: '2024-01-10' });

    expect(repository.findOneByEmail).toHaveBeenCalledWith('maria@email.com');
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'maria@email.com' }));
  });

  it('rejeita cadastro com nome invalido', async () => {
    await expect(service.cadastrar({ nome: 'Ma', email: 'maria@email.com' })).rejects.toThrow(
      'O campo nome deve ter pelo menos 3 caracteres.'
    );
  });

  it('rejeita cadastro com email invalido', async () => {
    await expect(service.cadastrar({ nome: 'Maria Silva', email: 'maria.email.com' })).rejects.toThrow(
      'O campo email deve conter um endereco valido.'
    );
  });

  it('rejeita cadastro com idade fora do intervalo permitido', async () => {
    await expect(service.cadastrar({ nome: 'Maria Silva', email: 'maria@email.com', idade: 121 })).rejects.toThrow(
      'O campo idade deve estar entre 0 e 120.'
    );
  });

  it('rejeita cadastro com data de ingresso invalida', async () => {
    await expect(
      service.cadastrar({ nome: 'Maria Silva', email: 'maria@email.com', dataIngresso: '10/01/2024' })
    ).rejects.toThrow('O campo dataIngresso deve estar no formato YYYY-MM-DD.');
  });

  it('valida os dados adicionais do cadastro', async () => {
    await expect(
      service.cadastrar({ nome: 'Maria Silva', email: 'maria@email.com', rendaMensal: -10 })
    ).rejects.toThrow('O campo rendaMensal deve ser um numero maior ou igual a zero.');

    await expect(
      service.cadastrar({ nome: 'Maria Silva', email: 'maria@email.com', engajamento: 101 })
    ).rejects.toThrow('O campo engajamento deve ser um numero inteiro entre 0 e 100.');

    await expect(
      service.cadastrar({ nome: 'Maria Silva', email: 'maria@email.com', status: 'desconhecido' as any })
    ).rejects.toThrow('Status do aluno invalido.');
  });

  it('rejeita cadastro com email ja existente', async () => {
    repository.findOneByEmail.mockResolvedValue(baseAluno);

    await expect(service.cadastrar({ nome: 'Maria Silva', email: 'maria@email.com' })).rejects.toThrow(
      'Ja existe aluno cadastrado com este e-mail.'
    );
  });

  it('obtem perfil de aluno existente', async () => {
    repository.findById.mockResolvedValue(baseAluno);

    const result = await service.obterPerfil(1);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ success: true, data: baseAluno });
  });

  it('rejeita busca de aluno inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.obterPerfil(999)).rejects.toThrow('Aluno nao encontrado.');
  });

  it('atualiza aluno existente', async () => {
    const atualizado = { ...baseAluno, nome: 'Maria Atualizada' };
    repository.findById.mockResolvedValue(baseAluno);
    repository.update.mockResolvedValue(atualizado);

    const result = await service.atualizar(1, { nome: 'Maria Atualizada' });

    expect(repository.update).toHaveBeenCalledWith(1, { nome: 'Maria Atualizada' });
    expect(result).toEqual({ success: true, data: atualizado });
  });

  it('recalcula automaticamente o risco quando o engajamento muda', async () => {
    const riscoEvasaoService = { recalcularAluno: jest.fn().mockResolvedValue(undefined) };
    service = new AlunoService(repository as any, riscoEvasaoService as any);
    const atualizado = { ...baseAluno, engajamento: 25, riscoEvasao: 'alto' };
    repository.findById
      .mockResolvedValueOnce(baseAluno)
      .mockResolvedValueOnce(atualizado);
    repository.update.mockResolvedValue({ ...baseAluno, engajamento: 25 });

    const result = await service.atualizar(1, { engajamento: 25 });

    expect(riscoEvasaoService.recalcularAluno).toHaveBeenCalledWith(1);
    expect(result.data).toEqual(atualizado);
  });

  it('rejeita atualizacao com dados invalidos', async () => {
    repository.findById.mockResolvedValue(baseAluno);

    await expect(service.atualizar(1, { riscoEvasao: 'critico' as any })).rejects.toThrow('Risco de evasao invalido.');
  });

  it('inativa aluno existente', async () => {
    const inativo = { ...baseAluno, status: 'inativo' };
    repository.findById.mockResolvedValue(baseAluno);
    repository.softDeactivate.mockResolvedValue(inativo);

    const result = await service.inativar(1);

    expect(repository.softDeactivate).toHaveBeenCalledWith(1);
    expect(result).toEqual({ success: true, data: inativo });
  });
});
