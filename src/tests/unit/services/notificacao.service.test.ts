import { NotificacaoService } from '../../../backend/services/notificacaoService';
import { AlunoRepository } from '../../../backend/repositories/alunoRepository';
import { NotificacaoRepository } from '../../../backend/repositories/notificacaoRepository';
import { asMockedDependency } from '../../helpers/mockHelper';

const aluno = { idAluno: 1, nome: 'Maria Silva' };
const notificacaoPayload = {
  titulo: 'Aviso importante',
  idAluno: 1,
  mensagem: 'Mensagem importante',
  tipo: 'informativo',
  idRemetente: 1,
  tipoRemetente: 'membro_equipe',
  nomeRemetente: 'Equipe Pulse',
  dataEnvio: '2024-05-10'
};

function makeNotificacaoRepository() {
  return {
    listar: jest.fn(),
    criar: jest.fn(),
    listarOportunidades: jest.fn(),
    criarOportunidade: jest.fn()
  };
}

function makeAlunoRepository() {
  return {
    findById: jest.fn()
  };
}

describe('NotificacaoService', () => {
  let notificacaoRepository: ReturnType<typeof makeNotificacaoRepository>;
  let alunoRepository: ReturnType<typeof makeAlunoRepository>;
  let service: NotificacaoService;

  beforeEach(() => {
    notificacaoRepository = makeNotificacaoRepository();
    alunoRepository = makeAlunoRepository();
    service = new NotificacaoService(
      asMockedDependency<NotificacaoRepository>(notificacaoRepository),
      asMockedDependency<AlunoRepository>(alunoRepository)
    );
  });

  it('lista todas as notificacoes', async () => {
    notificacaoRepository.listar.mockResolvedValue([{ idNotificacao: 1 }]);

    const result = await service.listar();

    expect(notificacaoRepository.listar).toHaveBeenCalledWith(undefined);
    expect(result).toEqual({ success: true, data: [{ idNotificacao: 1 }] });
  });

  it('lista notificacoes por aluno', async () => {
    notificacaoRepository.listar.mockResolvedValue([{ idNotificacao: 1, idAluno: 1 }]);

    await service.listar(1);

    expect(notificacaoRepository.listar).toHaveBeenCalledWith(1);
  });

  it('cria notificacao com payload valido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);
    notificacaoRepository.criar.mockResolvedValue({ idNotificacao: 1 });

    const result = await service.criar(notificacaoPayload);

    expect(notificacaoRepository.criar).toHaveBeenCalledWith(notificacaoPayload);
    expect(result).toEqual({ success: true, data: { idNotificacao: 1 } });
  });

  it('rejeita notificacao para aluno inexistente', async () => {
    alunoRepository.findById.mockResolvedValue(null);

    await expect(service.criar(notificacaoPayload)).rejects.toThrow(
      'Aluno destinatario da notificacao nao encontrado.'
    );
  });

  it('rejeita tipo de notificacao invalido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...notificacaoPayload, tipo: 'geral' })).rejects.toThrow(
      'Tipo de notificacao invalido.'
    );
  });

  it('rejeita tipo de remetente invalido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...notificacaoPayload, tipoRemetente: 'aluno' })).rejects.toThrow(
      'Tipo de remetente invalido.'
    );
  });

  it('rejeita remetente psicologo quando o perfil nao for psicologo', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...notificacaoPayload, tipoRemetente: 'psicologo' }, 'gestor')).rejects.toThrow(
      'Apenas psicologos podem enviar notificacoes com remetente psicologo.'
    );
  });

  it('rejeita data de envio invalida', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...notificacaoPayload, dataEnvio: '10/05/2024' })).rejects.toThrow(
      'O campo dataEnvio deve estar no formato YYYY-MM-DD.'
    );
  });

  it('rejeita titulo invalido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...notificacaoPayload, titulo: 'Oi' })).rejects.toThrow(
      'O campo titulo deve ter pelo menos 3 caracteres.'
    );
  });

  it('rejeita mensagem invalida', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...notificacaoPayload, mensagem: 'Oi' })).rejects.toThrow(
      'O campo mensagem deve ter pelo menos 5 caracteres.'
    );
  });

  it('rejeita nome do remetente invalido', async () => {
    alunoRepository.findById.mockResolvedValue(aluno);

    await expect(service.criar({ ...notificacaoPayload, nomeRemetente: 'Ed' })).rejects.toThrow(
      'O campo nomeRemetente deve ter pelo menos 3 caracteres.'
    );
  });

  it('lista oportunidades', async () => {
    notificacaoRepository.listarOportunidades.mockResolvedValue([{ idOportunidade: 1 }]);

    const result = await service.listarOportunidades();

    expect(notificacaoRepository.listarOportunidades).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: [{ idOportunidade: 1 }] });
  });

  it('cria oportunidade com payload valido', async () => {
    notificacaoRepository.criarOportunidade.mockResolvedValue({ idOportunidade: 1 });

    const result = await service.criarOportunidade({
      titulo: 'Vaga de estagio',
      descricao: 'Descricao da vaga',
      tipo: 'estagio',
      prazoInscricao: '2024-06-01',
      idMembro: 1
    });

    expect(result).toEqual({ success: true, data: { idOportunidade: 1 } });
  });

  it('rejeita tipo de oportunidade invalido', async () => {
    await expect(
      service.criarOportunidade({ titulo: 'Vaga', tipo: 'premio', idMembro: 1 })
    ).rejects.toThrow('Tipo de oportunidade invalido.');
  });

  it('trata titulo e descricao antes de criar oportunidade', async () => {
    notificacaoRepository.criarOportunidade.mockResolvedValue({ idOportunidade: 1 });

    await service.criarOportunidade({
      titulo: '  Vaga de estagio  ',
      descricao: '  Descricao da vaga  ',
      tipo: 'estagio',
      idMembro: 1
    });

    expect(notificacaoRepository.criarOportunidade).toHaveBeenCalledWith(
      expect.objectContaining({ titulo: 'Vaga de estagio', descricao: 'Descricao da vaga' })
    );
  });
});
