import { JornadaService } from '../../../backend/services/jornadaService';
import { JornadaRepository } from '../../../backend/repositories/jornadaRepository';
import { asMockedDependency } from '../../helpers/mockHelper';

const aluno = {
  idAluno: 1,
  codigoPm: 'PM-2024-001',
  nome: 'Maria Silva',
  email: 'maria@email.com',
  telefone: null,
  idade: null,
  genero: null,
  ocupacao: 'Estudante',
  tipoVinculoEmpregaticio: null,
  rendaMensal: null,
  escolaridade: 'Ensino medio',
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
  nivelJornada: 'inicio',
  perfilSocioeconomico: null,
  curso: null,
  origemParticipacao: null
};

const aula = {
  idAtividade: 1,
  titulo: 'Aula de tecnologia',
  tipo: 'aula',
  descricao: null,
  data: '2024-05-10',
  modalidade: null,
  cargaHoraria: null
};

const evento = {
  ...aula,
  idAtividade: 2,
  titulo: 'Evento de carreira',
  tipo: 'evento'
};

const participacaoAula = {
  idPart: 1,
  dataPart: '2024-05-10',
  statusPart: true,
  idAluno: 1,
  idAtividade: 1,
  nota: 8,
  certificado: false,
  atividade: aula
};

const participacaoEvento = {
  ...participacaoAula,
  idPart: 2,
  idAtividade: 2,
  atividade: evento
};

function makeRepository() {
  return {
    findAlunoById: jest.fn(),
    findAtividadeById: jest.fn(),
    findParticipacaoByAlunoAtividade: jest.fn(),
    saveParticipacao: jest.fn(),
    listParticipacoesByAluno: jest.fn(),
    updateEmpregabilidade: jest.fn(),
    updateEnsinoSuperior: jest.fn(),
    saveAnotacao: jest.fn(),
    listAnotacoesByAluno: jest.fn()
  };
}

