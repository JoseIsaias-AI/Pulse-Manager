import { PortalAlunoService } from '../../../backend/services/portalAlunoService';
import { AlunoRepository } from '../../../backend/repositories/alunoRepository';
import { NotificacaoRepository } from '../../../backend/repositories/notificacaoRepository';
import { asMockedDependency } from '../../helpers/mockHelper';

const aluno = {
  idAluno: 1,
  codigoPm: 'PM-2024-001',
  nome: 'Maria Silva',
  email: 'maria@email.com',
  telefone: '11999990000',
  curso: 'Tecnologia',
  status: 'ativo',
  nivelJornada: 'inicio'
};

function makeAlunoRepository() {
  return {
    findById: jest.fn(),
    updateContato: jest.fn()
  };
}

function makeNotificacaoRepository() {
  return {
    listar: jest.fn(),
    listarOportunidades: jest.fn()
  };
}

describe('PortalAlunoService', () => {
  let alunoRepository: ReturnType<typeof makeAlunoRepository>;
  let notificacaoRepository: ReturnType<typeof makeNotificacaoRepository>;
  let service: PortalAlunoService;

  beforeEach(() => {
    alunoRepository = makeAlunoRepository();
    notificacaoRepository = makeNotificacaoRepository();
    service = new PortalAlunoService(
      asMockedDependency<AlunoRepository>(alunoRepository),
      asMockedDependency<NotificacaoRepository>(notificacaoRepository)
    );
  });

  it('visualiza perfil resumido do aluno', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    const result = await service.visualizarPerfil(1, 1);

    expect(result).toEqual({
      success: true,
      data: {
        idAluno: 1,
        codigoPm: 'PM-2024-001',
        nome: 'Maria Silva',
        email: 'maria@email.com',
        telefone: '11999990000',
        curso: 'Tecnologia',
        status: 'ativo',
        nivelJornada: 'inicio'
      }
    });
  });

  it('rejeita visualizacao de aluno inexistente', async () => {
    alunoRepository.findById.mockResolvedValue(null);

    await expect(service.visualizarPerfil(999, 999)).rejects.toThrow('Aluno nao encontrado no portal.');
  });

  it('atualiza contato com email valido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    alunoRepository.updateContato.mockResolvedValue({ ...aluno, email: 'novo@email.com' });

    const result = await service.atualizarContato(1, { email: 'novo@email.com' }, 1);

    expect(alunoRepository.updateContato).toHaveBeenCalledWith(1, 'novo@email.com', undefined);
    expect(result.data).toEqual(expect.objectContaining({ email: 'novo@email.com' }));
  });

  it('atualiza contato com telefone informado', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    alunoRepository.updateContato.mockResolvedValue({ ...aluno, telefone: '11888880000' });

    await service.atualizarContato(1, { telefone: '11888880000' }, 1);

    expect(alunoRepository.updateContato).toHaveBeenCalledWith(1, undefined, '11888880000');
  });

  it('normaliza email antes da atualizacao', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    alunoRepository.updateContato.mockResolvedValue(aluno);

    await service.atualizarContato(1, { email: '  NOVO@EMAIL.COM  ' }, 1);

    expect(alunoRepository.updateContato).toHaveBeenCalledWith(1, 'novo@email.com', undefined);
  });

  it('trata telefone antes da atualizacao', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    alunoRepository.updateContato.mockResolvedValue(aluno);

    await service.atualizarContato(1, { telefone: '  11888880000  ' }, 1);

    expect(alunoRepository.updateContato).toHaveBeenCalledWith(1, undefined, '11888880000');
  });

  it('rejeita email invalido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.atualizarContato(1, { email: 'novo.email.com' }, 1)).rejects.toThrow(
      'O campo email deve conter um endereco valido.'
    );
  });

  it('rejeita atualizacao sem email e sem telefone', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.atualizarContato(1, {}, 1)).rejects.toThrow(
      'Informe email ou telefone para atualizar o contato.'
    );
  });

  it('lista notificacoes do proprio aluno', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    notificacaoRepository.listar.mockResolvedValue([{ idNotificacao: 1 }]);

    const result = await service.listarNotificacoes(1, 1);

    expect(notificacaoRepository.listar).toHaveBeenCalledWith(1);
    expect(result).toEqual({ success: true, data: [{ idNotificacao: 1 }] });
  });

  it('rejeita notificacoes quando usuario nao for informado', async () => {
    await expect(service.listarNotificacoes(1, undefined)).rejects.toThrow(
      'Acesso negado: voce so pode visualizar os seus proprios dados.'
    );
    expect(notificacaoRepository.listar).not.toHaveBeenCalled();
  });

  it('rejeita acesso a notificacoes de outro aluno', async () => {
    await expect(service.listarNotificacoes(1, 2)).rejects.toThrow(
      'Acesso negado: voce so pode visualizar os seus proprios dados.'
    );
  });

  it('rejeita listagem de notificacoes para aluno inexistente', async () => {
    alunoRepository.findById.mockResolvedValue(null);

    await expect(service.listarNotificacoes(999, 999)).rejects.toThrow('Aluno nao encontrado no portal.');
  });

  it('lista oportunidades disponiveis no portal', async () => {
    notificacaoRepository.listarOportunidades.mockResolvedValue([{ idOportunidade: 1 }]);

    const result = await service.listarOportunidades();

    expect(notificacaoRepository.listarOportunidades).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: [{ idOportunidade: 1 }] });
  });
});
