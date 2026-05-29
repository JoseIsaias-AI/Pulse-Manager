import { AgendaPayload, AgendaRepository } from '../repositories/agendaRepository';
import { BusinessRuleError, NotFoundError, PayloadValidationError } from '../utils/errors';
import { assertIsoDate } from '../utils/date';
import { requiredString } from '../utils/validators';

export class AgendaService {
  constructor(private readonly repository: AgendaRepository) {}

  async listar(filtros: { idAluno?: number; idMembro?: number; dataInicio?: string; dataFim?: string }) {
    assertIsoDate(filtros.dataInicio, 'dataInicio');
    assertIsoDate(filtros.dataFim, 'dataFim');
    if (filtros.dataInicio && filtros.dataFim && filtros.dataFim < filtros.dataInicio) {
      throw new BusinessRuleError('A dataFim nao pode ser anterior a dataInicio.');
    }
    return { success: true, data: await this.repository.listar(filtros) };
  }

  async criar(payload: AgendaPayload, perfil?: string) {
    this.exigirGestor(perfil);
    return { success: true, data: await this.repository.criar(this.validarPayload(payload)) };
  }

  async atualizar(idAgenda: number, payload: Partial<AgendaPayload>, perfil?: string) {
    this.exigirGestor(perfil);
    const atualizado = await this.repository.atualizar(idAgenda, payload);
    if (!atualizado) throw new NotFoundError('Item de agenda nao encontrado.');
    return { success: true, data: atualizado };
  }

  async cancelar(idAgenda: number, perfil?: string) {
    this.exigirGestor(perfil);
    const cancelado = await this.repository.cancelar(idAgenda);
    if (!cancelado) throw new NotFoundError('Item de agenda nao encontrado.');
    return { success: true, data: cancelado };
  }

  private validarPayload(payload: AgendaPayload): AgendaPayload {
    if (!['aluno', 'membro_equipe'].includes(payload.tipoUser)) {
      throw new PayloadValidationError('O campo tipoUser deve ser aluno ou membro_equipe.');
    }
    assertIsoDate(payload.data, 'data');
    return {
      ...payload,
      registro: requiredString(payload.registro, 'registro', 3),
      status: payload.status ?? 1
    };
  }

  private exigirGestor(perfil?: string): void {
    if (perfil !== 'gestor') {
      throw new BusinessRuleError('Apenas usuarios com perfil gestor podem modificar a agenda.');
    }
  }
}