describe('JornadaService', () => {
  let repository: ReturnType<typeof makeRepository>;
  let service: JornadaService;

  beforeEach(() => {
    repository = makeRepository();
    service = new JornadaService(asMockedDependency<JornadaRepository>(repository));
  });

  it('rejeita id de aluno invalido', async () => {
    await expect(service.obterJornadaAluno(0)).rejects.toThrow('O campo idAluno deve ser um numero inteiro positivo.');
  });

  it('rejeita aluno inexistente', async () => {
    repository.findAlunoById.mockResolvedValue(null);

    await expect(service.obterJornadaAluno(1)).rejects.toThrow('Aluno nao encontrado para consolidacao da jornada.');
  });

  it('consolida dados gerais da jornada do aluno', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.listParticipacoesByAluno.mockResolvedValue([]);
    repository.listAnotacoesByAluno.mockResolvedValue([]);

    const result = await service.obterJornadaAluno(1);

    expect(result.data.aluno).toEqual({
      idAluno: 1,
      nome: 'Maria Silva',
      email: 'maria@email.com',
      programa: 'Pulse',
      categoria: 'Jornada',
      status: 'ativo',
      riscoEvasao: 'baixo'
    });
    expect(result.data.empregabilidade.ocupacao).toBe('Estudante');
    expect(result.data.ensinoSuperior.escolaridade).toBe('Ensino medio');
  });

  it('separa frequencias de atividades do tipo aula', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.listParticipacoesByAluno.mockResolvedValue([participacaoAula, participacaoEvento]);
    repository.listAnotacoesByAluno.mockResolvedValue([]);

    const result = await service.obterJornadaAluno(1);

    expect(result.data.frequencias).toHaveLength(1);
    expect(result.data.frequencias[0].tipoAtividade).toBe('aula');
  });

  it('separa participacoes de atividades do tipo evento', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.listParticipacoesByAluno.mockResolvedValue([participacaoAula, participacaoEvento]);
    repository.listAnotacoesByAluno.mockResolvedValue([]);

    const result = await service.obterJornadaAluno(1);

    expect(result.data.participacoesEventos).toHaveLength(1);
    expect(result.data.participacoesEventos[0].tipoAtividade).toBe('evento');
  });

  it('mapeia anotacoes qualitativas', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.listParticipacoesByAluno.mockResolvedValue([]);
    repository.listAnotacoesByAluno.mockResolvedValue([
      { idAnotacao: 1, idAluno: 1, titulo: 'Evolucao', descricao: 'Boa evolucao', autor: 'Mentor', dataRegistro: '2024-05-10' }
    ]);

    const result = await service.obterJornadaAluno(1);

    expect(result.data.anotacoesQualitativas).toEqual([
      { idAnotacao: 1, titulo: 'Evolucao', descricao: 'Boa evolucao', autor: 'Mentor', dataRegistro: '2024-05-10' }
    ]);
  });

  it('cria registro de frequencia', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(aula);
    repository.findParticipacaoByAlunoAtividade.mockResolvedValue(null);
    repository.saveParticipacao.mockResolvedValue(participacaoAula);

    const result = await service.registrarFrequencia({ idAluno: 1, idAtividade: 1, statusPart: true, nota: 8, dataPart: '2024-05-10' });

    expect(repository.saveParticipacao).toHaveBeenCalledWith({
      idAluno: 1,
      idAtividade: 1,
      statusPart: true,
      nota: 8,
      dataPart: '2024-05-10'
    });
    expect(result.data.operacao).toBe('criado');
  });

  it('recalcula automaticamente o risco depois de registrar frequencia', async () => {
    const riscoEvasaoService = { recalcularAluno: jest.fn().mockResolvedValue(undefined) };
    service = new JornadaService(repository as any, riscoEvasaoService as any);
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(aula);
    repository.findParticipacaoByAlunoAtividade.mockResolvedValue(null);
    repository.saveParticipacao.mockResolvedValue(participacaoAula);

    await service.registrarFrequencia({ idAluno: 1, idAtividade: 1, statusPart: false });

    expect(riscoEvasaoService.recalcularAluno).toHaveBeenCalledWith(1);
  });

  it('atualiza registro de frequencia existente', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(aula);
    repository.findParticipacaoByAlunoAtividade.mockResolvedValue(participacaoAula);
    repository.saveParticipacao.mockResolvedValue({ ...participacaoAula, statusPart: false });

    const result = await service.registrarFrequencia({ idAluno: 1, idAtividade: 1, statusPart: false, dataPart: '2024-05-11' });

    expect(repository.saveParticipacao).toHaveBeenCalledWith(expect.objectContaining({ idPart: 1, statusPart: false, nota: 8 }));
    expect(result.data.operacao).toBe('atualizado');
  });

  it('rejeita frequencia para atividade que nao seja aula', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(evento);

    await expect(service.registrarFrequencia({ idAluno: 1, idAtividade: 2, statusPart: true })).rejects.toThrow(
      'A atividade informada nao e do tipo aula para registro de frequencia.'
    );
  });

  it('rejeita nota fora do intervalo de 0 a 10', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(aula);

    await expect(service.registrarFrequencia({ idAluno: 1, idAtividade: 1, statusPart: true, nota: 11 })).rejects.toThrow(
      'O campo nota deve ser um numero entre 0 e 10.'
    );
  });

  it('rejeita data de participacao invalida', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(aula);

    await expect(
      service.registrarFrequencia({ idAluno: 1, idAtividade: 1, statusPart: true, dataPart: '10/05/2024' })
    ).rejects.toThrow('O campo dataPart deve estar no formato YYYY-MM-DD.');
  });

  it('registra participacao em evento', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(evento);
    repository.findParticipacaoByAlunoAtividade.mockResolvedValue(null);
    repository.saveParticipacao.mockResolvedValue(participacaoEvento);

    const result = await service.registrarParticipacaoEvento({ idAluno: 1, idAtividade: 2, statusPart: true, nota: 9, dataPart: '2024-05-10' });

    expect(repository.saveParticipacao).toHaveBeenCalledWith({
      idAluno: 1,
      idAtividade: 2,
      statusPart: true,
      nota: 9,
      dataPart: '2024-05-10'
    });
    expect(result.data.registro).toEqual(participacaoEvento);
  });

  it('recalcula automaticamente o risco depois de registrar participacao', async () => {
    const riscoEvasaoService = { recalcularAluno: jest.fn().mockResolvedValue(undefined) };
    service = new JornadaService(repository as any, riscoEvasaoService as any);
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(evento);
    repository.findParticipacaoByAlunoAtividade.mockResolvedValue(null);
    repository.saveParticipacao.mockResolvedValue(participacaoEvento);

    await service.registrarParticipacaoEvento({ idAluno: 1, idAtividade: 2, statusPart: true });

    expect(riscoEvasaoService.recalcularAluno).toHaveBeenCalledWith(1);
  });

  it('rejeita participacao duplicada em evento', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.findAtividadeById.mockResolvedValue(evento);
    repository.findParticipacaoByAlunoAtividade.mockResolvedValue(participacaoEvento);

    await expect(service.registrarParticipacaoEvento({ idAluno: 1, idAtividade: 2, statusPart: true })).rejects.toThrow(
      'Ja existe participacao registrada para este aluno nesta atividade.'
    );
  });

  it('atualiza dados de empregabilidade', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.updateEmpregabilidade.mockResolvedValue({
      ...aluno,
      ocupacao: 'Empregado',
      tipoVinculoEmpregaticio: 'CLT',
      rendaMensal: 2500
    });

    const result = await service.atualizarEmpregabilidade(1, {
      ocupacao: ' Empregado ',
      tipoVinculoEmpregaticio: ' CLT ',
      rendaMensal: 2500
    });

    expect(repository.updateEmpregabilidade).toHaveBeenCalledWith(1, {
      ocupacao: 'Empregado',
      tipoVinculoEmpregaticio: 'CLT',
      rendaMensal: 2500
    });
    expect(result.data.ocupacao).toBe('Empregado');
  });

  it('rejeita ocupacao invalida', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);

    await expect(service.atualizarEmpregabilidade(1, { ocupacao: 'TI' })).rejects.toThrow(
      'O campo ocupacao deve ter pelo menos 3 caracteres.'
    );
  });

  it('rejeita renda mensal invalida', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);

    await expect(service.atualizarEmpregabilidade(1, { ocupacao: 'Empregado', rendaMensal: -1 })).rejects.toThrow(
      'O campo rendaMensal deve ser um numero maior ou igual a zero.'
    );
  });

  it('atualiza dados de ensino superior', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.updateEnsinoSuperior.mockResolvedValue({
      ...aluno,
      escolaridade: 'Ensino superior',
      instituicaoEnsinoSuperior: 'Universidade',
      cursoEnsinoSuperior: 'Computacao',
      statusEnsinoSuperior: 'cursando',
      dataIngressoEnsinoSuperior: '2024-02-01'
    });

    const result = await service.atualizarEnsinoSuperior(1, {
      escolaridade: ' Ensino superior ',
      instituicaoEnsinoSuperior: ' Universidade ',
      cursoEnsinoSuperior: ' Computacao ',
      statusEnsinoSuperior: ' cursando ',
      dataIngressoEnsinoSuperior: '2024-02-01'
    });

    expect(repository.updateEnsinoSuperior).toHaveBeenCalledWith(1, {
      escolaridade: 'Ensino superior',
      instituicaoEnsinoSuperior: 'Universidade',
      cursoEnsinoSuperior: 'Computacao',
      statusEnsinoSuperior: 'cursando',
      dataIngressoEnsinoSuperior: '2024-02-01'
    });
    expect(result.data.escolaridade).toBe('Ensino superior');
  });

  it('rejeita escolaridade invalida', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);

    await expect(service.atualizarEnsinoSuperior(1, { escolaridade: 'EM' })).rejects.toThrow(
      'O campo escolaridade deve ter pelo menos 3 caracteres.'
    );
  });

  it('rejeita data de ingresso no ensino superior invalida', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);

    await expect(
      service.atualizarEnsinoSuperior(1, { escolaridade: 'Ensino superior', dataIngressoEnsinoSuperior: '02/01/2024' })
    ).rejects.toThrow('O campo dataIngressoEnsinoSuperior deve estar no formato YYYY-MM-DD.');
  });

  it('registra anotacao qualitativa', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);
    repository.saveAnotacao.mockResolvedValue({
      idAnotacao: 1,
      idAluno: 1,
      titulo: 'Evolucao',
      descricao: 'Boa evolucao',
      autor: 'Mentor',
      dataRegistro: '2024-05-10'
    });

    const result = await service.registrarAnotacaoQualitativa({
      idAluno: 1,
      titulo: ' Evolucao ',
      descricao: ' Boa evolucao ',
      autor: ' Mentor ',
      dataRegistro: '2024-05-10'
    });

    expect(repository.saveAnotacao).toHaveBeenCalledWith({
      idAluno: 1,
      titulo: 'Evolucao',
      descricao: 'Boa evolucao',
      autor: 'Mentor',
      dataRegistro: '2024-05-10'
    });
    expect(result.data).toEqual({ anotacaoId: 1, alunoId: 1, titulo: 'Evolucao' });
  });

  it('rejeita anotacao qualitativa com campos invalidos', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);

    await expect(
      service.registrarAnotacaoQualitativa({ idAluno: 1, titulo: 'Ok', descricao: 'Boa evolucao', autor: 'Mentor' })
    ).rejects.toThrow('O campo titulo deve ter pelo menos 3 caracteres.');
  });

  it('rejeita data de registro da anotacao invalida', async () => {
    repository.findAlunoById.mockResolvedValue(aluno);

    await expect(
      service.registrarAnotacaoQualitativa({
        idAluno: 1,
        titulo: 'Evolucao',
        descricao: 'Boa evolucao',
        autor: 'Mentor',
        dataRegistro: '10/05/2024'
      })
    ).rejects.toThrow('O campo dataRegistro deve estar no formato YYYY-MM-DD.');
  });
});
