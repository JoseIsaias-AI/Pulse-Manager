import { SaudeMentalService } from '../../../backend/services/saudeMentalService';
import { AlunoRepository } from '../../../backend/repositories/alunoRepository';
import { SaudeMentalRepository } from '../../../backend/repositories/saudeMentalRepository';
import { asMockedDependency } from '../../helpers/mockHelper';

const aluno = { idAluno: 1, nome: 'Maria Silva' };
const prontuarioPayload = {
  idAluno: 1,
  idPsi: 1,
  titulo: 'Acompanhamento',
  observacao: 'Observacao registrada'
};
const labelPayload = {
  idAluno: 1,
  idPsi: 1,
  descricao: 'Risco alto',
  tipoLabel: 'risco'
};

function makeSaudeMentalRepository() {
  return {
    listar: jest.fn(),
    criar: jest.fn(),
    listarLabels: jest.fn(),
    criarLabel: jest.fn()
  };
}

function makeAlunoRepository() {
  return {
    findById: jest.fn()
  };
}

describe('SaudeMentalService', () => {
  let repository: ReturnType<typeof makeSaudeMentalRepository>;
  let alunoRepository: ReturnType<typeof makeAlunoRepository>;
  let service: SaudeMentalService;

  beforeEach(() => {
    repository = makeSaudeMentalRepository();
    alunoRepository = makeAlunoRepository();
    service = new SaudeMentalService(
      asMockedDependency<SaudeMentalRepository>(repository),
      asMockedDependency<AlunoRepository>(alunoRepository)
    );
  });

  it('lista prontuarios para perfil psicologo', async () => {
    repository.listar.mockResolvedValue([{ idHistorico: 1 }]);

    const result = await service.listar({ idAluno: 1 }, 'psicologo');

    expect(repository.listar).toHaveBeenCalledWith({ idAluno: 1 });
    expect(result).toEqual({ success: true, data: [{ idHistorico: 1 }] });
  });

  it('rejeita listagem de prontuarios para perfil nao autorizado', async () => {
    await expect(service.listar({}, 'gestor')).rejects.toThrow(
      'Registros de saude mental sao restritos ao perfil psicologo.'
    );
  });

  it('cria prontuario com payload valido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    repository.criar.mockResolvedValue({ idHistorico: 1 });

    const result = await service.criar(prontuarioPayload, 'psicologo');

    expect(repository.criar).toHaveBeenCalledWith(prontuarioPayload);
    expect(result).toEqual({ success: true, data: { idHistorico: 1 } });
  });

  it('rejeita prontuario para aluno inexistente', async () => {
    alunoRepository.findById.mockResolvedValue(null);

    await expect(service.criar(prontuarioPayload, 'psicologo')).rejects.toThrow(
      'Aluno nao encontrado para registro psicologico.'
    );
  });

  it('rejeita titulo invalido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...prontuarioPayload, titulo: 'Oi' }, 'psicologo')).rejects.toThrow(
      'O campo titulo deve ter pelo menos 3 caracteres.'
    );
  });

  it('rejeita observacao invalida', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...prontuarioPayload, observacao: 'Oi' }, 'psicologo')).rejects.toThrow(
      'O campo observacao deve ter pelo menos 5 caracteres.'
    );
  });

  it('lista labels para perfil psicologo', async () => {
    repository.listarLabels.mockResolvedValue([{ idLabel: 1 }]);

    const result = await service.listarLabels({ idPsi: 1 }, 'psicologo');

    expect(repository.listarLabels).toHaveBeenCalledWith({ idPsi: 1 });
    expect(result).toEqual({ success: true, data: [{ idLabel: 1 }] });
  });

  it('cria label com payload valido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    repository.criarLabel.mockResolvedValue({ idLabel: 1 });

    const result = await service.criarLabel(labelPayload, 'psicologo');

    expect(repository.criarLabel).toHaveBeenCalledWith(labelPayload);
    expect(result).toEqual({ success: true, data: { idLabel: 1 } });
  });

  it('rejeita tipo de label invalido', async () => {
    await expect(service.criarLabel({ ...labelPayload, tipoLabel: 'geral' }, 'psicologo')).rejects.toThrow(
      'Tipo de label invalido.'
    );
  });

  it('rejeita label para aluno inexistente', async () => {
    alunoRepository.findById.mockResolvedValue(null);

    await expect(service.criarLabel(labelPayload, 'psicologo')).rejects.toThrow(
      'Aluno nao encontrado para registro psicologico.'
    );
  });

  it('rejeita descricao de label invalida', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criarLabel({ ...labelPayload, descricao: 'Oi' }, 'psicologo')).rejects.toThrow(
      'O campo descricao deve ter pelo menos 3 caracteres.'
    );
  });
});
