import { AgendaService } from '../../../backend/services/agendaService';
import { AgendaRepository } from '../../../backend/repositories/agendaRepository';
import { asMockedDependency } from '../../helpers/mockHelper';

const agenda = {
  idAgenda: 1,
  tipoUser: 'aluno',
  registro: 'Mentoria individual',
  data: '2024-05-10',
  horaInicio: '10:00',
  horaFim: '11:00',
  status: 1,
  idMembro: 1,
  idAluno: 1
};

function makeRepository() {
  return {
    listar: jest.fn(),
    criar: jest.fn(),
    atualizar: jest.fn(),
    cancelar: jest.fn()
  };
}

describe('AgendaService', () => {
  let repository: ReturnType<typeof makeRepository>;
  let service: AgendaService;

  beforeEach(() => {
    repository = makeRepository();
    service = new AgendaService(asMockedDependency<AgendaRepository>(repository));
  });

  it('lista agenda com filtros validos', async () => {
    const filtros = { idAluno: 1, idMembro: 2, dataInicio: '2024-05-01', dataFim: '2024-05-31' };
    repository.listar.mockResolvedValue([agenda]);

    const result = await service.listar(filtros);

    expect(repository.listar).toHaveBeenCalledWith(filtros);
    expect(result).toEqual({ success: true, data: [agenda] });
  });

  it('rejeita datas invalidas', async () => {
    await expect(service.listar({ dataInicio: '01/05/2024' })).rejects.toThrow(
      'O campo dataInicio deve estar no formato YYYY-MM-DD.'
    );
  });

  it('rejeita data final anterior a data inicial', async () => {
    await expect(service.listar({ dataInicio: '2024-05-10', dataFim: '2024-05-01' })).rejects.toThrow(
      'A dataFim nao pode ser anterior a dataInicio.'
    );
  });

  it('cria item de agenda para perfil gestor', async () => {
    repository.criar.mockResolvedValue(agenda);

    const result = await service.criar(
      { tipoUser: 'aluno', registro: 'Mentoria individual', data: '2024-05-10', idMembro: 1, idAluno: 1 },
      'gestor'
    );

    expect(repository.criar).toHaveBeenCalledWith(expect.objectContaining({ registro: 'Mentoria individual' }));
    expect(result).toEqual({ success: true, data: agenda });
  });

  it('rejeita criacao para perfil nao autorizado', async () => {
    await expect(
      service.criar({ tipoUser: 'aluno', registro: 'Mentoria individual', data: '2024-05-10', idMembro: 1, idAluno: 1 }, 'aluno')
    ).rejects.toThrow('Apenas usuarios com perfil gestor podem modificar a agenda.');
  });

  it('rejeita tipo de usuario invalido', async () => {
    await expect(
      service.criar({ tipoUser: 'psicologo', registro: 'Mentoria individual', data: '2024-05-10', idMembro: 1, idAluno: 1 }, 'gestor')
    ).rejects.toThrow('O campo tipoUser deve ser aluno ou membro_equipe.');
  });

  it('rejeita registro com menos de 3 caracteres', async () => {
    await expect(
      service.criar({ tipoUser: 'aluno', registro: 'Oi', data: '2024-05-10', idMembro: 1, idAluno: 1 }, 'gestor')
    ).rejects.toThrow('O campo registro deve ter pelo menos 3 caracteres.');
  });

  it('aplica status padrao quando nao informado', async () => {
    repository.criar.mockResolvedValue(agenda);

    await service.criar(
      { tipoUser: 'aluno', registro: 'Mentoria individual', data: '2024-05-10', idMembro: 1, idAluno: 1 },
      'gestor'
    );

    expect(repository.criar).toHaveBeenCalledWith(expect.objectContaining({ status: 1 }));
  });

  it('atualiza item de agenda existente', async () => {
    const atualizado = { ...agenda, registro: 'Mentoria atualizada' };
    repository.atualizar.mockResolvedValue(atualizado);

    const result = await service.atualizar(1, { registro: 'Mentoria atualizada' }, 'gestor');

    expect(repository.atualizar).toHaveBeenCalledWith(1, { registro: 'Mentoria atualizada' });
    expect(result).toEqual({ success: true, data: atualizado });
  });

  it('rejeita atualizacao de item inexistente', async () => {
    repository.atualizar.mockResolvedValue(null);

    await expect(service.atualizar(999, { registro: 'Mentoria atualizada' }, 'gestor')).rejects.toThrow(
      'Item de agenda nao encontrado.'
    );
  });

  it('cancela item de agenda existente', async () => {
    const cancelado = { ...agenda, status: 0 };
    repository.cancelar.mockResolvedValue(cancelado);

    const result = await service.cancelar(1, 'gestor');

    expect(repository.cancelar).toHaveBeenCalledWith(1);
    expect(result).toEqual({ success: true, data: cancelado });
  });

  it('rejeita cancelamento de item inexistente', async () => {
    repository.cancelar.mockResolvedValue(null);

    await expect(service.cancelar(999, 'gestor')).rejects.toThrow('Item de agenda nao encontrado.');
  });
});
