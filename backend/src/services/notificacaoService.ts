import { AlunoRepository } from '../repositories/alunoRepository';
import { NotificacaoPayload, NotificacaoRepository, OportunidadePayload } from '../repositories/notificacaoRepository';
import { AppError, NotFoundError, PayloadValidationError } from '../utils/errors';
import { assertIsoDate } from '../utils/date';
import { requiredString } from '../utils/validators';

const TIPOS_NOTIFICACAO = ['alerta', 'informativo', 'convite', 'urgente', 'outro'];
const TIPOS_REMETENTE = ['membro_equipe', 'psicologo'];
const TIPOS_OPORTUNIDADE = ['emprego', 'estagio', 'curso', 'evento', 'bolsa', 'voluntariado', 'outro'];

export class NotificacaoService {
  constructor(
    private readonly repository: NotificacaoRepository,
    private readonly alunoRepository: AlunoRepository
  ) {}

  async listar(idAluno?: number) {
    return { success: true, data: await this.repository.listar(idAluno) };
  }

  async criar(payload: NotificacaoPayload, perfilChamador?: string) {
    const data = await this.validarNotificacao(payload, perfilChamador);
    return { success: true, data: await this.repository.criar(data) };
  }

  async listarOportunidades() {
    return { success: true, data: await this.repository.listarOportunidades() };
  }

  async criarOportunidade(payload: OportunidadePayload) {
    const titulo = requiredString(payload.titulo, 'titulo', 3);
    if (!TIPOS_OPORTUNIDADE.includes(payload.tipo)) {
      throw new PayloadValidationError('Tipo de oportunidade invalido.');
    }
    assertIsoDate(payload.prazoInscricao, 'prazoInscricao');
    return {
      success: true,
      data: await this.repository.criarOportunidade({ ...payload, titulo, descricao: payload.descricao?.trim() })
    };
  }

  private async validarNotificacao(payload: NotificacaoPayload, perfilChamador?: string): Promise<NotificacaoPayload> {
    const aluno = await this.alunoRepository.findById(Number(payload.idAluno));
    if (!aluno) {
      throw new NotFoundError('Aluno destinatario da notificacao nao encontrado.');
    }

    if (!TIPOS_NOTIFICACAO.includes(payload.tipo)) {
      throw new PayloadValidationError('Tipo de notificacao invalido.');
    }

    if (!TIPOS_REMETENTE.includes(payload.tipoRemetente)) {
      throw new PayloadValidationError('Tipo de remetente invalido.');
    }

    if (payload.tipoRemetente === 'psicologo' && perfilChamador !== 'psicologo') {
      throw new AppError('Apenas psicologos podem enviar notificacoes com remetente psicologo.', 403);
    }

    assertIsoDate(payload.dataEnvio, 'dataEnvio');

    return {
      ...payload,
      titulo: requiredString(payload.titulo, 'titulo', 3),
      mensagem: requiredString(payload.mensagem, 'mensagem', 5),
      nomeRemetente: requiredString(payload.nomeRemetente, 'nomeRemetente', 3)
    };
  }
}
